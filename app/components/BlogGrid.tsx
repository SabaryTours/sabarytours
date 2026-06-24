"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TourLoader from "./TourLoader";
import { resolveBlogImageUrl } from "../lib/blogImages";
import BlogPostCard, { type BlogCardPost } from "./BlogPostCard";

const PAGE_SIZE = 6;

interface BlogGridProps {
  limit?: number;
  loadMoreHref?: string;
}

type BlogGridPost = BlogCardPost;

export default function BlogGrid({ limit, loadMoreHref }: BlogGridProps) {
  const [posts, setPosts] = useState<BlogGridPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = limit ?? PAGE_SIZE;
  const isPreview = Boolean(limit && loadMoreHref);

  const fetchPosts = async (pageNumber: number, append: boolean) => {
    const { createClient } = await import("../utils/supabase/client");
    const supabase = createClient();
    const from = pageNumber * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Failed to fetch blog posts:", error);
      return;
    }

    const mapped: BlogGridPost[] =
      data?.map((p) => ({
        id: String(p.id),
        slug: p.slug,
        title: p.title,
        image: resolveBlogImageUrl(p.image_url, p.slug),
        views: p.view_count || 0,
        comments: p.comment_count || 0,
        tags: Array.isArray(p.tags) ? p.tags.filter(Boolean) : [],
        category: typeof p.category === "string" ? p.category : null,
        excerpt: typeof p.summary === "string" ? p.summary.trim() : "",
      })) || [];

    setHasMore(!isPreview && mapped.length === pageSize);
    setPosts((prev) => (append ? [...prev, ...mapped] : mapped));
  };

  useEffect(() => {
    const init = async () => {
      await fetchPosts(0, false);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, loadMoreHref]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    await fetchPosts(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <TourLoader />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">No blogs available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-center" style={{ gap: "20px" }}>
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      {loadMoreHref ? (
        <div className="flex justify-center">
          <Link
            href={loadMoreHref}
            className="px-6 py-3 rounded-xl bg-[#ff5e00] text-white font-sans font-semibold hover:bg-[#e55500] transition-colors"
          >
            View all blogs
          </Link>
        </div>
      ) : (
        hasMore && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-3 rounded-xl bg-[#ff5e00] text-white font-sans font-semibold hover:bg-[#e55500] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMore ? "Loading..." : "Load older blogs"}
            </button>
          </div>
        )
      )}
    </div>
  );
}
