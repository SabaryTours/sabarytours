import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, getRelatedBlogPosts } from "../../lib/api";
import BlogDetailPage from "../../pages/BlogDetailPage";
import BlogViewTracker from "../../components/BlogViewTracker";
import JsonLd from "../../components/seo/JsonLd";
import { buildBlogArticleSchema, buildBreadcrumbSchema } from "../../lib/seo/schema";
import { buildPageMetadata } from "../../lib/seo/metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface PageProps {
  params: Promise<{
    slug: string;
  }> | {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return { title: "Post Not Found | Sabary Tours" };
  }

  const description =
    post.excerpt || post.content.replace(/<[^>]*>/g, " ").trim().slice(0, 160);
  const keywords = post.tags?.map((tag) => tag.replace(/^#+/, "").trim()).filter(Boolean) ?? [];

  return buildPageMetadata({
    title: `${post.title} | Sabary Tours Blog`,
    description,
    path: `/blog/${post.slug}`,
    images: [post.image],
    keywords,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(slug, 3);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  const articleSchema = buildBlogArticleSchema({
    title: post.title,
    slug: post.slug,
    description: post.excerpt || post.content,
    image: post.image,
    publishedAt: post.publishedAtIso,
    modifiedAt: post.modifiedAtIso,
    keywords: post.tags,
  });

  return (
    <>
      <JsonLd data={[breadcrumbSchema, articleSchema]} />
      <BlogViewTracker slug={post.slug} title={post.title} />
      <BlogDetailPage post={post} relatedPosts={relatedPosts} />
    </>
  );
}
