import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  computeExpectedBookingPricing,
  createBookingPricingSignature,
  normalizeTierSelections,
  stableStringify,
} from "../../../lib/serverBookingPricing";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { email, metadata } = await req.json();

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY is not defined in environment variables");
      return NextResponse.json(
        { error: "Payment gateway configuration error" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const tourSlug = typeof metadata?.tourSlug === "string" ? metadata.tourSlug.trim() : "";
    const tourId =
      metadata?.tourId != null && String(metadata.tourId).trim() !== ""
        ? String(metadata.tourId).trim()
        : null;
    const numberOfPeople = Number(metadata?.numberOfPeople || 0);
    const paymentOption =
      metadata?.paymentOption === "deposit"
        ? "deposit"
        : metadata?.paymentOption === "cash"
          ? "cash"
          : "full";

    if (!email || (!tourSlug && !tourId) || !Number.isFinite(numberOfPeople) || numberOfPeople < 1) {
      return NextResponse.json(
        { error: "Invalid payment details" },
        { status: 400 },
      );
    }

    if (paymentOption === "cash") {
      return NextResponse.json(
        { error: "Cash bookings do not require online payment." },
        { status: 400 },
      );
    }

    const pricing = await computeExpectedBookingPricing(supabaseAdmin, {
      tourSlug: tourSlug || "",
      tourId,
      numberOfPeople,
      tierSelections: metadata?.tierSelections as Record<string, number> | undefined,
      paymentOption,
      voucherCode: typeof metadata?.voucherCode === "string" ? metadata.voucherCode : null,
    });

    const normalizedTierSelections = normalizeTierSelections(
      metadata?.tierSelections as Record<string, unknown> | undefined,
    );
    const serverMetadata = {
      ...metadata,
      numberOfPeople,
      paymentOption,
      voucherCode: typeof metadata?.voucherCode === "string" ? metadata.voucherCode.toUpperCase() : null,
      tierSelections: normalizedTierSelections,
      tierSelectionsJson: stableStringify(normalizedTierSelections),
      rawTotalPrice: pricing.totalPrice,
      rawPaymentAmount: pricing.paymentAmount,
      totalCost: pricing.totalPriceGhs,
      paymentAmount: pricing.paymentAmountGhs,
      expectedPesewas: pricing.expectedPesewas,
      pricingCurrency: pricing.tourCurrency,
      exchangeRateGhsPerUsd: pricing.exchangeRateGhsPerUsd,
    };
    const signedMetadata = {
      ...serverMetadata,
      pricingSignature: createBookingPricingSignature(serverMetadata, paystackSecretKey),
    };

    // Paystack metadata must stay compact — large payloads cause initialize failures.
    const paystackMetadata: Record<string, string | number | null> = {
      tourSlug,
      tourId: typeof metadata?.tourId === "string" || typeof metadata?.tourId === "number" ? metadata.tourId : null,
      userId: typeof metadata?.userId === "string" ? metadata.userId : null,
      packageName: typeof metadata?.packageName === "string" ? metadata.packageName.slice(0, 120) : null,
      customerName: typeof metadata?.customerName === "string" ? metadata.customerName.slice(0, 80) : null,
      customerPhone: typeof metadata?.customerPhone === "string" ? metadata.customerPhone.slice(0, 30) : null,
      numberOfPeople,
      date: typeof metadata?.date === "string" ? metadata.date : null,
      timeSlot: typeof metadata?.timeSlot === "string" ? metadata.timeSlot.slice(0, 40) : null,
      paymentOption,
      voucherCode: signedMetadata.voucherCode as string | null,
      tierSelectionsJson: signedMetadata.tierSelectionsJson as string,
      rawTotalPrice: pricing.totalPrice,
      rawPaymentAmount: pricing.paymentAmount,
      totalCost: pricing.totalPriceGhs,
      paymentAmount: pricing.paymentAmountGhs,
      expectedPesewas: pricing.expectedPesewas,
      pricingCurrency: pricing.tourCurrency,
      pricingSignature: signedMetadata.pricingSignature as string,
    };

    // Initialize transaction with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: pricing.expectedPesewas,
        currency: "GHS",
        metadata: {
          ...paystackMetadata,
          custom_fields: [
            { display_name: "Tour", variable_name: "tour", value: String(metadata?.packageName || metadata?.tourSlug || "Tour").slice(0, 80) },
            { display_name: "Guests", variable_name: "guests", value: String(numberOfPeople) },
          ],
        },
        callback_url: `${baseUrl}/booking/verify`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error("Paystack initialization failed:", data.message);
      return NextResponse.json(
        { error: data.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    // Return the authorization url and reference
    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
      amount: pricing.expectedPesewas,
      metadata: signedMetadata,
    });
  } catch (error: unknown) {
    console.error("Paystack Initialize Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error while initializing payment";
    const status = message.includes("Exchange rate") || message.includes("pricing") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
