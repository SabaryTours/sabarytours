import { notFound } from "next/navigation";
import { getTourBySlug, getSimilarTours } from "../lib/api";
import BookingPage from "../pages/BookingPage";

interface PageProps {
  searchParams: Promise<{
    tour?: string;
  }> | {
    tour?: string;
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

  // Fetch similar tours to cross-sell
  const otherTours = (await getSimilarTours(tour.slug, tour.categorySlug)).filter((t) => t.id !== tour.id);

  return <BookingPage tour={tour} otherTours={otherTours} />;
}

