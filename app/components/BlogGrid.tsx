"use client";

import CachedImage from "./CachedImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EyeIcon, Message01Icon } from "hugeicons-react";
import TourLoader from "./TourLoader";
import { resolveBlogImageUrl } from "../lib/blogImages";
import ShareButtons from "./ShareButtons";

const PAGE_SIZE = 6;

interface BlogGridProps {
  limit?: number;
  loadMoreHref?: string;
}

type BlogGridPost = {
  id: string;
  slug: string;
  title: string;
  image: string;
  views: number;
  comments: number;
  tags: string[];
};

export default function BlogGrid({ limit, loadMoreHref }: BlogGridProps) {
  const [posts, setPosts] = useState<BlogGridPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTag, setSelectedTag] = useState("all");

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
        image: resolveBlogImageUrl(p.image_url, p.slug),
        views: p.view_count || 0,
        comments: p.comment_count || 0,
        tags: Array.isArray(p.tags) ? p.tags.filter(Boolean) : [],
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

  const tags = Array.from(new Set(posts.flatMap((post) => post.tags || []))).sort();
  const visiblePosts =
    selectedTag === "all"
      ? posts
      : posts.filter((post) => (post.tags || []).includes(selectedTag));

  return (
    <div className="space-y-8">
      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedTag("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors ${
              selectedTag === "all"
                ? "bg-[#ff5e00] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#ff5e00]"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors ${
                selectedTag === tag
                  ? "bg-[#ff5e00] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#ff5e00]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap justify-center" style={{ gap: "20px" }}>
        {visiblePosts.map((post) => (
          <article
            key={post.id}
            className="flex flex-col gap-3"
            style={{ width: "350px" }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="flex flex-col gap-3 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            >
              <div
                className="relative overflow-hidden rounded-2xl group"
                style={{
                  height: "297.811px",
                  background: "linear-gradient(to bottom, #999, #1e1d1d)",
                }}
              >
                <div className="absolute inset-0">
                  <CachedImage
                    src={post.image}
                    alt={post.title}
                    fill
                    maxWidth={700}
                    sizes="(max-width: 640px) 90vw, 350px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {post.comments > 0 && (
                  <div
                    className="absolute top-3 left-3 flex items-center gap-[10px] px-[10px] py-[5px] rounded-[20px]"
                    style={{
                      backdropFilter: "blur(6px)",
                      backgroundColor: "rgba(255,255,255,0.72)",
                      border: "0.5px solid white",
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Message01Icon className="w-4 h-4 text-[#222]" />
                      <span className="text-[#222] text-[12px] font-bold leading-none">
                        {post.comments} comment{post.comments !== 1 ? "s" : ""}
                      </span>
                    </div>
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
            {post.views > 0 && (
              <p className="text-xs text-gray-500 font-sans -mt-1 flex items-center gap-1">
                <EyeIcon className="w-3.5 h-3.5" />
                {post.views} view{post.views !== 1 ? "s" : ""}
              </p>
            )}
            {post.tags?.length ? (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="rounded-full bg-orange-50 px-2 py-1 text-[11px] font-bold text-[#ff5e00] font-sans">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <ShareButtons
              title={post.title}
              path={`/blog/${post.slug}`}
              text={`Read this Sabary Tours blog: ${post.title}`}
              compact
            />
          </article>
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
