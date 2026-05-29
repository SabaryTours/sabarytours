import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { bookingSchema } from "../../lib/validations/booking";
import { resend, FROM_EMAIL } from "../../lib/resend";
import { buildBookingConfirmationEmailHtml } from "../../lib/bookingReceiptEmailHtml";
import {
  computeExpectedBookingPricing,
  normalizeTierSelections,
  stableStringify,
  verifyBookingPricingSignature,
} from "../../lib/serverBookingPricing";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const bookingRateLimitStore = new Map<string, { count: number; resetAt: number }>();
const PRICE_TOLERANCE = 0.5;

function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const cfIp = request.headers.get("cf-connecting-ip");
  return (cfIp || forwardedFor?.split(",")[0]?.trim() || "unknown").trim();
}

function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}

function isRateLimitedInMemory(key: string): { limited: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const current = bookingRateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    bookingRateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { limited: true, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  bookingRateLimitStore.set(key, current);
  return { limited: false };
}

async function logSecurityEvent(params: {
  eventType: string;
  ip: string;
  userAgent: string;
  detail: string;
  payload?: Record<string, unknown>;
}) {
  const { eventType, ip, userAgent, detail, payload } = params;
  console.warn(`[booking-security] ${eventType}: ${detail}`, { ip, userAgent, payload });

  const { error } = await supabaseAdmin.from("booking_security_events").insert({
    event_type: eventType,
    ip_address: ip,
    user_agent: userAgent,
    detail,
    metadata: payload || {},
  });

  if (error) {
    // Table might not exist yet; keep security checks non-blocking.
    console.warn("Failed to persist security event", { eventType, error: error.message });
  }
}

async function isRateLimitedPersistent(key: string): Promise<{ limited: boolean; retryAfterSec?: number }> {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const resetAt = now + RATE_LIMIT_WINDOW_MS;
  const resetAtIso = new Date(resetAt).toISOString();

  const { data, error } = await supabaseAdmin
    .from("api_rate_limits")
    .select("id, count, reset_at")
    .eq("id", key)
    .maybeSingle();

  if (error) {
    return isRateLimitedInMemory(key);
  }

  if (!data || !data.reset_at || new Date(data.reset_at).getTime() <= now) {
    await supabaseAdmin.from("api_rate_limits").upsert({
      id: key,
      count: 1,
      window_started_at: nowIso,
      reset_at: resetAtIso,
      updated_at: nowIso,
    });
    return { limited: false };
  }

  if (data.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((new Date(data.reset_at).getTime() - now) / 1000)),
    };
  }

  await supabaseAdmin
    .from("api_rate_limits")
    .update({
      count: data.count + 1,
      updated_at: nowIso,
    })
    .eq("id", key);

  return { limited: false };
}

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const userAgent = getUserAgent(request);

  try {
    const rateLimitKey = `${ip}:${userAgent.slice(0, 80)}`;
    const rateLimitResult = await isRateLimitedPersistent(rateLimitKey);
    if (rateLimitResult.limited) {
      await logSecurityEvent({
        eventType: "rate_limit_hit",
        ip,
        userAgent,
        detail: "Too many booking attempts within the window",
      });
      return NextResponse.json(
        {
          success: false,
          error: "Too many booking attempts. Please wait a few minutes and try again.",
        },
        {
          status: 429,
          headers: rateLimitResult.retryAfterSec
            ? { "Retry-After": String(rateLimitResult.retryAfterSec) }
            : undefined,
        }
      );
    }

    const rawBody = await request.json();
    const parsed = bookingSchema.safeParse(rawBody);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid booking details provided.";
      await logSecurityEvent({
        eventType: "validation_failed",
        ip,
        userAgent,
        detail: message,
      });
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    const body = parsed.data;

    const expectedPricing = await computeExpectedBookingPricing(supabaseAdmin, body);
    if (Math.abs(expectedPricing.totalPrice - Number(body.totalPrice)) > PRICE_TOLERANCE) {
      await logSecurityEvent({
        eventType: "price_tamper_detected",
        ip,
        userAgent,
        detail: "Submitted total price differs from server-computed total",
        payload: {
          submittedTotal: body.totalPrice,
          expectedTotal: expectedPricing.totalPrice,
          tourSlug: body.tourSlug,
        },
      });
      return NextResponse.json(
        { success: false, error: "Booking amount is invalid. Please refresh and try again." },
        { status: 400 }
      );
    }

    if (Math.abs(expectedPricing.paymentAmount - Number(body.paymentAmount)) > PRICE_TOLERANCE) {
      await logSecurityEvent({
        eventType: "payment_tamper_detected",
        ip,
        userAgent,
        detail: "Submitted payment amount differs from expected payment amount",
        payload: {
          submittedPayment: body.paymentAmount,
          expectedPayment: expectedPricing.paymentAmount,
          paymentOption: body.paymentOption,
        },
      });
      return NextResponse.json(
        { success: false, error: "Payment amount is invalid. Please refresh and try again." },
        { status: 400 }
      );
    }

    // 0. Verify with Paystack (Source of Truth)
    if (body.paymentReference && body.paymentReference !== 'cash') {
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecretKey) throw new Error("Missing Paystack secret key");

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${body.paymentReference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.status || verifyData.data.status !== "success") {
        throw new Error("Payment verification failed. The transaction was not successful according to Paystack.");
      }

      const verifiedAmount = Number(verifyData.data.amount);
      const paystackMetadata = (verifyData.data.metadata || {}) as Record<string, unknown>;
      const transactionExpectedPesewas = Number(paystackMetadata.expectedPesewas);
      const signedPricingMatches =
        verifyBookingPricingSignature(paystackMetadata, paystackMetadata.pricingSignature, paystackSecretKey) &&
        paystackMetadata.tourSlug === body.tourSlug &&
        Number(paystackMetadata.numberOfPeople) === Number(body.numberOfPeople) &&
        paystackMetadata.paymentOption === body.paymentOption &&
        (typeof paystackMetadata.voucherCode === "string" ? paystackMetadata.voucherCode : "") ===
          (expectedPricing.voucherCode || "") &&
        paystackMetadata.tierSelectionsJson === stableStringify(normalizeTierSelections(body.tierSelections)) &&
        Math.abs(Number(paystackMetadata.rawTotalPrice) - expectedPricing.totalPrice) <= PRICE_TOLERANCE &&
        Math.abs(Number(paystackMetadata.rawPaymentAmount) - expectedPricing.paymentAmount) <= PRICE_TOLERANCE &&
        Number.isFinite(transactionExpectedPesewas);
      const expectedPesewas = signedPricingMatches
        ? transactionExpectedPesewas
        : expectedPricing.expectedPesewas;

      if (verifiedAmount !== expectedPesewas) {
        await logSecurityEvent({
          eventType: "paystack_underpayment",
          ip,
          userAgent,
          detail: "Paystack verified amount did not match the server-computed amount",
          payload: {
            expectedPesewas,
            paidPesewas: verifiedAmount,
            reference: body.paymentReference,
          },
        });
        return NextResponse.json(
          { success: false, error: "Payment amount could not be verified." },
          { status: 400 }
        );
      }
    }

    // 0.5 Check if booking already exists (Webhooks might have raced us)
    const { data: existingBooking } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("payment_reference", body.paymentReference)
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json({ success: true, booking: existingBooking, note: "Already processed by webhook" });
    }

    // 1. Save to Supabase
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        // Only assign tour_id if it's a valid UUID string
        tour_id: typeof body.tourId === 'string' ? body.tourId : null,
        user_id: body.userId || null,
        // Using legacy_id or tour_id depending on database setup. We'll map what we have.
        legacy_id: typeof body.tourId === 'number' ? body.tourId : null,
        customer_name: `${body.firstName} ${body.lastName}`.trim(),
        customer_email: body.email,
        customer_phone: body.phone,
        package_name: body.package,
        number_of_people: body.numberOfPeople,
        tour_date: body.date,
        time_slot: body.timeSlot,
        pickup_location: body.pickupLocation?.trim() ? body.pickupLocation.trim() : null,
        payment_reference: body.paymentReference,
        payment_option: body.paymentOption,
        voucher_code: expectedPricing.voucherCode,
        voucher_discount: expectedPricing.voucherDiscount,
        total_cost: expectedPricing.totalPriceGhs,
        amount_paid: expectedPricing.paymentAmountGhs,
        payment_status: "paid",
        booking_status: "confirmed"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // 1.5 Give Sabary Miles (1 point per $10 spent)
    if (body.userId) {
      try {
        const pointsEarned = Math.floor(expectedPricing.totalPriceGhs / 10);

        // Fetch current points
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("mileage_points")
          .eq("id", body.userId)
          .single();

        if (profile !== null) {
          const newPoints = (profile.mileage_points || 0) + pointsEarned;
          await supabaseAdmin
            .from("profiles")
            .update({ mileage_points: newPoints })
            .eq("id", body.userId);
        }
      } catch (pointsErr) {
        console.error("Failed to award points:", pointsErr);
      }
    }

    // 1.8 Increment Voucher usage count
    if (expectedPricing.voucherCode) {
      try {
        const { data: voucher } = await supabaseAdmin
          .from("vouchers")
          .select("id, usage_count")
          .eq("code", expectedPricing.voucherCode.toUpperCase())
          .single();

        if (voucher) {
          await supabaseAdmin
            .from("vouchers")
            .update({ usage_count: (voucher.usage_count || 0) + 1 })
            .eq("id", voucher.id);
        }
      } catch (voucherErr) {
        console.error("Failed to increment voucher usage:", voucherErr);
      }
    }

    // 2. Send confirmation email via Resend
    try {
      const tourDateLabel = body.date
        ? new Date(body.date + "T12:00:00").toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })
        : body.date;

      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [body.email],
        subject: `Booking Confirmed — ${expectedPricing.tourTitle || body.tourSlug}`,
        html: buildBookingConfirmationEmailHtml({
          customerName: `${body.firstName} ${body.lastName}`.trim(),
          customerEmail: body.email,
          tourName: expectedPricing.tourTitle || body.tourSlug,
          tourDate: tourDateLabel,
          timeSlot: body.timeSlot || null,
          numberOfPeople: body.numberOfPeople,
          pickupLocation: body.pickupLocation || null,
          paymentReference: body.paymentReference,
          paymentOption: body.paymentOption,
          amountPaid: expectedPricing.paymentAmountGhs,
          totalCost: expectedPricing.totalPriceGhs,
          currency: "GHS",
          bookingId: booking.id,
        }),
      });
      if (emailError) console.error("[Resend] Booking confirmation email failed:", emailError);
    } catch (emailErr) {
      console.error("[Resend] Booking confirmation email error:", emailErr);
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: unknown) {
    console.error("Booking creation error:", { error, ip, userAgent });
    await logSecurityEvent({
      eventType: "booking_server_error",
      ip,
      userAgent,
      detail: error instanceof Error ? error.message : "unknown_server_error",
    });
    return NextResponse.json(
      {
        success: false,
        error: "We could not complete your booking due to a server error. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
