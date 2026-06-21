"use client";

import { useEffect, useRef } from "react";

type TourViewTrackerProps = {
  slug: string;
};

export default function TourViewTracker({ slug }: TourViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    const key = `tour-view-${slug}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(key)) return;

    tracked.current = true;

    void fetch(`/api/tours/${encodeURIComponent(slug)}/view`, { method: "POST" })
      .then(async (res) => {
        if (res.ok && typeof window !== "undefined") {
          sessionStorage.setItem(key, "1");
        }
      })
      .catch(() => {
        tracked.current = false;
      });
  }, [slug]);

  return null;
}
