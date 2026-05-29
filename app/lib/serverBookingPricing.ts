import crypto from "crypto";
import { normalizeMoneyCurrency, type TourMoneyCurrency } from "./tourPricing";

type SupabaseQuery = {
  select: (columns: string) => SupabaseQuery;
  eq: (column: string, value: unknown) => SupabaseQuery;
  maybeSingle: () => Promise<{ data: unknown; error: { message?: string } | null }>;
};

type SupabaseAdminClient = {
  from: (table: string) => unknown;
};

export type BookingPricingInput = {
  tourSlug: string;
  numberOfPeople: number;
  tierSelections?: Record<string, number>;
  paymentOption: "full" | "deposit";
  voucherCode?: string | null;
};

export type ComputedBookingPricing = {
  totalPrice: number;
  paymentAmount: number;
  totalPriceGhs: number;
  paymentAmountGhs: number;
  expectedPesewas: number;
  voucherDiscount: number;
  voucherCode: string | null;
  tourTitle: string;
  tourCurrency: TourMoneyCurrency;
  exchangeRateGhsPerUsd: number | null;
};

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizeTierSelections(
  selections: Record<string, unknown> | undefined | null,
): Record<string, number> {
  const normalized: Record<string, number> = {};
  if (!selections) return normalized;

  for (const key of Object.keys(selections).sort()) {
    const value = Number(selections[key]);
    if (Number.isFinite(value) && value > 0) {
      normalized[key] = value;
    }
  }

  return normalized;
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

export function createBookingPricingSignature(
  metadata: Record<string, unknown>,
  secret: string,
): string {
  const signaturePayload = {
    tourSlug: metadata.tourSlug,
    numberOfPeople: Number(metadata.numberOfPeople),
    paymentOption: metadata.paymentOption,
    voucherCode: typeof metadata.voucherCode === "string" ? metadata.voucherCode.toUpperCase() : null,
    tierSelectionsJson: metadata.tierSelectionsJson || "{}",
    rawTotalPrice: Number(metadata.rawTotalPrice),
    rawPaymentAmount: Number(metadata.rawPaymentAmount),
    totalCost: Number(metadata.totalCost),
    paymentAmount: Number(metadata.paymentAmount),
    expectedPesewas: Number(metadata.expectedPesewas),
    pricingCurrency: metadata.pricingCurrency,
    exchangeRateGhsPerUsd: metadata.exchangeRateGhsPerUsd ? Number(metadata.exchangeRateGhsPerUsd) : null,
  };

  return crypto
    .createHmac("sha256", secret)
    .update(stableStringify(signaturePayload))
    .digest("hex");
}

export function verifyBookingPricingSignature(
  metadata: Record<string, unknown>,
  signature: unknown,
  secret: string,
): boolean {
  if (typeof signature !== "string" || !signature) return false;

  const expected = createBookingPricingSignature(metadata, secret);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");

  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export function createTopupPricingSignature(
  bookingId: string,
  expectedPesewas: number,
  secret: string,
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(stableStringify({ bookingId, expectedPesewas }))
    .digest("hex");
}

export function verifyTopupPricingSignature(
  bookingId: string,
  expectedPesewas: number,
  signature: unknown,
  secret: string,
): boolean {
  if (typeof signature !== "string" || !signature) return false;

  const expected = createTopupPricingSignature(bookingId, expectedPesewas, secret);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");

  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function inferServerTierCurrency(
  tier: { currency?: string | null },
  tiers: { currency?: string | null }[],
): TourMoneyCurrency {
  const direct = normalizeMoneyCurrency(tier.currency);
  if (direct) return direct;

  for (const t of tiers) {
    const inherited = normalizeMoneyCurrency(t.currency);
    if (inherited) return inherited;
  }

  return "GHS";
}

async function getGhsPerUsd(supabaseAdmin: SupabaseAdminClient): Promise<number> {
  const { data, error } = await (supabaseAdmin.from("exchange_rates_cache") as SupabaseQuery)
    .select("rates")
    .eq("base_code", "USD")
    .maybeSingle();

  if (error) {
    throw new Error("Exchange rate could not be loaded.");
  }

  const rateRow = data as { rates?: Record<string, number> } | null;
  const ghsPerUsd = rateRow?.rates?.GHS;
  if (typeof ghsPerUsd !== "number" || !Number.isFinite(ghsPerUsd) || ghsPerUsd <= 0) {
    throw new Error("GHS exchange rate is unavailable.");
  }

  return ghsPerUsd;
}

export async function computeExpectedBookingPricing(
  supabaseAdmin: SupabaseAdminClient,
  input: BookingPricingInput,
): Promise<ComputedBookingPricing> {
  const { data: tourData, error: tourError } = await (supabaseAdmin.from("tours") as SupabaseQuery)
    .select("id, slug, title, price, currency, tour_prices(name, amount, currency)")
    .eq("status", "published")
    .eq("slug", input.tourSlug)
    .maybeSingle();

  const tour = tourData as {
    title?: string | null;
    price?: number | string | null;
    currency?: string | null;
    tour_prices?: { name?: string | null; amount?: number | string | null; currency?: string | null }[];
  } | null;

  if (tourError || !tour) {
    throw new Error("Tour pricing could not be resolved.");
  }

  const tourPriceTiers = Array.isArray(tour.tour_prices) ? tour.tour_prices : [];
  const numberOfPeople = Number(input.numberOfPeople || 0);
  if (!Number.isFinite(numberOfPeople) || numberOfPeople < 1) {
    throw new Error("Invalid number of guests.");
  }

  let subtotal = 0;
  if (tourPriceTiers.length > 0) {
    const selections = normalizeTierSelections(input.tierSelections);
    const hasSelections = Object.values(selections).some((qty) => Number(qty) > 0);

    if (hasSelections) {
      for (let i = 0; i < tourPriceTiers.length; i++) {
        const tier = tourPriceTiers[i];
        const tierName = String(tier?.name || "");
        const qty = Number(selections[String(i)] ?? (tierName ? selections[tierName] : 0) ?? 0) || 0;

        if (qty > 0) {
          subtotal += Number(tier.amount || 0) * qty;
        }
      }
    } else {
      subtotal = Number(tourPriceTiers[0]?.amount || 0) * numberOfPeople;
    }
  } else {
    subtotal = Number(tour.price || 0) * numberOfPeople;
  }

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    throw new Error("Invalid computed pricing.");
  }

  let voucherDiscount = 0;
  const voucherCode = typeof input.voucherCode === "string" ? input.voucherCode.trim().toUpperCase() : "";
  if (voucherCode) {
    const { data: voucherData } = await (supabaseAdmin.from("vouchers") as SupabaseQuery)
      .select("discount_percentage, expiry_date, active")
      .eq("code", voucherCode)
      .maybeSingle();

    const voucher = voucherData as {
      discount_percentage?: number | string | null;
      expiry_date?: string | null;
      active?: boolean | null;
    } | null;

    if (voucher?.active) {
      const notExpired =
        !voucher.expiry_date || new Date(voucher.expiry_date).getTime() >= Date.now() - 24 * 60 * 60 * 1000;
      if (notExpired) {
        voucherDiscount = Number(voucher.discount_percentage || 0);
      }
    }
  }

  const discountAmount = (subtotal * voucherDiscount) / 100;
  const totalPrice = roundCurrency(subtotal - discountAmount);
  const paymentAmount =
    input.paymentOption === "deposit" ? roundCurrency((totalPrice * 30) / 100) : totalPrice;

  let tourCurrency: TourMoneyCurrency = "GHS";
  if (tourPriceTiers.length > 0) {
    tourCurrency = inferServerTierCurrency(tourPriceTiers[0], tourPriceTiers);
  } else {
    tourCurrency = normalizeMoneyCurrency(tour.currency) || "GHS";
  }

  const exchangeRateGhsPerUsd = tourCurrency === "USD" ? await getGhsPerUsd(supabaseAdmin) : null;
  const totalPriceGhs = tourCurrency === "USD"
    ? roundCurrency(totalPrice * exchangeRateGhsPerUsd!)
    : totalPrice;
  const paymentAmountGhs = tourCurrency === "USD"
    ? roundCurrency(paymentAmount * exchangeRateGhsPerUsd!)
    : paymentAmount;

  return {
    totalPrice,
    paymentAmount,
    totalPriceGhs,
    paymentAmountGhs,
    expectedPesewas: Math.round(paymentAmountGhs * 100),
    voucherDiscount,
    voucherCode: voucherCode || null,
    tourTitle: String(tour.title || ""),
    tourCurrency,
    exchangeRateGhsPerUsd,
  };
}
