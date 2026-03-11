import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPackageBySlug, getTourBySlug, getToursByCategory } from "../../../lib/api";
import TourDetailPage from "../../../pages/TourDetailPage";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    categorySlug: string;
    tourSlug: string;
  }> | {
    categorySlug: string;
    tourSlug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { tourSlug } = resolvedParams;
  
  const tour = await getTourBySlug(tourSlug);
  
  if (!tour) return { title: "Tour Not Found - Sabary Tours" };
  
  return {
    title: `${tour.title} | Sabary Tours`,
    description: tour.description?.substring(0, 160) || `Experience ${tour.title} in Ghana with Sabary Tours.`,
    openGraph: {
      title: `${tour.title} - Sabary Tours`,
      description: tour.description?.substring(0, 160) || `Experience ${tour.title} in Ghana with Sabary Tours.`,
      images: tour.image ? [tour.image] : [],
    },
  };
}

export default async function TourRoute({ params }: PageProps) {
  // Handle both sync and async params
  const resolvedParams = params instanceof Promise ? await params : params;
  const { categorySlug, tourSlug } = resolvedParams;
  
  const tour = await getTourBySlug(tourSlug);
  if (!tour) {
    notFound();
  }

  // Prefer the tour's own categorySlug for resilience against mismatched URLs
  const resolvedCategorySlug = tour.categorySlug || categorySlug;
  const category = await getPackageBySlug(resolvedCategorySlug);
  const categoryTours = await getToursByCategory(resolvedCategorySlug);
  const similarTours = categoryTours.filter((t) => t.slug !== tour.slug).slice(0, 3);

  return (
    <TourDetailPage
      tour={tour}
      categoryTitle={category?.title ?? "Other Tours"}
      similarTours={similarTours}
    />
  );
}

