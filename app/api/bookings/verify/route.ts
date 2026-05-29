import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing payment reference" }, { status: 400 });
    }

    // 1. Check if booking already exists
    const { data: existingBooking } = await supabaseAdmin
      .from("bookings")
      .select("id, payment_status")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (existingBooking) {
      // If already paid, nothing to do
      if (existingBooking.payment_status === "paid") {
        return NextResponse.json({ success: true, booking: existingBooking, note: "Already processed" });
      }

      // Booking exists but is still pending (e.g. walk-in invoice) — verify and mark paid
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (paystackSecretKey) {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: { Authorization: `Bearer ${paystackSecretKey}` },
        });
        const verifyData = await verifyRes.json();

        if (verifyData.status && verifyData.data.status === "success") {
          await supabaseAdmin
            .from("bookings")
            .update({ payment_status: "paid", booking_status: "confirmed", amount_paid: verifyData.data.amount / 100 })
            .eq("id", existingBooking.id);
        }
      }

      const { data: updated } = await supabaseAdmin
        .from("bookings")
        .select("id, payment_status")
        .eq("id", existingBooking.id)
        .single();

      return NextResponse.json({ success: true, booking: updated ?? existingBooking });
    }

    // 2. Verify with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json({ success: false, error: "Payment gateway configuration error" }, { status: 500 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ success: false, error: "Payment not successful" }, { status: 400 });
    }

    const { amount, customer, metadata } = verifyData.data;

    // 2b. Top-up: update existing booking instead of creating
    if (metadata?.type === "booking_topup" && metadata?.booking_id) {
      const bookingId = String(metadata.booking_id);
      const { data: existing } = await supabaseAdmin
        .from("bookings")
        .select("id, total_cost, amount_paid, payment_status")
        .eq("id", bookingId)
        .single();

      if (existing) {
        const totalCost = Number(existing.total_cost) ?? 0;
        const alreadyPaid = Number(existing.amount_paid) || 0;
        const paidNow = amount / 100;

        // If already fully paid, treat as idempotent
        if (alreadyPaid >= totalCost || existing.payment_status === "paid") {
          return NextResponse.json({
            success: true,
            booking: { id: bookingId },
            note: "Top-up already applied",
          });
        }

        // Log any suspicious underpayment without blocking the user
        const remainingBefore = totalCost - alreadyPaid;
        if (paidNow + 0.01 < remainingBefore) {
          console.warn(
            `[Verify] Top-up underpayment detected for booking ${bookingId}. Remaining=${remainingBefore}, paidNow=${paidNow}`
          );
        }

        const newAmountPaid = Math.min(totalCost, alreadyPaid + paidNow);
        const newStatus = newAmountPaid >= totalCost ? "paid" : "partial";

        const { error: updateErr } = await supabaseAdmin
          .from("bookings")
          .update({
            amount_paid: newAmountPaid,
            payment_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId);

        if (updateErr) {
          console.error("[Verify] Top-up update error:", updateErr);
          return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, booking: { id: bookingId }, note: "Top-up applied" });
      }
    }

    // 3. Create the booking
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        tour_id: typeof metadata?.tourId === "string" ? metadata.tourId : null,
        legacy_id: typeof metadata?.tourId === "number" ? metadata.tourId : null,
        user_id: metadata?.userId || null,
        customer_name: metadata?.customerName || customer?.first_name || "Guest",
        customer_email: customer?.email || metadata?.email || "",
        customer_phone: metadata?.customerPhone || customer?.phone || "",
        package_name: metadata?.packageName || "Tour",
        number_of_people: metadata?.numberOfPeople || 1,
        tour_date: metadata?.date || null,
        time_slot: metadata?.timeSlot || null,
        pickup_location: metadata?.pickupLocation || null,
        payment_reference: reference,
        payment_option: metadata?.paymentOption || "full",
        voucher_code: metadata?.voucherCode || null,
        total_cost: metadata?.totalCost || amount / 100,
        amount_paid: metadata?.paymentAmount || amount / 100,
        payment_status: "paid",
        booking_status: "confirmed",
      })
      .select()
      .single();

    if (error) {
      console.error("[Verify] Booking insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 4. Award Sabary Miles if userId exists
    if (metadata?.userId) {
      try {
        const totalCost = metadata.totalCost || amount / 100;
        const pointsEarned = Math.floor(totalCost / 10);
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("mileage_points")
          .eq("id", metadata.userId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({ mileage_points: (profile.mileage_points || 0) + pointsEarned })
            .eq("id", metadata.userId);
        }
      } catch (e) {
        console.error("[Verify] Points error:", e);
      }
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("[Verify] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
