import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getPackageBySlug, getSimilarTours, getTourBySlug } from "../../lib/api";
import TourDetailPage from "../../pages/TourDetailPage";
import JsonLd from "../../components/seo/JsonLd";
import { buildBreadcrumbSchema, buildTourActivitySchema } from "../../lib/seo/schema";
import { buildPageMetadata } from "../../lib/seo/metadata";
import { tourDetailHref } from "../../lib/tourUrls";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tourSlug: string }> | { tourSlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const tour = await getTourBySlug(resolvedParams.tourSlug);

  if (!tour) return { title: "Tour Not Found - Sabary Tours" };

  const description =
    tour.description?.replace(/<[^>]*>/g, " ").trim().slice(0, 160) ||
    `Experience ${tour.title} in Ghana with Sabary Tours.`;

  return buildPageMetadata({
    title: `${tour.title} | Sabary Tours`,
    description,
    path: tourDetailHref(tour.categorySlug, tour.slug),
    images: tour.gallery?.length ? tour.gallery : [tour.image],
  });
}

export default async function StandaloneTourRoute({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const tour = await getTourBySlug(resolvedParams.tourSlug);

  if (!tour) {
    notFound();
  }

  if (tour.categorySlug) {
    redirect(tourDetailHref(tour.categorySlug, tour.slug));
  }

  const similarTours = await getSimilarTours(tour.slug, tour.categorySlug);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    { name: tour.title, path: tourDetailHref(null, tour.slug) },
  ]);

  const tourSchema = buildTourActivitySchema({
    title: tour.title,
    description: tour.description,
    categorySlug: tour.categorySlug || "tours",
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
      <TourDetailPage tour={tour} categoryTitle="Tours" similarTours={similarTours} />
    </>
  );
}
