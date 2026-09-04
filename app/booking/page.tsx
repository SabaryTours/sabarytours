import { notFound } from "next/navigation";
import { getTourBySlug, getSimilarTours } from "../lib/api";
import BookingPage from "../pages/BookingPage";
import { createClient } from "../utils/supabase/server";
import { getScheduledTourById } from "../lib/scheduledTours";

interface PageProps {
  searchParams: Promise<{
    tour?: string;
    schedule?: string;
  }> | {
    tour?: string;
    schedule?: string;
  };
}

export default async function BookingRoute({ searchParams }: PageProps) {
  const params = await searchParams;
  const tourSlug = params.tour;

  if (!tourSlug) {
    notFound();
  }

  const tour = await getTourBySlug(tourSlug);

  if (!tour) {
    notFound();
  }

  const scheduleId = params.schedule?.trim() || "";
  const schedule = scheduleId ? await getScheduledTourById(await createClient(), scheduleId) : null;
  if (scheduleId && (!schedule || schedule.tourSlug !== tour.slug)) {
    notFound();
  }

  // Fetch similar tours to cross-sell
  const otherTours = (await getSimilarTours(tour.slug, tour.categorySlug)).filter((t) => t.id !== tour.id);

  return <BookingPage tour={tour} otherTours={otherTours} schedule={schedule} />;
}
