import { notFound } from "next/navigation";
import { getPackageBySlug, getTourBySlug, getToursByCategory } from "../../../lib/api";
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

export default async function TourRoute({ params }: PageProps) {
  // Handle both sync and async params
  const resolvedParams = params instanceof Promise ? await params : params;
  const { categorySlug, tourSlug } = resolvedParams;
  
  const tour = await getTourBySlug(tourSlug);
  const category = await getPackageBySlug(categorySlug);
  const categoryTours = await getToursByCategory(categorySlug);
  const similarTours = categoryTours.filter(t => t.slug !== tour?.slug).slice(0, 3);

  if (!tour || !category) {
    notFound();
  }

  return <TourDetailPage tour={tour} categoryTitle={category.title} similarTours={similarTours} />;
}

