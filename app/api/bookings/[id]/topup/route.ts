import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../../utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { createTopupPricingSignature } from "../../../../lib/serverBookingPricing";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("id, user_id, total_cost, amount_paid, package_name, customer_email, customer_name")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user_id && booking.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalCost = Number(booking.total_cost) ?? 0;
    const amountPaid = Number(booking.amount_paid) ?? 0;
    const remaining = totalCost - amountPaid;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "No balance due for this booking" },
        { status: 400 }
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const amountInPesewas = Math.round(remaining * 100);
    const topupSignature = createTopupPricingSignature(bookingId, amountInPesewas, PAYSTACK_SECRET_KEY);

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: booking.customer_email || user.email,
        amount: amountInPesewas,
        currency: "GHS",
        callback_url: `${baseUrl}/booking/verify`,
        metadata: {
          type: "booking_topup",
          booking_id: bookingId,
          expectedPesewas: amountInPesewas,
          pricingSignature: topupSignature,
          customerName: booking.customer_name,
          packageName: booking.package_name,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status || !paystackData.data?.authorization_url) {
      console.error("Paystack top-up init failed:", paystackData);
      return NextResponse.json(
        { error: "Failed to create payment link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      payment_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      amount: remaining,
    });
  } catch (err: unknown) {
    console.error("Top-up error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
