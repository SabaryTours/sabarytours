import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getPackageBySlug, getSimilarTours, getTourBySlug } from "../../../lib/api";
import TourDetailPage from "../../../pages/TourDetailPage";
import JsonLd from "../../../components/seo/JsonLd";
import { buildBreadcrumbSchema, buildTourActivitySchema } from "../../../lib/seo/schema";
import { buildPageMetadata } from "../../../lib/seo/metadata";
import { tourDetailHref } from "../../../lib/tourUrls";
import { htmlToExcerpt } from "../../../lib/htmlToText";
import { createClient } from "../../../utils/supabase/server";
import { getDeparturesForTour } from "../../../lib/scheduledTours";

export const dynamic = "force-dynamic";

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
  const tour = await getTourBySlug(resolvedParams.tourSlug);

  if (!tour) return { title: "Tour Not Found - Sabary Tours" };

  const description =
    htmlToExcerpt(tour.description, 160) ||
    `Experience ${tour.title} in Ghana with Sabary Tours.`;

  return buildPageMetadata({
    title: `${tour.title} | Sabary Tours`,
    description,
    path: tourDetailHref(tour.categorySlug, tour.slug),
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

  if (!tour.categorySlug) {
    redirect(tourDetailHref(null, tour.slug));
  }

  const category = await getPackageBySlug(tour.categorySlug);
  const similarTours = await getSimilarTours(tour.slug, tour.categorySlug);
  const departures = await getDeparturesForTour(await createClient(), tour.slug);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    {
      name: category?.title ?? "Tours",
      path: `/packages/${tour.categorySlug}`,
    },
    {
      name: tour.title,
      path: tourDetailHref(tour.categorySlug, tour.slug),
    },
  ]);

  const tourSchema = buildTourActivitySchema({
    title: tour.title,
    description: tour.description,
    categorySlug: tour.categorySlug,
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
        categoryTitle={category?.title ?? "Tours"}
        similarTours={similarTours}
        departures={departures}
      />
    </>
  );
}
