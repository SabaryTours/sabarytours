export type TourMoneyCurrency = "USD" | "GHS";

/** Only treat known ISO-like codes as supported money; ignore bad / legacy values. */
export function normalizeMoneyCurrency(c: string | undefined | null): TourMoneyCurrency | null {
  if (!c) return null;
  const u = c.toUpperCase().trim();
  if (u === "USD" || u === "GHS") return u;
  return null;
}

/**
 * Currency for a price tier row: use the row when set, otherwise inherit from
 * the first tier that declares a currency (admin often leaves later rows blank).
 */
export function inferTierCurrency(
  tier: { currency?: string | null },
  tiers: { currency?: string | null }[],
): TourMoneyCurrency {
  const direct = normalizeMoneyCurrency(tier.currency ?? undefined);
  if (direct) return direct;
  for (const t of tiers) {
    const inherited = normalizeMoneyCurrency(t.currency ?? undefined);
    if (inherited) return inherited;
  }
  return "GHS";
}

export function currencySymbol(c: TourMoneyCurrency): string {
  return c === "USD" ? "$" : "₵";
}

/** Matches slug resolution used on the public site (see lib/api.ts getTourBySlug). */
export function slugFromTourTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Stable tier order so booking UI indices match server Paystack pricing. */
export function sortTourPriceTiers<T extends { name?: string | null; amount?: number | string | null }>(
  tiers: T[],
): T[] {
  return [...tiers].sort((a, b) => {
    const byName = String(a.name || "").localeCompare(String(b.name || ""));
    if (byName !== 0) return byName;
    return Number(a.amount || 0) - Number(b.amount || 0);
  });
}

export function getLowestTierPrice(
  tiers: { amount?: number | string | null; currency?: string | null }[] | null | undefined,
  fallbackCurrency?: string | null,
): { amount: number; currency: TourMoneyCurrency } {
  const normalized = (tiers || [])
    .map((tier) => ({
      amount: Number(tier?.amount),
      currency: tier?.currency || null,
    }))
    .filter((tier) => Number.isFinite(tier.amount) && tier.amount > 0);

  if (normalized.length === 0) {
    return { amount: 0, currency: normalizeMoneyCurrency(fallbackCurrency) || "GHS" };
  }

  const lowest = normalized.reduce((acc, curr) => (curr.amount < acc.amount ? curr : acc));
  return {
    amount: lowest.amount,
    currency: normalizeMoneyCurrency(lowest.currency) || normalizeMoneyCurrency(fallbackCurrency) || "GHS",
  };
}
