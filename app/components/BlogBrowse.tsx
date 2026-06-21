"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search01Icon } from "hugeicons-react";
import TourLoader from "./TourLoader";
import BlogPostCard, { type BlogCardPost } from "./BlogPostCard";
import BlogFeaturedArticle from "./BlogFeaturedArticle";
import { BLOG_CATEGORIES, getBlogCategoryLabel } from "../lib/blogCategories";
import { resolveBlogImageUrl } from "../lib/blogImages";
import { formatBlogHashtag, normalizeBlogTags, tagMatchesParam } from "../lib/blogTags";

const PAGE_SIZE = 6;
const SECTION_PREVIEW_LIMIT = 60;

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

export default function BlogBrowse() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q")?.trim() || "";
  const categoryFromUrl = searchParams.get("category")?.trim() || "all";
  const tagFromUrl = searchParams.get("tag")?.trim() || "";

  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const [sectionPosts, setSectionPosts] = useState<BlogCardPost[]>([]);
  const [posts, setPosts] = useState<BlogCardPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogCardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const isFiltered = Boolean(queryFromUrl) || categoryFromUrl !== "all" || Boolean(tagFromUrl);

  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    let cancelled = false;

    async function loadFeatured() {
      const { createClient } = await import("../utils/supabase/client");
      const supabase = createClient();
      const now = new Date().toISOString();

      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .or(`featured_until.is.null,featured_until.gte.${now}`)
        .order("featured_until", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled && data) {
        setFeaturedPost(mapPostRow(data));
      } else if (!cancelled) {
        setFeaturedPost(null);
      }
    }

    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isFiltered) {
      setSectionPosts([]);
      return;
    }

    let cancelled = false;

    async function loadSectionPosts() {
      const { createClient } = await import("../utils/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(0, SECTION_PREVIEW_LIMIT - 1);

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch blog section previews:", error);
        setSectionPosts([]);
      } else {
        setSectionPosts((data || []).map((row) => mapPostRow(row)));
      }
    }

    loadSectionPosts();
    return () => {
      cancelled = true;
    };
  }, [isFiltered]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setLoading(true);
      setPage(0);

      const { createClient } = await import("../utils/supabase/client");
      const supabase = createClient();

      let request = supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (categoryFromUrl !== "all") {
        request = request.eq("category", categoryFromUrl);
      }

      if (queryFromUrl) {
        const escaped = queryFromUrl.replace(/[%_]/g, "\\$&");
        request = request.or(
          `title.ilike.%${escaped}%,summary.ilike.%${escaped}%,content.ilike.%${escaped}%`,
        );
      }

      if (tagFromUrl) {
        request = request.contains("tags", [tagFromUrl.replace(/^#+/, "").trim()]);
      }

      const { data, error } = await request.range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch blog posts:", error);
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
  }, [queryFromUrl, categoryFromUrl, tagFromUrl]);

  const popularTags = useMemo(() => {
    const source = isFiltered ? posts : sectionPosts.length > 0 ? sectionPosts : posts;
    return Array.from(new Set(source.flatMap((post) => post.tags || []))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [isFiltered, posts, sectionPosts]);

  const sectionGroups = useMemo(() => {
    if (isFiltered) return [];

    return BLOG_CATEGORIES.map((category) => ({
      ...category,
      posts: sectionPosts.filter((post) => post.category === category.slug).slice(0, 3),
    })).filter((section) => section.posts.length > 0);
  }, [isFiltered, sectionPosts]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = searchInput.trim();

    if (trimmed) params.set("q", trimmed);
    else params.delete("q");

    router.push(params.toString() ? `/blog?${params.toString()}` : "/blog");
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "all") params.delete("category");
    else params.set("category", category);

    router.push(params.toString() ? `/blog?${params.toString()}` : "/blog");
  };

  const handleTagChange = (tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (tag) params.set("tag", tag);
    else params.delete("tag");

    router.push(params.toString() ? `/blog?${params.toString()}` : "/blog");
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);

    const { createClient } = await import("../utils/supabase/client");
    const supabase = createClient();
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let request = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (categoryFromUrl !== "all") {
      request = request.eq("category", categoryFromUrl);
    }

    if (queryFromUrl) {
      const escaped = queryFromUrl.replace(/[%_]/g, "\\$&");
      request = request.or(
        `title.ilike.%${escaped}%,summary.ilike.%${escaped}%,content.ilike.%${escaped}%`,
      );
    }

    if (tagFromUrl) {
      request = request.contains("tags", [tagFromUrl.replace(/^#+/, "").trim()]);
    }

    const { data, error } = await request.range(from, to);

    if (!error && data) {
      const mapped = data.map((row) => mapPostRow(row));
      setPosts((prev) => [...prev, ...mapped]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(nextPage);
    }

    setLoadingMore(false);
  };

  return (
    <div className="space-y-8">
      {!isFiltered && featuredPost ? <BlogFeaturedArticle post={featuredPost} /> : null}

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <label className="sr-only" htmlFor="blog-search">
          Search blog posts
        </label>
        <div className="relative flex-1">
          <Search01Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="blog-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title, topic, or keyword..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-sans text-[#222] outline-none focus:border-[#ff5e00] focus:ring-2 focus:ring-[#ff5e00]/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[#ff5e00] px-6 py-3 text-sm font-bold text-white font-sans hover:bg-[#e55500] transition-colors"
        >
          Search
        </button>
      </form>

      <div className="space-y-3">
        <p className="text-sm font-bold text-[#0060cc] font-sans">Browse by section</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors ${
              categoryFromUrl === "all"
                ? "bg-[#ff5e00] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#ff5e00]"
            }`}
          >
            All sections
          </button>
          {BLOG_CATEGORIES.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => handleCategoryChange(category.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors ${
                categoryFromUrl === category.slug
                  ? "bg-[#ff5e00] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#ff5e00]"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {popularTags.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#0060cc] font-sans">Browse by hashtag</p>
            {tagFromUrl ? (
              <button
                type="button"
                onClick={() => handleTagChange(null)}
                className="text-xs font-bold text-gray-500 hover:text-[#ff5e00] font-sans"
              >
                Clear hashtag
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 12).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagChange(tagMatchesParam(tag, tagFromUrl) ? null : tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors ${
                  tagMatchesParam(tag, tagFromUrl)
                    ? "bg-[#ff5e00] text-white"
                    : "bg-orange-50 text-[#ff5e00] hover:bg-orange-100"
                }`}
              >
                {formatBlogHashtag(tag)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <TourLoader />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center font-sans">
          <p className="text-gray-700 font-bold">No posts matched your search.</p>
          <p className="mt-2 text-sm text-gray-500">Try another keyword, section, or hashtag.</p>
        </div>
      ) : isFiltered ? (
        <>
          <p className="text-sm text-gray-600 font-sans">
            {tagFromUrl ? (
              <>
                Showing posts tagged{" "}
                <span className="font-bold text-[#222]">{formatBlogHashtag(tagFromUrl)}</span>
              </>
            ) : queryFromUrl ? (
              <>
                Showing results for <span className="font-bold text-[#222]">&ldquo;{queryFromUrl}&rdquo;</span>
                {categoryFromUrl !== "all" ? (
                  <>
                    {" "}
                    in <span className="font-bold text-[#222]">{getBlogCategoryLabel(categoryFromUrl)}</span>
                  </>
                ) : null}
              </>
            ) : (
              <>
                Showing posts in <span className="font-bold text-[#222]">{getBlogCategoryLabel(categoryFromUrl)}</span>
              </>
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
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
                {loadingMore ? "Loading..." : "Load more results"}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="space-y-12">
          {sectionGroups.length > 0 ? (
            sectionGroups.map((section) => (
              <section key={section.slug} className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div>
                    <h3
                      className="text-xl sm:text-2xl font-bold text-[#222] uppercase"
                      style={{ fontFamily: "var(--font-unlimited-pie)" }}
                    >
                      {section.label}
                    </h3>
                    <p className="text-sm text-gray-600 font-sans">{section.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(section.slug)}
                    className="text-sm font-bold text-[#0060cc] hover:text-[#ff5e00] font-sans transition-colors"
                  >
                    View all in {section.label} →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {section.posts.map((post) => (
                    <BlogPostCard key={post.id} post={post} compact />
                  ))}
                </div>
              </section>
            ))
          ) : null}

          <section className="space-y-5">
            <div>
              <h3
                className="text-xl sm:text-2xl font-bold text-[#222] uppercase"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                All posts
              </h3>
              <p className="text-sm text-gray-600 font-sans">Browse every published article</p>
            </div>
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
                  {loadingMore ? "Loading..." : "Load older blogs"}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
