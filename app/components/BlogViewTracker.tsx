"use client";

import { useEffect, useRef } from "react";
import { GA_MEASUREMENT_ID } from "../lib/googleAnalytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface BlogViewTrackerProps {
  slug: string;
  title: string;
}

export default function BlogViewTracker({ slug, title }: BlogViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    const key = `blog-view-${slug}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(key)) {
      return;
    }

    tracked.current = true;

    const recordView = async () => {
      try {
        const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/view`, {
          method: "POST",
        });
        const data = res.ok ? ((await res.json()) as { views?: number }) : null;
        if (res.ok && typeof window !== "undefined") {
          sessionStorage.setItem(key, "1");
          if (typeof data?.views === "number") {
            window.dispatchEvent(
              new CustomEvent("blog-view-recorded", { detail: { slug, views: data.views } }),
            );
          }
        }
      } catch {
        tracked.current = false;
      }
    };

    void recordView();

    if (GA_MEASUREMENT_ID && typeof window.gtag === "function") {
      window.gtag("event", "blog_view", {
        blog_slug: slug,
        blog_title: title,
        page_path: `/blog/${slug}`,
      });
    }
  }, [slug, title]);

  return null;
}
