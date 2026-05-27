import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '../../utils/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM_EMAIL, PAYMENT_OPTIONS_HTML } from '../../lib/resend';
import { buildEmailHtml } from '../../lib/emailTemplate';
import { escapeHtml } from '../../lib/bookingReceiptEmailHtml';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Service-role client for inserts that bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type LineItem = { description: string; amount: number };

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin User
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse Request — support both new line_items[] and legacy description+amount
    const body = await request.json();
    const {
      client_name,
      client_email,
      line_items,
      // legacy single-item support
      description: legacyDescription,
      amount: legacyAmount,
    } = body;

    if (!client_name || !client_email) {
      return NextResponse.json({ error: 'client_name and client_email are required' }, { status: 400 });
    }

    let lineItems: LineItem[];
    if (Array.isArray(line_items) && line_items.length > 0) {
      lineItems = line_items
        .map((item: Record<string, unknown>) => ({
          description: String(item.description || '').trim(),
          amount: parseFloat(String(item.amount)) || 0,
        }))
        .filter((item) => item.description && item.amount > 0);
    } else if (legacyDescription && legacyAmount) {
      lineItems = [{ description: String(legacyDescription).trim(), amount: parseFloat(legacyAmount) }];
    } else {
      return NextResponse.json(
        { error: 'Provide at least one line item with a description and amount' },
        { status: 400 }
      );
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'All line items must have a description and a positive amount' }, { status: 400 });
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
    // Store line items as JSON so the detail page can render them individually
    const descriptionForDB = JSON.stringify(lineItems);
    // Human-readable summary for Paystack metadata / list fallback
    const summaryDescription =
      lineItems.length === 1
        ? lineItems[0].description
        : `${lineItems[0].description} (+${lineItems.length - 1} more)`;

    // 3. Optionally initialize Paystack transaction
    let paymentUrl: string | null = null;
    let reference: string = `INV-${Date.now()}`;

    if (PAYSTACK_SECRET_KEY) {
      const amountInSmallestUnit = Math.round(totalAmount * 100);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: client_email,
          amount: amountInSmallestUnit,
          currency: 'GHS',
          callback_url: `${baseUrl}/booking/verify`,
          metadata: { client_name, description: summaryDescription, is_custom_invoice: true },
        }),
      });

      const paystackData = await paystackRes.json();
      if (paystackData.status) {
        paymentUrl = paystackData.data.authorization_url;
        reference = paystackData.data.reference;
      }
    }

    // 4. Save Invoice to Database
    const { data: newInvoice, error: dbError } = await supabaseAdmin
      .from('invoices')
      .insert({
        client_name,
        client_email,
        description: descriptionForDB,
        amount: totalAmount,
        payment_url: paymentUrl,
        reference,
        status: 'pending',
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert failed:', dbError);
      return NextResponse.json({ error: 'Failed to save invoice to database' }, { status: 500 });
    }

    // 5. Send invoice email via Resend
    try {
      const paystackButton = paymentUrl
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
            <tr>
              <td align="center">
                <a href="${paymentUrl}"
                   style="display:inline-block;background-color:#ff5e00;color:#ffffff;padding:14px 36px;border-radius:9999px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                  Pay Online via Paystack
                </a>
                <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;">
                  Or copy: <a href="${paymentUrl}" style="color:#0060cc;word-break:break-all;">${paymentUrl}</a>
                </p>
              </td>
            </tr>
          </table>`
        : '';

      // Build one row per line item
      const lineItemRowsHtml = lineItems
        .map(
          (item) => `
          <tr style="border-top:1px solid #e5e7eb;">
            <td style="padding:12px 0;vertical-align:top;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">${escapeHtml(item.description)}</p>
            </td>
            <td align="right" style="padding:12px 0;font-size:14px;font-weight:700;color:#111827;vertical-align:top;white-space:nowrap;">
              ${item.amount.toFixed(2)}
            </td>
          </tr>`
        )
        .join('');

      const invoiceBody = `
        <!-- Bill To / Invoice Details -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="vertical-align:top;padding-right:20px;width:50%;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Bill To</p>
              <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#111827;">${escapeHtml(client_name)}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">${escapeHtml(client_email)}</p>
            </td>
            <td style="vertical-align:top;padding-left:20px;border-left:3px solid #ff5e00;width:50%;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Invoice Details</p>
              <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Items:</span> <strong style="color:#111827;">${lineItems.length} line item${lineItems.length > 1 ? 's' : ''}</strong></p>
              <p style="margin:0;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Status:</span> <strong style="color:#dc2626;">Pending payment</strong></p>
            </td>
          </tr>
        </table>

        <!-- Line items -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px solid #111827;margin-bottom:20px;">
          <thead>
            <tr>
              <th align="left" style="padding:10px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Description</th>
              <th align="right" style="padding:10px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Amount (GHS)</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemRowsHtml}
          </tbody>
        </table>

        <!-- Total -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-left:auto;width:240px;margin-bottom:28px;">
          ${lineItems.length > 1 ? `
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#6b7280;">Subtotal</td>
            <td align="right" style="padding:4px 0;font-size:13px;color:#6b7280;white-space:nowrap;">GHS ${totalAmount.toFixed(2)}</td>
          </tr>` : ''}
          <tr>
            <td colspan="2" style="padding:2px 0;"><hr style="border:none;border-top:2px solid #111827;margin:4px 0;" /></td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:15px;font-weight:700;color:#111827;">Total Due</td>
            <td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:#ff5e00;white-space:nowrap;">GHS ${totalAmount.toFixed(2)}</td>
          </tr>
        </table>

        ${paystackButton}

        <!-- Payment options -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="border-top:1px solid #e5e7eb;padding-top:20px;">
          <tr>
            <td>
              <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Other payment options</p>
              ${PAYMENT_OPTIONS_HTML}
            </td>
          </tr>
        </table>
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [client_email],
        subject: `Invoice from Sabary Tours: ${summaryDescription}`,
        html: buildEmailHtml({
          documentType: 'Invoice &amp; Receipt',
          metaRows: [
            { label: 'Invoice #', value: reference },
            { label: 'Date', value: new Date().toLocaleDateString() },
            { label: 'Customer', value: client_name },
            { label: 'Due date', value: 'Upon receipt' },
          ],
          body: invoiceBody,
        }),
      }).then(({ error }) => {
        if (error) console.error('[Resend] Invoice email failed:', JSON.stringify(error));
      });
    } catch (emailError) {
      console.error('[Resend] Invoice email error:', emailError);
    }

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: unknown) {
    console.error('Invoice Creation Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Authenticate Admin User
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch Invoices using admin client
    const { data: invoices, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(invoices || [], { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
