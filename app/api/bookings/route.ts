import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Save to Supabase
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        tour_id: body.tourId,
        // Using legacy_id or tour_id depending on database setup. We'll map what we have.
        legacy_id: typeof body.tourId === 'number' ? body.tourId : null,
        customer_name: `${body.firstName} ${body.lastName}`.trim(),
        customer_email: body.email,
        customer_phone: body.phone,
        package_name: body.package,
        number_of_people: body.numberOfPeople,
        tour_date: body.date,
        time_slot: body.timeSlot,
        pickup_location: body.pickupLocation,
        payment_reference: body.paymentReference,
        payment_option: body.paymentOption,
        voucher_code: body.voucherCode,
        voucher_discount: body.voucherDiscount,
        total_cost: body.totalPrice,
        amount_paid: body.paymentAmount,
        payment_status: "paid",
        booking_status: "confirmed"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // 2. Send Email via Mailchimp Transactional (Mandrill)
    // Note: To use Mailchimp Transactional, you need `MAILCHIMP_API_KEY` in .env.local
    if (process.env.MAILCHIMP_API_KEY) {
      try {
        const mailchimpRes = await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: process.env.MAILCHIMP_API_KEY,
            message: {
              from_email: "hello@sabarytours.com", // update with your verified sending domain
              from_name: "Sabary Tours",
              to: [{ email: body.email, name: body.firstName, type: "to" }],
              subject: `Booking Confirmed: ${body.tourSlug || "Tour"}`,
              html: `
                <h2>Hi ${body.firstName}, your booking is confirmed!</h2>
                <p>We're excited to host you. Here are your details:</p>
                <ul>
                  <li><strong>Date:</strong> ${body.date} at ${body.timeSlot}</li>
                  <li><strong>Guests:</strong> ${body.numberOfPeople}</li>
                  <li><strong>Pickup:</strong> ${body.pickupLocation}</li>
                  <li><strong>Total Paid:</strong> $${body.paymentAmount}</li>
                </ul>
                <p>If you have any questions, feel free to reply to this email.</p>
              `
            }
          })
        });

        const mailchimpData = await mailchimpRes.json();
        console.log("Mailchimp response:", mailchimpData);
      } catch (mcError) {
        console.error("Mailchimp Error:", mcError);
        // Don't throw here so the booking still succeeds even if email fails
      }
    } else {
      console.warn("MAILCHIMP_API_KEY is not set. Skipping email notification.");
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
