import { NextResponse } from 'next/server';
import { resend, FROM_EMAIL, PAYMENT_OPTIONS_HTML } from '../../../../lib/resend';
import { buildEmailHtml } from '../../../../lib/emailTemplate';
import { escapeHtml } from '../../../../lib/bookingReceiptEmailHtml';
import { adminAuthErrorResponse, requireAdminPermission, supabaseAdmin } from '../../../../lib/adminAuth';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const auth = await requireAdminPermission("finance");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    // 2. Parse Request
    const body = await request.json();
    const { customer_name, customer_email, customer_phone, tour_id, tour_name, date, time_slot, number_of_people, total_cost, included_activities } = body;

    if (!customer_name || !customer_email || !date || !total_cost || !tour_name) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    // 3. Optionally initialize Paystack transaction
    let paymentUrl: string | null = null;
    let reference: string = `INV-${Date.now()}`;

    if (PAYSTACK_SECRET_KEY) {
      const amountInSmallestUnit = Math.round(parseFloat(total_cost) * 100);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: customer_email,
          amount: amountInSmallestUnit,
          currency: 'GHS',
          callback_url: `${baseUrl}/booking/verify`,
          metadata: {
            tourId: tour_id || null,
            customerName: customer_name,
            customerPhone: customer_phone,
            packageName: tour_name,
            numberOfPeople: parseInt(number_of_people) || 1,
            date,
            timeSlot: time_slot || null,
            totalCost: parseFloat(total_cost),
            paymentAmount: parseFloat(total_cost),
            is_walk_in_booking: true,
          }
        })
      });

      const paystackData = await paystackRes.json();
      if (paystackData.status) {
        paymentUrl = paystackData.data.authorization_url;
        reference = paystackData.data.reference;
      }
    }

    // 4. Save Booking to Database (using admin client to bypass RLS)
    const { data: newBooking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        tour_id: tour_id || null,
        customer_name,
        customer_email,
        customer_phone,
        package_name: tour_name,
        tour_date: date,
        time_slot: time_slot || null,
        number_of_people: parseInt(number_of_people) || 1,
        total_cost: parseFloat(total_cost),
        amount_paid: 0, // Unpaid — waiting for Paystack payment
        payment_status: 'pending',
        booking_status: 'pending',
        payment_reference: reference || null,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking database insert failed:', bookingError);
      return NextResponse.json({ error: 'Failed to save booking to database' }, { status: 500 });
    }

    // 5. Send invoice email via Resend (booking is tracked in bookings only — not duplicated to invoices)
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

      const invoiceBody = `
        <!-- Bill To / service details -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="vertical-align:top;padding-right:20px;width:50%;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Bill To</p>
              <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#111827;">${escapeHtml(customer_name)}</p>
              <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">${escapeHtml(customer_email)}</p>
              ${customer_phone ? `<p style="margin:0;font-size:13px;color:#6b7280;">${escapeHtml(customer_phone)}</p>` : ''}
            </td>
            <td style="vertical-align:top;padding-left:20px;border-left:3px solid #ff5e00;width:50%;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Service Details</p>
              <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Package:</span> <strong style="color:#111827;">${escapeHtml(tour_name)}</strong></p>
              <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Date:</span> <strong style="color:#111827;">${escapeHtml(date)}${time_slot ? ` at ${escapeHtml(time_slot)}` : ''}</strong></p>
              <p style="margin:0;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Guests:</span> <strong style="color:#111827;">${escapeHtml(String(number_of_people))}</strong></p>
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
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:14px 0;vertical-align:top;">
                <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#111827;">${escapeHtml(tour_name)}</p>
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  ${escapeHtml(String(number_of_people))} guest${parseInt(number_of_people) > 1 ? 's' : ''} &middot; ${escapeHtml(date)}${time_slot ? ` at ${escapeHtml(time_slot)}` : ''}
                </p>
                ${included_activities ? `<p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">${escapeHtml(included_activities)}</p>` : ''}
              </td>
              <td align="right" style="padding:14px 0;font-size:14px;font-weight:700;color:#111827;vertical-align:top;white-space:nowrap;">
                ${parseFloat(total_cost).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Total -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-left:auto;width:240px;margin-bottom:28px;">
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#6b7280;">Subtotal</td>
            <td align="right" style="padding:4px 0;font-size:13px;color:#6b7280;white-space:nowrap;">GHS ${parseFloat(total_cost).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:2px 0;"><hr style="border:none;border-top:2px solid #111827;margin:4px 0;" /></td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:15px;font-weight:700;color:#111827;">Total Due</td>
            <td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:#ff5e00;white-space:nowrap;">GHS ${parseFloat(total_cost).toFixed(2)}</td>
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
        to: [customer_email],
        subject: `Invoice from Sabary Tours: ${tour_name}`,
        html: buildEmailHtml({
          documentType: 'Invoice',
          metaRows: [
            { label: 'Invoice #', value: reference },
            { label: 'Date', value: new Date().toLocaleDateString() },
            { label: 'Customer', value: customer_name },
            { label: 'Due date', value: 'Upon receipt' },
          ],
          body: invoiceBody,
        }),
      }).then(({ error }) => {
        if (error) console.error('[Resend] Walk-in invoice email failed:', JSON.stringify(error));
      });
    } catch (emailError) {
      console.error('[Resend] Walk-in invoice email error:', emailError);
    }

    return NextResponse.json({ ...newBooking, payment_url: paymentUrl }, { status: 201 });
  } catch (error: unknown) {
    console.error('Walk-in Invoice Creation Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
