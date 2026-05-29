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
