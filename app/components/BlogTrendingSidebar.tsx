"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EyeIcon } from "hugeicons-react";
import TourLoader from "./TourLoader";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  view_count?: number;
  summary?: string;
  created_at: string;
}

export default function BlogTrendingSidebar() {
  const [trending, setTrending] = useState<PostRow[]>([]);
  const [latest, setLatest] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { createClient } = await import("../utils/supabase/client");
      const supabase = createClient();

      const [trendingRes, latestRes] = await Promise.all([
        supabase
          .from("posts")
          .select("id, title, slug, view_count, summary, created_at")
          .eq("status", "published")
          .order("view_count", { ascending: false })
          .limit(5),
        supabase
          .from("posts")
          .select("id, title, slug, view_count, summary, created_at")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setTrending((trendingRes.data as PostRow[]) || []);
      setLatest((latestRes.data as PostRow[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <TourLoader />
      </div>
    );
  }

  return (
    <aside className="space-y-8 font-sans">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#ff5e00] text-lg" aria-hidden>🔥</span>
          <h2
            className="text-lg font-bold text-[#222] uppercase"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            Trending &amp; most read
          </h2>
        </div>
        <ul className="space-y-4">
          {trending.length === 0 ? (
            <li className="text-sm text-gray-500">No posts yet.</li>
          ) : (
            trending.map((post, i) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex gap-3 items-start hover:text-[#ff5e00]"
                >
                  <span className="text-[#ff5e00] font-bold text-sm shrink-0 w-6">
                    {i + 1}.
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#222] group-hover:text-[#ff5e00] line-clamp-2 leading-snug">
                      {post.title}
                    </p>
                    {(post.view_count ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <EyeIcon className="w-3.5 h-3.5" />
                        {post.view_count} views
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-[#f0f7ff] p-5">
        <h2
          className="text-lg font-bold text-[#222] uppercase mb-4"
          style={{ fontFamily: "var(--font-unlimited-pie)" }}
        >
          Latest topics
        </h2>
        <ul className="space-y-3">
          {latest.map((post) => (
            <li key={`latest-${post.id}`}>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-semibold text-[#0060cc] hover:text-[#ff5e00] line-clamp-2"
              >
                {post.title}
              </Link>
              {post.summary && (
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{post.summary}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
