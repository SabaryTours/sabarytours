import { notFound } from "next/navigation";
import { getCategoryBySlug, getToursByCategory, packageCategories } from "../../data/packages";
import CategoryPage from "../../pages/CategoryPage";

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }> | {
    categorySlug: string;
  };
}

export async function generateStaticParams() {
  return packageCategories.map((category) => ({
    categorySlug: category.slug,
  }));
}

export default async function CategoryRoute({ params }: PageProps) {
  // Handle both sync and async params
  const resolvedParams = params instanceof Promise ? await params : params;
  const { categorySlug } = resolvedParams;
  
  const category = getCategoryBySlug(categorySlug);
  const tours = getToursByCategory(categorySlug);

  if (!category) {
    notFound();
  }

  return <CategoryPage category={category} tours={tours} />;
}

