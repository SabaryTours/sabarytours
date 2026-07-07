"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft01Icon } from "hugeicons-react";
import BlogPostCard, { type BlogCardPost } from "../components/BlogPostCard";
import TourLoader from "../components/TourLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { resolveBlogImageUrl } from "../lib/blogImages";
import { normalizeBlogTags } from "../lib/blogTags";

const PAGE_SIZE = 9;

function mapPostRow(row: Record<string, unknown>): BlogCardPost {
  const slug = typeof row.slug === "string" ? row.slug : "";
  return {
    id: String(row.id),
    slug,
    title: typeof row.title === "string" ? row.title : "",
    image: resolveBlogImageUrl(
      typeof row.image_url === "string" ? row.image_url : null,
      slug,
    ),
    views: typeof row.view_count === "number" ? row.view_count : 0,
    comments: typeof row.comment_count === "number" ? row.comment_count : 0,
    tags: normalizeBlogTags(Array.isArray(row.tags) ? row.tags.filter(Boolean) : []),
    category: typeof row.category === "string" ? row.category : null,
    excerpt: typeof row.summary === "string" ? row.summary : "",
  };
}

interface BlogCategoryPageProps {
  slug: string;
  label: string;
  description: string;
}

export default function BlogCategoryPage({ slug, label, description }: BlogCategoryPageProps) {
  const [posts, setPosts] = useState<BlogCardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setLoading(true);
      setPage(0);

      const { createClient } = await import("../utils/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("category", slug)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch category posts:", error);
        setPosts([]);
        setHasMore(false);
      } else {
        const mapped = (data || []).map((row) => mapPostRow(row));
        setPosts(mapped);
        setHasMore((data || []).length === PAGE_SIZE);
      }

      setLoading(false);
    }

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);

    const { createClient } = await import("../utils/supabase/client");
    const supabase = createClient();
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .eq("category", slug)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      const mapped = data.map((row) => mapPostRow(row));
      setPosts((prev) => [...prev, ...mapped]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(nextPage);
    }

    setLoadingMore(false);
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5e00] hover:underline mb-6 transition-colors"
        >
          <ArrowLeft01Icon size={16} />
          Back to all blogs
        </Link>

        {/* Category header */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#222] uppercase"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            {label}
          </h1>
          <p className="text-sm text-gray-600 font-sans mt-1">{description}</p>
        </div>

        {/* Posts grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <TourLoader />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center font-sans">
            <p className="text-gray-700 font-bold">No posts in this category yet.</p>
            <p className="mt-2 text-sm text-gray-500">Check back soon for new stories and travel tips.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} compact />
              ))}
            </div>
            {hasMore ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl bg-[#ff5e00] text-white font-sans font-semibold hover:bg-[#e55500] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? "Loading..." : "Load more posts"}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
