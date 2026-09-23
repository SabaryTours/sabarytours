export const TOUR_CAPACITY_MIGRATION = "supabase/migrations/20260621_tour_seats_views.sql";

export const TOUR_CAPACITY_MIGRATION_HINT =
  "Tour seat tracking is not enabled yet. Run supabase/migrations/20260621_tour_seats_views.sql in the Supabase SQL Editor, then save again.";

const CAPACITY_FIELDS = [
  "total_seats",
  "seats_remaining",
  "show_booking_count",
  "show_seats",
  "view_count",
] as const;

export function isMissingTourCapacityColumnError(message: string): boolean {
  return /schema cache/i.test(message)
    && /tours/i.test(message)
    && /(total_seats|seats_remaining|show_booking_count|show_seats|view_count)/i.test(message);
}

export function stripTourCapacityFields<T extends Record<string, unknown>>(input: T): Omit<T, (typeof CAPACITY_FIELDS)[number]> {
  const next = { ...input };
  for (const field of CAPACITY_FIELDS) {
    delete next[field];
  }
  return next;
}

export const TOUR_TYPE_MIGRATION = "supabase/migrations/20260923090000_tour_type_group.sql";

export const TOUR_TYPE_MIGRATION_HINT =
  "Group tours are not enabled yet. Run supabase/migrations/20260923090000_tour_type_group.sql in the Supabase SQL Editor, then save again.";

export function isMissingTourTypeColumnError(message: string): boolean {
  return /tour_type/i.test(message)
    && /(schema cache|does not exist|column)/i.test(message)
    // A bad value trips the check constraint; that must surface, not be stripped.
    && !/constraint/i.test(message);
}

export function stripTourTypeField<T extends Record<string, unknown>>(input: T): Omit<T, "tour_type"> {
  const next = { ...input };
  delete next.tour_type;
  return next;
}
