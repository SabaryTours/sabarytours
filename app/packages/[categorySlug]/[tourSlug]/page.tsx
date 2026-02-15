import { notFound } from "next/navigation";
import { getCategoryBySlug, getTourBySlug, tours } from "../../../data/packages";
import TourDetailPage from "../../../pages/TourDetailPage";

interface PageProps {
  params: Promise<{
    categorySlug: string;
    tourSlug: string;
  }> | {
    categorySlug: string;
    tourSlug: string;
  };
}

export async function generateStaticParams() {
  return tours.map((tour) => ({
    categorySlug: tour.categorySlug,
    tourSlug: tour.slug,
  }));
}

export default async function TourRoute({ params }: PageProps) {
  // Handle both sync and async params
  const resolvedParams = params instanceof Promise ? await params : params;
  const { categorySlug, tourSlug } = resolvedParams;
  
  const tour = getTourBySlug(categorySlug, tourSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!tour || !category) {
    notFound();
  }

  return <TourDetailPage tour={tour} categoryTitle={category.title} />;
}

