import type { SupabaseClient } from "@supabase/supabase-js";

/** Booking count per package category slug */
export async function getPackageBookingCounts(
  supabase: SupabaseClient
): Promise<Record<string, number>> {
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("tour_id")
    .not("tour_id", "is", null)
    .neq("booking_status", "cancelled");

  if (error || !bookings?.length) return {};

  const tourIds = [
    ...new Set(
      bookings.map((b) => b.tour_id).filter((id): id is string => Boolean(id))
    ),
  ];
  if (tourIds.length === 0) return {};

  const { data: tours } = await supabase
    .from("tours")
    .select("id, category")
    .in("id", tourIds);

  const categoryByTourId = new Map(
    (tours || []).map((t) => [t.id, t.category as string | null])
  );

  const counts: Record<string, number> = {};
  for (const booking of bookings) {
    const category = categoryByTourId.get(booking.tour_id);
    if (!category) continue;
    counts[category] = (counts[category] || 0) + 1;
  }
  return counts;
}

export function sortPackagesByPopularity<
  T extends { slug: string; title?: string },
>(packages: T[], counts: Record<string, number>): T[] {
  return [...packages].sort((a, b) => {
    const diff = (counts[b.slug] || 0) - (counts[a.slug] || 0);
    if (diff !== 0) return diff;
    return (a.title || a.slug).localeCompare(b.title || b.slug);
  });
}

/** Booking count per tour id */
export async function getTourBookingCounts(
  supabase: SupabaseClient,
  tourIds: string[]
): Promise<Record<string, number>> {
  if (tourIds.length === 0) return {};

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("tour_id")
    .in("tour_id", tourIds)
    .neq("booking_status", "cancelled");

  if (error || !bookings?.length) return {};

  const counts: Record<string, number> = {};
  for (const row of bookings) {
    if (!row.tour_id) continue;
    counts[row.tour_id] = (counts[row.tour_id] || 0) + 1;
  }
  return counts;
}
