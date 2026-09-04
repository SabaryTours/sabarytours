import type { SupabaseClient } from "@supabase/supabase-js";
import { parseTripOutlineBody } from "./tripOutline";

export type ScheduledTour = {
  id: string;
  tourSlug: string;
  date: string;
  time: string;
  pickup: string;
};

export async function getScheduledTourById(
  supabase: SupabaseClient,
  scheduleId: string,
): Promise<ScheduledTour | null> {
  const { data, error } = await supabase
    .from("trip_year_outline")
    .select("id, body, is_published")
    .eq("id", scheduleId)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;

  const meta = parseTripOutlineBody(data.body);
  const tourSlug = meta.tour_slug?.trim() || "";
  const date = meta.date?.trim() || "";
  const time = meta.time?.trim() || "";
  if (!tourSlug || !date || !time) return null;

  return {
    id: String(data.id),
    tourSlug,
    date,
    time,
    pickup: meta.pickup?.trim() || "",
  };
}

export async function validateScheduledTour(
  supabase: SupabaseClient,
  input: { scheduleId?: string | null; tourSlug: string; date: string; time: string; pickup?: string | null },
): Promise<ScheduledTour | null> {
  if (!input.scheduleId) return null;
  const schedule = await getScheduledTourById(supabase, input.scheduleId);
  if (
    !schedule ||
    schedule.tourSlug !== input.tourSlug ||
    schedule.date !== input.date ||
    schedule.time !== input.time ||
    schedule.pickup !== (input.pickup?.trim() || "")
  ) {
    throw new Error("This group tour schedule has changed. Please return to Upcoming Tours and try again.");
  }
  return schedule;
}
