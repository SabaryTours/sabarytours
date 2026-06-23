import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM_EMAIL } from '../../../lib/resend';
import { buildBookingConfirmationEmailHtml } from '../../../lib/bookingReceiptEmailHtml';
import { sendBookingAdminNotification } from '../../../lib/sendBookingAdminNotification';
import { verifyTopupPricingSignature } from '../../../lib/serverBookingPricing';
import { markInvoicePaidByReference } from '../../../lib/invoicePayment';
import { applyBookingSeatDeduction, loadBookingForSeatDeduction } from '../../../lib/tourSeats';

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
        const expectedPesewas = Number(metadata.expectedPesewas);
        const topupSignatureValid =
          Number.isFinite(expectedPesewas) &&
          verifyTopupPricingSignature(
            bookingId,
            expectedPesewas,
            metadata.pricingSignature,
            PAYSTACK_SECRET_KEY,
          );

        if (!topupSignatureValid || amount !== expectedPesewas) {
          console.warn(`[Webhook] Rejected invalid top-up transaction for booking ${bookingId}`);
          return NextResponse.json({ message: 'Invalid top-up amount' }, { status: 200 });
        }

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

      const invoiceResult = await markInvoicePaidByReference(supabaseAdmin, reference, amount, {
        sendReceiptEmail: true,
      });
      if (invoiceResult.ok) {
        console.log(`[Webhook] Invoice ${reference} marked paid.`);
        return NextResponse.json({ message: 'Invoice processed' }, { status: 200 });
      }
      if (invoiceResult.reason !== 'not_found') {
        console.warn(`[Webhook] Invoice ${reference} failed:`, invoiceResult.reason);
      }

      // Check if booking already exists (race condition or walk-in pending invoice)
      const { data: existingBooking } = await supabaseAdmin
        .from('bookings')
        .select('id, payment_status')
        .eq('payment_reference', reference)
        .maybeSingle();

      if (existingBooking) {
        if (existingBooking.payment_status === 'paid') {
          const fullBooking = await loadBookingForSeatDeduction(supabaseAdmin, existingBooking.id);
          if (fullBooking) {
            await applyBookingSeatDeduction(supabaseAdmin, fullBooking);
          }
          console.log(`[Webhook] Booking ${reference} already paid.`);
          return NextResponse.json({ message: 'Already processed' }, { status: 200 });
        }

        await supabaseAdmin
          .from('bookings')
          .update({ payment_status: 'paid', booking_status: 'confirmed', amount_paid: amount / 100 })
          .eq('id', existingBooking.id);

        const fullBooking = await loadBookingForSeatDeduction(supabaseAdmin, existingBooking.id);
        if (fullBooking) {
          await applyBookingSeatDeduction(supabaseAdmin, fullBooking);
        }

        console.log(`[Webhook] Updated pending booking ${existingBooking.id} to paid.`);
        return NextResponse.json({ message: 'Pending booking updated to paid' }, { status: 200 });
      }

      // If it doesn't exist, process it!
      if (!metadata || !metadata.tourId) {
        console.warn(`[Webhook] Missing metadata for reference ${reference}. Cannot create booking.`);
        return NextResponse.json({ message: 'Missing metadata' }, { status: 200 });
      }

      const tourId = String(metadata.tourId).trim();

      // 1. Create booking in Supabase
      const { data: newBooking, error: insertError } = await supabaseAdmin
        .from('bookings')
        .insert({
          tour_id: tourId || null,
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

      await applyBookingSeatDeduction(supabaseAdmin, {
        id: newBooking.id,
        tour_id: newBooking.tour_id,
        number_of_people: newBooking.number_of_people,
        booking_status: newBooking.booking_status,
        payment_reference: newBooking.payment_reference,
        payment_status: newBooking.payment_status,
        seats_applied: newBooking.seats_applied,
      });

      const tourDateRaw = metadata.date || "";
      const tourDateLabel = tourDateRaw
        ? new Date(tourDateRaw + (tourDateRaw.length <= 10 ? "T12:00:00" : "")).toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })
        : tourDateRaw;
      const totalCost = metadata.totalCost || (amount / 100);
      const amountPaid = metadata.paymentAmount || (amount / 100);
      const paymentOption = metadata.paymentOption === "deposit" ? "deposit" : "full";

      // Send confirmation email via Resend
      try {
        const { error: emailError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: [customer.email],
          subject: `Booking Confirmed — ${metadata.packageName || "Your Tour"}`,
          html: buildBookingConfirmationEmailHtml({
            customerName: metadata.customerName || customer.first_name || "Guest",
            customerEmail: customer.email,
            tourName: metadata.packageName || "Tour booking",
            tourDate: tourDateLabel,
            timeSlot: metadata.timeSlot || null,
            numberOfPeople: metadata.numberOfPeople || 1,
            pickupLocation: metadata.pickupLocation || null,
            paymentReference: reference,
            paymentOption,
            amountPaid,
            totalCost,
            currency: "GHS",
            bookingId: newBooking.id,
          }),
        });
        if (emailError) console.error("[Resend] Webhook confirmation email failed:", emailError);
      } catch (emailErr) {
        console.error("[Resend] Webhook confirmation email error:", emailErr);
      }

      try {
        await sendBookingAdminNotification({
          customerName: metadata.customerName || customer.first_name || "Guest",
          customerEmail: customer.email,
          customerPhone: metadata.customerPhone || customer.phone || "",
          tourName: metadata.packageName || "Tour booking",
          tourDate: tourDateLabel,
          timeSlot: metadata.timeSlot || null,
          numberOfPeople: metadata.numberOfPeople || 1,
          pickupLocation: metadata.pickupLocation || null,
          paymentReference: reference,
          paymentOption,
          amountPaid,
          totalCost,
          currency: "GHS",
          bookingId: newBooking.id,
        });
      } catch (notifyErr) {
        console.error("[Resend] Webhook admin notification error:", notifyErr);
      }

      return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
    }

    // Ignore other events
    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });

  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}
