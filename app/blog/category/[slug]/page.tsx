import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BLOG_CATEGORIES } from "../../../lib/blogCategories";
import BlogCategoryPage from "../../../pages/BlogCategoryPage";
import TourLoader from "../../../components/TourLoader";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = BLOG_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found | Sabary Tours" };
  return {
    title: `${category.label} | Sabary Tours Blog`,
    description: category.description,
  };
}

export default async function BlogCategoryRoute({ params }: Props) {
  const { slug } = await params;
  const category = BLOG_CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
          <TourLoader />
        </div>
      }
    >
      <BlogCategoryPage slug={slug} label={category.label} description={category.description} />
    </Suspense>
  );
}
