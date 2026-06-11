import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPackageBySlug, getTourBySlug, getToursByCategory } from "../../../lib/api";
import TourDetailPage from "../../../pages/TourDetailPage";
import JsonLd from "../../../components/seo/JsonLd";
import { buildBreadcrumbSchema, buildTourActivitySchema } from "../../../lib/seo/schema";
import { buildPageMetadata } from "../../../lib/seo/metadata";

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

  const categorySlug = tour.categorySlug || resolvedParams.categorySlug;
  const description =
    tour.description?.replace(/<[^>]*>/g, " ").trim().slice(0, 160) ||
    `Experience ${tour.title} in Ghana with Sabary Tours.`;

  return buildPageMetadata({
    title: `${tour.title} | Sabary Tours`,
    description,
    path: `/packages/${categorySlug}/${tour.slug}`,
    images: tour.gallery?.length ? tour.gallery : [tour.image],
  });
}

export default async function TourRoute({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { categorySlug, tourSlug } = resolvedParams;

  const tour = await getTourBySlug(tourSlug);
  if (!tour) {
    notFound();
  }

  const resolvedCategorySlug = tour.categorySlug || categorySlug;
  const category = await getPackageBySlug(resolvedCategorySlug);
  const categoryTours = await getToursByCategory(resolvedCategorySlug);
  const similarTours = categoryTours.filter((t) => t.slug !== tour.slug).slice(0, 3);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    {
      name: category?.title ?? "Tours",
      path: `/packages/${resolvedCategorySlug}`,
    },
    {
      name: tour.title,
      path: `/packages/${resolvedCategorySlug}/${tour.slug}`,
    },
  ]);

  const tourSchema = buildTourActivitySchema({
    title: tour.title,
    description: tour.description,
    categorySlug: resolvedCategorySlug,
    slug: tour.slug,
    image: tour.image,
    gallery: tour.gallery,
    location: tour.location,
    duration: tour.duration,
    priceValue: tour.priceValue,
    priceCurrency: tour.priceCurrency,
    rating: tour.rating,
    reviewCount: tour.reviewCount,
  });

  return (
    <>
      <JsonLd data={[breadcrumbSchema, tourSchema]} />
      <TourDetailPage
        tour={tour}
        categoryTitle={category?.title ?? "Other Tours"}
        similarTours={similarTours}
      />
    </>
  );
}
