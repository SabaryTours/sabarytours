import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "../../lib/api";
import BlogDetailPage from "../../pages/BlogDetailPage";

interface PageProps {
  params: Promise<{
    slug: string;
  }> | {
    slug: string;
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  // Handle both sync and async params
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;
  
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailPage post={post} />;
}


