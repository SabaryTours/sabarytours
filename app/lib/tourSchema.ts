export const TOUR_CAPACITY_MIGRATION = "supabase/migrations/20260621_tour_seats_views.sql";

export const TOUR_CAPACITY_MIGRATION_HINT =
  "Tour seat tracking is not enabled yet. Run supabase/migrations/20260621_tour_seats_views.sql in the Supabase SQL Editor, then save again.";

const CAPACITY_FIELDS = [
  "total_seats",
  "seats_remaining",
  "show_booking_count",
  "view_count",
] as const;

export function isMissingTourCapacityColumnError(message: string): boolean {
  return /schema cache/i.test(message)
    && /tours/i.test(message)
    && /(total_seats|seats_remaining|show_booking_count|view_count)/i.test(message);
}

export function stripTourCapacityFields<T extends Record<string, unknown>>(input: T): Omit<T, (typeof CAPACITY_FIELDS)[number]> {
  const next = { ...input };
  for (const field of CAPACITY_FIELDS) {
    delete next[field];
  }
  return next;
}
