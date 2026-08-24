import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../../utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import {
  buildOfflinePaymentReceiptEmailHtml,
  formatBookingReceiptNumber,
} from "../../../../lib/bookingReceiptEmailHtml";
import { resend, FROM_EMAIL } from "../../../../lib/resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!['admin', 'owner'].includes(profile?.role || '')) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const booking_id = body.booking_id as string | undefined;
    const payment_method = String(body.payment_method || "").trim();
    const payment_reference =
      typeof body.payment_reference === "string" ? body.payment_reference.trim() || null : null;
    const update_booking_payment = body.update_booking_payment !== false;
    const send_email = body.send_email !== false;

    let amount_received = Number(body.amount_received);
    if (!booking_id) {
      return NextResponse.json({ success: false, error: "booking_id is required" }, { status: 400 });
    }
    if (!payment_method) {
      return NextResponse.json({ success: false, error: "payment_method is required" }, { status: 400 });
    }
    if (!Number.isFinite(amount_received) || amount_received <= 0) {
      return NextResponse.json(
        { success: false, error: "amount_received must be a positive number" },
        { status: 400 }
      );
    }

    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from("bookings")
      .select("*, tours(title)")
      .eq("id", booking_id)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const totalCost = Number(booking.total_cost ?? 0);
    const previouslyPaid = Number(booking.amount_paid ?? 0);
    const balance = Math.max(totalCost - previouslyPaid, 0);
    const applied = Math.min(amount_received, balance);
    const capped = applied < amount_received - 0.0001;
    const newPaid = update_booking_payment ? previouslyPaid + applied : previouslyPaid;
    const balanceDue = Math.max(totalCost - newPaid, 0);
    const issued = new Date();
    const receiptNumber = formatBookingReceiptNumber(booking.id, issued);

    const tourName =
      (booking.tours as { title?: string } | null)?.title || booking.package_name || "Tour booking";
    const tourDateRaw = booking.tour_date || "";
    const tourDateLabel =
      typeof tourDateRaw === "string" && tourDateRaw
        ? new Date(tourDateRaw + (tourDateRaw.length <= 10 ? "T12:00:00" : "")).toLocaleDateString()
        : String(tourDateRaw || "—");

    if (update_booking_payment) {
      let payment_status: string = booking.payment_status || "pending";
      if (balanceDue <= 0.009) payment_status = "paid";
      else if (newPaid > 0) payment_status = "partial";

      const updatePayload: Record<string, unknown> = {
        amount_paid: Math.round(newPaid * 100) / 100,
        payment_status,
      };
      if (payment_reference) {
        updatePayload.payment_reference = payment_reference;
      }

      const { error: upErr } = await supabaseAdmin.from("bookings").update(updatePayload).eq("id", booking_id);
      if (upErr) {
        console.error("Receipt booking update failed:", upErr);
        return NextResponse.json({ success: false, error: upErr.message }, { status: 500 });
      }
    }

    const customerName = String(booking.customer_name || "").trim() || "Customer";
    const customerEmail = String(booking.customer_email || "").trim();
    if (!customerEmail) {
      return NextResponse.json({ success: false, error: "Booking has no customer email" }, { status: 400 });
    }

    const currency = String(booking.currency || "GHS");

    const amountReceivedDisplay = update_booking_payment ? applied : amount_received;
    const newPaidDisplay = update_booking_payment ? newPaid : previouslyPaid;
    const balanceDisplay = update_booking_payment
      ? balanceDue
      : Math.max(totalCost - previouslyPaid, 0);

    const html = buildOfflinePaymentReceiptEmailHtml({
      customerName,
      customerEmail,
      customerPhone: booking.customer_phone,
      tourName,
      tourDate: tourDateLabel,
      timeSlot: booking.time_slot,
      numberOfPeople: Number(booking.number_of_people ?? 1),
      includedActivities:
        (booking as Record<string, unknown>).included_activities != null
          ? String((booking as Record<string, unknown>).included_activities)
          : null,
      currency,
      totalCost,
      amountPreviouslyPaid: previouslyPaid,
      amountReceived: amountReceivedDisplay,
      newAmountPaid: newPaidDisplay,
      balanceDue: balanceDisplay,
      paymentMethod: payment_method,
      paymentReference: payment_reference,
      receiptNumber,
      issuedDateLabel: issued.toLocaleDateString(),
    });

    let email_sent = false;
    if (send_email) {
      try {
        const { error: emailError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: [customerEmail],
          subject: `Payment receipt — ${tourName} (${receiptNumber})`,
          html,
        });
        if (emailError) {
          console.error("[Resend] Receipt email failed:", JSON.stringify(emailError));
        } else {
          email_sent = true;
        }
      } catch (e) {
        console.error("[Resend] Receipt email error:", e);
      }
    }

    const { data: fresh } = await supabaseAdmin
      .from("bookings")
      .select("*, tours(title)")
      .eq("id", booking_id)
      .single();

    return NextResponse.json({
      success: true,
      receipt_number: receiptNumber,
      email_sent,
      amount_applied: update_booking_payment ? applied : 0,
      amount_capped: capped,
      booking: fresh || booking,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("POST /api/admin/bookings/receipt:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
