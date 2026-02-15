import { notFound } from "next/navigation";
import { getTourBySlugOnly } from "../data/packages";
import BookingPage from "../pages/BookingPage";

interface PageProps {
  searchParams: Promise<{
    tour?: string;
  }>;
}

export default async function BookingRoute({ searchParams }: PageProps) {
  const params = await searchParams;
  const tourSlug = params.tour;

  if (!tourSlug) {
    notFound();
  }

  const tour = getTourBySlugOnly(tourSlug);

  if (!tour) {
    notFound();
  }

  return <BookingPage tour={tour} />;
}

