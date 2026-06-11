"use client";

import { useEffect, useState } from "react";
import { EyeIcon } from "hugeicons-react";

type BlogPostViewCounterProps = {
  slug: string;
  initialViews: number;
};

export default function BlogPostViewCounter({ slug, initialViews }: BlogPostViewCounterProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const onRecorded = (event: Event) => {
      const detail = (event as CustomEvent<{ slug: string; views: number }>).detail;
      if (detail?.slug === slug && typeof detail.views === "number") {
        setViews(detail.views);
      }
    };
    window.addEventListener("blog-view-recorded", onRecorded);
    return () => window.removeEventListener("blog-view-recorded", onRecorded);
  }, [slug]);

  return (
    <>
      <span>•</span>
      <span className="inline-flex items-center gap-1">
        <EyeIcon className="w-4 h-4" />
        {views} view{views !== 1 ? "s" : ""}
      </span>
    </>
  );
}
