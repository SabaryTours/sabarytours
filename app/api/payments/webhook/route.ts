import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

// Service-role admin client for bypassing RLS in webhook context
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!PAYSTACK_SECRET_KEY || !signature) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify Paystack Signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Only process charge.success events
    if (event.event === 'charge.success') {
      const { reference, amount, customer, metadata } = event.data;

      console.log(`[Webhook] Processing successful payment: ${reference}`);

      // Top-up: update existing booking
      if (metadata?.type === 'booking_topup' && metadata?.booking_id) {
        const bookingId = String(metadata.booking_id);
        const { data: existing } = await supabaseAdmin
          .from('bookings')
          .select('id, total_cost, amount_paid, payment_status')
          .eq('id', bookingId)
          .single();

        if (existing) {
          const totalCost = Number(existing.total_cost) ?? 0;
          const alreadyPaid = Number(existing.amount_paid) || 0;
          const paidNow = amount / 100;

          // If already fully paid, make this idempotent
          if (alreadyPaid >= totalCost || existing.payment_status === 'paid') {
            console.log(`[Webhook] Top-up already applied for booking ${bookingId}`);
            return NextResponse.json({ message: 'Top-up already applied' }, { status: 200 });
          }

          const remainingBefore = totalCost - alreadyPaid;
          if (paidNow + 0.01 < remainingBefore) {
            console.warn(
              `[Webhook] Top-up underpayment detected for booking ${bookingId}. Remaining=${remainingBefore}, paidNow=${paidNow}`
            );
          }

          const newAmountPaid = Math.min(totalCost, alreadyPaid + paidNow);
          const newStatus = newAmountPaid >= totalCost ? 'paid' : 'partial';

          const { error: updateErr } = await supabaseAdmin
            .from('bookings')
            .update({
              amount_paid: newAmountPaid,
              payment_status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

          if (updateErr) {
            console.error(`[Webhook] Top-up update failed for ${bookingId}:`, updateErr);
            return NextResponse.json({ message: 'Update error' }, { status: 500 });
          }
          console.log(`[Webhook] Top-up applied for booking ${bookingId}`);
          return NextResponse.json({ message: 'Top-up processed' }, { status: 200 });
        }
      }

      // Check if booking already exists (from frontend callback race condition)
      const { data: existingBooking } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('payment_reference', reference)
        .maybeSingle();

      if (existingBooking) {
        console.log(`[Webhook] Booking ${reference} already processed.`);
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }

      // If it doesn't exist, process it!
      if (!metadata || !metadata.tourId) {
        console.warn(`[Webhook] Missing metadata for reference ${reference}. Cannot create booking.`);
        return NextResponse.json({ message: 'Missing metadata' }, { status: 200 });
      }

      // 1. Create booking in Supabase
      const { data: newBooking, error: insertError } = await supabaseAdmin
        .from('bookings')
        .insert({
          tour_id: typeof metadata.tourId === 'string' ? metadata.tourId : null,
          legacy_id: typeof metadata.tourId === 'number' ? metadata.tourId : null,
          user_id: metadata.userId || null,
          customer_name: metadata.customerName || customer.first_name || 'Guest',
          customer_email: customer.email,
          customer_phone: metadata.customerPhone || customer.phone || '',
          package_name: metadata.packageName || 'Unknown Tour',
          number_of_people: metadata.numberOfPeople || 1,
          tour_date: metadata.date,
          time_slot: metadata.timeSlot || null,
          pickup_location: metadata.pickupLocation || null,
          payment_reference: reference,
          payment_option: metadata.paymentOption || 'full',
          voucher_code: metadata.voucherCode || null,
          total_cost: metadata.totalCost || (amount / 100),
          amount_paid: metadata.paymentAmount || (amount / 100),
          payment_status: 'paid',
          booking_status: 'confirmed'
        })
        .select()
        .single();

      if (insertError) {
        console.error(`[Webhook] Database insert failed for ${reference}:`, insertError);
        return NextResponse.json({ message: 'Database error' }, { status: 500 });
      }

      console.log(`[Webhook] Successfully created booking for ${reference}`);

      // Optional email notification
      if (process.env.MAILCHIMP_API_KEY) {
        try {
          await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: process.env.MAILCHIMP_API_KEY,
              message: {
                from_email: "bookings@sabarytours.com",
                from_name: "Sabary Travel and Tours",
                to: [{ email: customer.email, type: "to" }],
                subject: `Booking Confirmed: ${metadata.packageName}`,
                html: `<h2>Your booking is confirmed!</h2><p>Reference: ${reference}</p>`
              }
            })
          });
        } catch (e) {
          console.log("Email failed in webhook but booking succeeded");
        }
      }

      return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
    }

    // Ignore other events
    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
