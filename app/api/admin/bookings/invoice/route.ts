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
              subject: `Invoice for your Booking: ${tour_name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <h2>Hello ${customer_name},</h2>
                  <p>Thank you for choosing Sabary Tours! We have reserved your spots.</p>
                  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #ff5e00;">Booking Details</h3>
                    <p><strong>Tour/Package:</strong> ${tour_name}</p>
                    <p><strong>Date:</strong> ${date} ${time_slot ? `at ${time_slot}` : ''}</p>
                    <p><strong>Guests:</strong> ${number_of_people}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
                    <p style="font-size: 18px; margin-bottom: 0;"><strong>Total Due: GHS ${parseFloat(total_cost).toFixed(2)}</strong></p>
                  </div>
                  <p>To finalize your booking, please securely pay your invoice online using the button below:</p>
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${paymentUrl}" style="background-color: #ff5e00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Pay Securely via Paystack</a>
                  </div>
                  <p>If you have any questions, please reply directly to this email.</p>
                  <p>We look forward to hosting you!<br><strong>The Sabary Tours Team</strong></p>
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
