import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '../../../../utils/supabase/server';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const MAILCHIMP_TRANSACTIONAL_KEY = process.env.MAILCHIMP_TRANSACTIONAL_KEY;

// Service-role client for inserts that bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin User using server client (cookie-based auth)
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
    const { customer_name, customer_email, customer_phone, tour_id, tour_name, date, time_slot, number_of_people, total_cost, included_activities } = body;

    if (!customer_name || !customer_email || !date || !total_cost || !tour_name) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Paystack Secret Key is missing' }, { status: 500 });
    }

    // 3. Initialize Paystack Transaction
    const amountInSmallestUnit = Math.round(parseFloat(total_cost) * 100);
    const invoiceDescription = `Booking: ${tour_name} on ${date}`;
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

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return NextResponse.json({ error: 'Failed to generate payment link via Paystack.' }, { status: 500 });
    }

    const paymentUrl = paystackData.data.authorization_url;
    const reference = paystackData.data.reference;

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
        payment_reference: reference,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking database insert failed:', bookingError);
      return NextResponse.json({ error: 'Failed to save booking to database' }, { status: 500 });
    }

    // 5. Also Save as an Invoice for dual-tracking
    const { error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        client_name: customer_name,
        client_email: customer_email,
        description: invoiceDescription,
        amount: parseFloat(total_cost),
        payment_url: paymentUrl,
        reference: reference,
        status: 'pending',
        created_by: user.id
      });

    if (invoiceError) {
      console.error("Warning: Failed to dual-record into invoices table.", invoiceError);
    }

    // 6. Send Transactional Email via Mailchimp (Mandrill)
    if (MAILCHIMP_TRANSACTIONAL_KEY) {
      try {
        await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: MAILCHIMP_TRANSACTIONAL_KEY,
            message: {
              from_email: "bookings@sabarytours.com",
              from_name: "Sabary Travel and Tours",
              to: [{ email: customer_email, name: customer_name, type: "to" }],
              subject: `Invoice & Receipt for your Booking: ${tour_name}`,
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
                                Greda Estate, 6th Avenue<br/>
                                Accra, Ghana<br/>
                                bookings@sabarytours.com<br/>
                                +233 576 093 838
                              </div>
                            </td>
                            <td style="text-align: right; vertical-align: top;">
                              <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #0060cc; margin-bottom: 8px;">Invoice & Receipt</div>
                              <table cellpadding="0" cellspacing="0" style="font-size: 12px; color: #4b5563; margin-left: auto;">
                                <tr>
                                  <td style="padding: 2px 8px;">Date:</td>
                                  <td style="padding: 2px 0;">${new Date().toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 2px 8px;">Invoice #:</td>
                                  <td style="padding: 2px 0;">${reference}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 2px 8px;">Receipt #:</td>
                                  <td style="padding: 2px 0;">RCPT-${reference}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 2px 8px;">Customer:</td>
                                  <td style="padding: 2px 0;">${customer_name}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 2px 8px;">Due date:</td>
                                  <td style="padding: 2px 0;">Upon receipt</td>
                                </tr>
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
                              <div style="font-size: 14px; font-weight: 600; color: #111827;">${customer_name}</div>
                              <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">${customer_email}</div>
                              ${customer_phone ? `<div style="font-size: 13px; color: #6b7280; margin-top: 2px;">${customer_phone}</div>` : ""}
                            </td>
                            <td style="vertical-align: top; padding-left: 16px; border-left: 1px solid #e5e7eb;">
                              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;">Booking Details</div>
                              <div style="font-size: 13px; color: #374151; line-height: 1.6;">
                                <div><span style="color:#6b7280;">Tour / Package:</span> <strong>${tour_name}</strong></div>
                                <div><span style="color:#6b7280;">Date:</span> <strong>${date}${time_slot ? ` at ${time_slot}` : ""}</strong></div>
                                <div><span style="color:#6b7280;">Guests:</span> <strong>${number_of_people}</strong></div>
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
                                <div style="font-weight: 600;">${tour_name}</div>
                                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                                  Tour booking for ${number_of_people} guest${parseInt(number_of_people) > 1 ? "s" : ""} on ${date}${time_slot ? ` at ${time_slot}` : ""}.
                                </div>
                                ${
                                  included_activities
                                    ? `<div style="font-size: 12px; color: #6b7280; margin-top: 6px;">${included_activities}</div>`
                                    : ""
                                }
                              </td>
                              <td style="padding: 10px 0; font-size: 13px; color: #111827; font-weight: 600; border-top: 1px solid #e5e7eb;" align="right">
                                ${parseFloat(total_cost).toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 24px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                          <tr>
                            <td></td>
                            <td width="220" style="font-size: 13px; color: #374151;">
                              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                  <td align="left" style="padding: 4px 0; color:#6b7280;">Subtotal</td>
                                  <td align="right" style="padding: 4px 0;">GHS ${parseFloat(total_cost).toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td align="left" style="padding: 4px 0; font-weight:700; border-top:1px solid #e5e7eb; padding-top:8px;">Total Due</td>
                                  <td align="right" style="padding: 4px 0; font-weight:700; border-top:1px solid #e5e7eb; padding-top:8px;">GHS ${parseFloat(total_cost).toFixed(2)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 28px 24px; text-align: center;">
                        <a href="${paymentUrl}" style="background-color: #ff5e00; color: #ffffff; padding: 12px 32px; border-radius: 9999px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 10px 25px rgba(255,94,0,0.35);">
                          Pay Securely via Paystack
                        </a>
                        <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
                          If the button does not work, copy and paste this link into your browser:<br/>
                          <span style="color:#0060cc; word-break: break-all;">${paymentUrl}</span>
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
                    Thank you for traveling with Sabary Tours. If you have any questions about this invoice, please reply to this email.
                  </p>
                </div>
              `
            }
          })
        });
      } catch (emailError) {
        console.error("Failed to send walk-in invoice email:", emailError);
      }
    }

    return NextResponse.json({ ...newBooking, payment_url: paymentUrl }, { status: 201 });
  } catch (error: any) {
    console.error('Walk-in Invoice Creation Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
