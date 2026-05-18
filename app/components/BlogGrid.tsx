"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EyeIcon, Message01Icon } from "hugeicons-react";
import TourLoader from "./TourLoader";

const PAGE_SIZE = 6;

interface BlogGridProps {
  limit?: number;
  loadMoreHref?: string;
}

export default function BlogGrid({ limit, loadMoreHref }: BlogGridProps) {
  const [posts, setPosts] = useState<any[]>([]);
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

    const mapped =
      data?.map((p) => ({
        ...p,
        image: p.image_url || "/assets/placeholder-blog.jpg",
        views: p.view_count || 0,
        comments: p.comment_count || 0,
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
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="flex flex-col gap-3 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            style={{ width: "350px" }}
          >
            <div
              className="relative overflow-hidden rounded-2xl group"
              style={{
                height: "297.811px",
                background: "linear-gradient(to bottom, #999, #1e1d1d)",
              }}
            >
              <div className="absolute inset-0">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 90vw, 350px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {(post.views > 0 || post.comments > 0) && (
                <div
                  className="absolute top-3 left-3 flex items-center gap-[10px] px-[10px] py-[5px] rounded-[20px]"
                  style={{
                    backdropFilter: "blur(6px)",
                    backgroundColor: "rgba(255,255,255,0.72)",
                    border: "0.5px solid white",
                  }}
                >
                  {post.views > 0 && (
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4 text-[#222]" />
                      <span className="text-[#222] text-[12px] font-bold leading-none">
                        {post.views} views
                      </span>
                    </div>
                  )}
                  {post.views > 0 && post.comments > 0 && (
                    <div className="w-1 h-1 rounded-full bg-[#222]" />
                  )}
                  {post.comments > 0 && (
                    <div className="flex items-center gap-1">
                      <Message01Icon className="w-4 h-4 text-[#222]" />
                      <span className="text-[#222] text-[12px] font-bold leading-none">
                        {post.comments} comment{post.comments !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <h3
              className="text-[#222] text-[16px] font-extrabold leading-[28px] break-normal"
              style={{ hyphens: "manual" }}
            >
              {post.title}
            </h3>
          </Link>
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
