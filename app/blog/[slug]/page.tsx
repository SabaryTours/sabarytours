import { notFound } from "next/navigation";
import { getBlogPostBySlug, blogPosts } from "../../data/blog";
import BlogDetailPage from "../../pages/BlogDetailPage";

interface PageProps {
  params: Promise<{
    slug: string;
  }> | {
    slug: string;
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  // Handle both sync and async params
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;
  
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailPage post={post} />;
}


