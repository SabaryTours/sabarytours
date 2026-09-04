/** Public tour detail URL — works with or without a package category. */
export function tourDetailHref(category: string | null | undefined, slug: string | null | undefined): string {
  const cat = category?.trim();
  const cleanSlug = (slug ?? "").trim();
  if (!cleanSlug) return "/packages";
  if (cat) return `/packages/${cat}/${cleanSlug}`;
  return `/tours/${cleanSlug}`;
}

/** Booking flow for a published tour slug. */
export type FixedTourSchedule = {
  id?: string | null;
  date?: string | null;
  time?: string | null;
  pickup?: string | null;
};

export function tourBookingHref(slug: string, schedule?: FixedTourSchedule): string {
  const params = new URLSearchParams({ tour: slug.trim() });
  const date = schedule?.date?.trim();
  const time = schedule?.time?.trim();
  const pickup = schedule?.pickup?.trim();
  const scheduleId = schedule?.id?.trim();
  if (scheduleId) params.set("schedule", scheduleId);
  if (date) params.set("date", date);
  if (time) params.set("time", time);
  if (pickup) params.set("pickup", pickup);
  return `/booking?${params.toString()}`;
}

export function slugFromTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type TripOutlineLinkMeta = {
  title?: string | null;
  tour_slug?: string | null;
  book_url?: string | null;
  date?: string | null;
  time?: string | null;
  pickup?: string | null;
  schedule_id?: string | null;
};

/** Resolve upcoming-tour CTA links without guessing slugs from card titles. */
export function resolveTripOutlineBookUrl(meta: TripOutlineLinkMeta): string {
  const linkedSlug = meta.tour_slug?.trim();
  if (linkedSlug) return tourBookingHref(linkedSlug, { ...meta, id: meta.schedule_id });

  const bookUrl = meta.book_url?.trim();
  if (bookUrl && bookUrl !== "/booking") return bookUrl;

  const inferredSlug = slugFromTitle((meta.title || "").replace(/\([^)]*\)/g, " "));
  return inferredSlug ? tourBookingHref(inferredSlug, meta) : "/packages";
}
