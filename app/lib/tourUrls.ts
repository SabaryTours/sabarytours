/** Public tour detail URL — works with or without a package category. */
export function tourDetailHref(category: string | null | undefined, slug: string | null | undefined): string {
  const cat = category?.trim();
  const cleanSlug = (slug ?? "").trim();
  if (!cleanSlug) return "/packages";
  if (cat) return `/packages/${cat}/${cleanSlug}`;
  return `/tours/${cleanSlug}`;
}

/** Booking flow for a published tour slug. */
export function tourBookingHref(slug: string): string {
  return `/booking?tour=${encodeURIComponent(slug.trim())}`;
}

export function slugFromTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type TripOutlineLinkMeta = {
  tour_slug?: string | null;
  book_url?: string | null;
};

/** Resolve upcoming-tour CTA links without guessing slugs from card titles. */
export function resolveTripOutlineBookUrl(meta: TripOutlineLinkMeta): string {
  const linkedSlug = meta.tour_slug?.trim();
  if (linkedSlug) return tourBookingHref(linkedSlug);

  const bookUrl = meta.book_url?.trim();
  if (bookUrl && bookUrl !== "/booking") return bookUrl;

  return "/contact?from=upcoming-tour";
}
