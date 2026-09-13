"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  resolveReviewPlatform,
  reviewHandle,
  reviewPlatformMeta,
} from "../../lib/reviewSources";
import PlatformLogo from "./PlatformLogo";
import StarRating from "./StarRating";
import type { PublicReview } from "./types";

const AVATAR_COLORS = [
  "#ff5e00",
  "#893300",
  "#0060cc",
  "#0ea5e9",
  "#10b981",
  "#8b5cf6",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

/** "3 weeks ago" style label, matching how aggregators date their cards. */
function relativeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secondsPerUnit] of units) {
    const amount = Math.floor(seconds / secondsPerUnit);
    if (amount >= 1) return formatter.format(-amount, unit);
  }
  return "just now";
}

function Avatar({ review }: { review: PublicReview }) {
  const [failed, setFailed] = useState(false);
  const src = review.avatar_url || "";
  const showImage = Boolean(src) && !failed;
  const color = AVATAR_COLORS[review.name.length % AVATAR_COLORS.length];

  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-black/5">
      {showImage ? (
        // Avatars are 44px and come from arbitrary admin-entered hosts (plus
        // generated data: URIs), so a plain img avoids next/image host config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {initials(review.name)}
        </div>
      )}
    </div>
  );
}

export default function ReviewCard({ review }: { review: PublicReview }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const platform = resolveReviewPlatform(review.source, review.position);
  const meta = reviewPlatformMeta(platform);
  const handle = reviewHandle(review.position, review.name);
  const date = relativeDate(review.created_at);

  // "Read more" only appears when the text actually overflows its clamp.
  const measure = useCallback(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    setClamped(el.scrollHeight - el.clientHeight > 2);
  }, [expanded]);

  useEffect(() => {
    measure();
    const el = textRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(16,24,40,0.10)]">
      <header className="flex items-start gap-3">
        <Avatar review={review} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-[#222] font-sans">
            {review.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-gray-500 font-sans">
            {handle ? `${handle} · ` : ""}
            {date}
          </p>
        </div>

        <span
          className="shrink-0 rounded-full bg-white p-1 ring-1 ring-black/5"
          title={`Review from ${meta.label}`}
        >
          <PlatformLogo platform={platform} size={18} />
        </span>
      </header>

      <StarRating
        value={review.rating}
        size={16}
        className="mt-3"
        label={`Rated ${review.rating} out of 5`}
      />

      <p
        ref={textRef}
        className={`mt-3 flex-1 text-[14px] leading-relaxed text-gray-600 font-sans ${
          expanded ? "" : "line-clamp-5"
        }`}
      >
        {review.content}
      </p>

      {(clamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 self-start text-[13px] font-bold text-[#0060cc] font-sans transition-colors hover:text-[#ff5e00]"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </article>
  );
}
