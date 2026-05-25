import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '../../utils/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM_EMAIL, PAYMENT_OPTIONS_HTML } from '../../lib/resend';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Service-role client for inserts that bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // 2. Parse Request
    const body = await request.json();
    const { client_name, client_email, description, amount } = body;

    if (!client_name || !client_email || !description || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Optionally initialize Paystack transaction
    let paymentUrl: string | null = null;
    let reference: string = `INV-${Date.now()}`;

    if (PAYSTACK_SECRET_KEY) {
      const amountInSmallestUnit = Math.round(parseFloat(amount) * 100);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: client_email,
          amount: amountInSmallestUnit,
          currency: 'GHS',
          callback_url: `${baseUrl}/booking/verify`,
          metadata: { client_name, description, is_custom_invoice: true }
        })
      });

      const paystackData = await paystackRes.json();
      if (paystackData.status) {
        paymentUrl = paystackData.data.authorization_url;
        reference = paystackData.data.reference;
      }
    }

    // 4. Save Invoice to Database (using admin client to bypass RLS)
    const { data: newInvoice, error: dbError } = await supabaseAdmin
      .from('invoices')
      .insert({
        client_name,
        client_email,
        description,
        amount: parseFloat(amount),
        payment_url: paymentUrl,
        reference: reference,
        status: 'pending',
        created_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert failed:', dbError);
      return NextResponse.json({ error: 'Failed to save invoice to database' }, { status: 500 });
    }

    // 5. Send invoice email via Resend
    try {
      const paystackSection = paymentUrl ? `
        <tr>
          <td style="padding: 0 24px 20px 24px; text-align: center;">
            <a href="${paymentUrl}" style="background-color: #ff5e00; color: #ffffff; padding: 12px 32px; border-radius: 9999px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 10px 25px rgba(255,94,0,0.35);">
              Pay Online via Paystack
            </a>
            <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
              Or copy this link: <span style="color:#0060cc; word-break: break-all;">${paymentUrl}</span>
            </p>
          </td>
        </tr>` : '';

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [client_email],
        subject: `Invoice & Receipt from Sabary Tours: ${description}`,
        html: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; background-color: #f5f7fb; padding: 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
              <tr>
                <td style="padding: 24px 24px 16px 24px; border-bottom: 4px solid #0060cc;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="vertical-align: top;">
                        <div style="font-weight: 700; font-size: 18px; color: #111827; margin-bottom: 4px;">Sabary Travel and Tours</div>
                        <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                          Greda Estate, 6th Avenue<br/>Accra, Ghana<br/>bookings@sabarytours.com<br/>+233 576 093 838
                        </div>
                      </td>
                      <td style="text-align: right; vertical-align: top;">
                        <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #0060cc; margin-bottom: 8px;">Invoice & Receipt</div>
                        <table cellpadding="0" cellspacing="0" style="font-size: 12px; color: #4b5563; margin-left: auto;">
                          <tr><td style="padding: 2px 8px;">Date:</td><td style="padding: 2px 0;">${new Date().toLocaleDateString()}</td></tr>
                          <tr><td style="padding: 2px 8px;">Invoice #:</td><td style="padding: 2px 0;">${reference}</td></tr>
                          <tr><td style="padding: 2px 8px;">Customer:</td><td style="padding: 2px 0;">${client_name}</td></tr>
                          <tr><td style="padding: 2px 8px;">Due date:</td><td style="padding: 2px 0;">Upon receipt</td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="vertical-align: top; padding-right: 16px;">
                        <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;">Bill To</div>
                        <div style="font-size: 14px; font-weight: 600; color: #111827;">${client_name}</div>
                        <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">${client_email}</div>
                      </td>
                      <td style="vertical-align: top; padding-left: 16px; border-left: 1px solid #e5e7eb;">
                        <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;">Invoice Details</div>
                        <div style="font-size: 13px; color: #374151; line-height: 1.6;">
                          <div><span style="color:#6b7280;">Description:</span> <strong>${description}</strong></div>
                          <div><span style="color:#6b7280;">Status:</span> <strong>Pending payment</strong></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 24px 20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-top: 1px solid #e5e7eb;">
                    <thead>
                      <tr>
                        <th align="left" style="padding: 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280;">Description</th>
                        <th align="right" style="padding: 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280;">Amount (GHS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="padding: 10px 0; font-size: 13px; color: #374151; border-top: 1px solid #e5e7eb;">
                          <div style="font-weight: 600;">${description}</div>
                          <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Custom invoice issued by Sabary Tours.</div>
                        </td>
                        <td style="padding: 10px 0; font-size: 13px; color: #111827; font-weight: 600; border-top: 1px solid #e5e7eb;" align="right">${parseFloat(amount).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 24px 20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td></td>
                      <td width="220" style="font-size: 13px; color: #374151;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                          <tr><td align="left" style="padding: 4px 0; color:#6b7280;">Subtotal</td><td align="right" style="padding: 4px 0;">GHS ${parseFloat(amount).toFixed(2)}</td></tr>
                          <tr><td align="left" style="padding: 4px 0; font-weight:700; border-top:1px solid #e5e7eb; padding-top:8px;">Total Due</td><td align="right" style="padding: 4px 0; font-weight:700; border-top:1px solid #e5e7eb; padding-top:8px;">GHS ${parseFloat(amount).toFixed(2)}</td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${paystackSection}
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  ${PAYMENT_OPTIONS_HTML}
                </td>
              </tr>
            </table>
            <p style="margin-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
              Thank you for choosing Sabary Tours. If you have any questions, please reply to this email.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Failed to send invoice email:", emailError);
    }

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
