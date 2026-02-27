import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getToursByCategory, getPackageBySlug } from "../../lib/api";
import { createClient } from "../../utils/supabase/server";
import CategoryPage from "../../pages/CategoryPage";

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }> | {
    categorySlug: string;
  };
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { categorySlug } = resolvedParams;
  
  const category = await getPackageBySlug(categorySlug);
  
  if (!category) return { title: "Package Not Found - Sabary Tours" };
  
  return {
    title: `${category.title} Packages | Sabary Tours`,
    description: category.description?.substring(0, 160) || `Explore carefully curated ${category.title} packages with Sabary Tours.`,
    openGraph: {
      title: `${category.title} Packages - Sabary Tours`,
      description: category.description?.substring(0, 160) || `Explore carefully curated ${category.title} packages with Sabary Tours.`,
      images: category.image_url ? [category.image_url] : [],
    },
  };
}

export default async function CategoryRoute({ params }: PageProps) {
  // Handle both sync and async params
  const resolvedParams = params instanceof Promise ? await params : params;
  const { categorySlug } = resolvedParams;
  
  const category = await getPackageBySlug(categorySlug);
  const tours = await getToursByCategory(categorySlug);

  if (!category) {
    notFound();
  }

  return <CategoryPage category={category} tours={tours} />;
}

