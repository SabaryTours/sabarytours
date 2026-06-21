import type { SupabaseClient } from "@supabase/supabase-js";

/** Subtract guest count from tour seats after a confirmed booking. */
export async function decrementTourSeats(
  supabaseAdmin: SupabaseClient,
  tourId: string | null | undefined,
  guests: number,
): Promise<void> {
  if (!tourId || !Number.isFinite(guests) || guests <= 0) return;

  const { data: tour, error } = await supabaseAdmin
    .from("tours")
    .select("seats_remaining")
    .eq("id", tourId)
    .maybeSingle();

  if (error || !tour || typeof tour.seats_remaining !== "number") return;

  const next = Math.max(0, tour.seats_remaining - guests);
  await supabaseAdmin.from("tours").update({ seats_remaining: next }).eq("id", tourId);
}
