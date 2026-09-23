import type { SupabaseClient } from "@supabase/supabase-js";
import { parseTripOutlineBody } from "./tripOutline";
import { tourBookingHref } from "./tourUrls";

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

export type TourDeparture = {
  id: string;
  /** ISO date, e.g. "2026-11-08". */
  date: string;
  time: string;
  pickup: string;
  price: string;
  seatsRemaining: number | null;
  totalSeats: number | null;
  showSeats: boolean;
  bookUrl: string;
};

/**
 * Scheduled group departures for one tour, soonest first.
 * Reads the same trip_year_outline rows the Upcoming Tours calendar writes,
 * so a tour page can advertise the dates it actually runs on.
 */
export async function getDeparturesForTour(
  supabase: SupabaseClient,
  tourSlug: string,
  { years = 2, limit = 6 }: { years?: number; limit?: number } = {},
): Promise<TourDeparture[]> {
  const slug = tourSlug.trim();
  if (!slug) return [];

  const currentYear = new Date().getFullYear();
  const { data, error } = await supabase
    .from("trip_year_outline")
    .select("id, body")
    .eq("is_published", true)
    .gte("year", currentYear)
    .lt("year", currentYear + years);

  if (error || !data) return [];

  // Compare on the local calendar day so a departure stays listed all day.
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (data as { id: string; body: string | null }[])
    .flatMap((row) => {
      const meta = parseTripOutlineBody(row.body);
      const date = meta.date?.trim() || "";
      const time = meta.time?.trim() || "";
      if (meta.tour_slug?.trim() !== slug || !date || !time) return [];
      if (date < todayKey) return [];

      const pickup = meta.pickup?.trim() || "";
      return [{
        id: String(row.id),
        date,
        time,
        pickup,
        price: meta.price?.trim() || "",
        seatsRemaining: typeof meta.seats_remaining === "number" ? meta.seats_remaining : null,
        totalSeats: typeof meta.total_seats === "number" ? meta.total_seats : null,
        showSeats: meta.show_seats === true,
        bookUrl: tourBookingHref(slug, { id: String(row.id), date, time, pickup }),
      }];
    })
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))
    .slice(0, limit);
}
