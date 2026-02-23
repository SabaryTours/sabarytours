import { notFound } from "next/navigation";
import { getTourBySlug, getToursByCategory } from "../lib/api";
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
  const categoryTours = await getToursByCategory(tour.categorySlug || 'tours');
  const otherTours = categoryTours.filter(t => t.id !== tour.id).slice(0, 3);

  return <BookingPage tour={tour} otherTours={otherTours} />;
}

