"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  averageRating,
  ratingBreakdown,
  resolveReviewPlatform,
  reviewPlatformMeta,
  type ReviewPlatform,
} from "../lib/reviewSources";
import PlatformLogo from "./reviews/PlatformLogo";
import ReviewCard from "./reviews/ReviewCard";
import StarRating from "./reviews/StarRating";
import WriteReviewModal from "./reviews/WriteReviewModal";
import type { PublicReview } from "./reviews/types";

const AUTOPLAY_MS = 6000;

interface ReviewsWidgetProps {
  title?: string;
  subtitle?: string;
  /** Scopes the list and any submitted review to one tour. */
  tourSlug?: string;
  /** "carousel" mirrors the aggregator slider; "grid" shows everything at once. */
  layout?: "carousel" | "grid";
  showWriteReview?: boolean;
  className?: string;
}

function CardSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="h-2.5 w-1/3 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-4 h-3 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-2.5 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-2.5 w-4/5 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

function Arrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous reviews" : "Next reviews"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#222] shadow-sm transition-all hover:border-[#ff5e00] hover:text-[#ff5e00] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-gray-200 disabled:hover:text-[#222]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path
          d={direction === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function ReviewsWidget({
  title = "What travelers are saying",
  subtitle,
  tourSlug,
  layout = "carousel",
  showWriteReview = true,
  className = "",
}: ReviewsWidgetProps) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [positions, setPositions] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const url = tourSlug
          ? `/api/reviews?tourSlug=${encodeURIComponent(tourSlug)}`
          : "/api/reviews";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        if (!active) return;
        setReviews(Array.isArray(data) ? data : []);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [tourSlug]);

  const ratings = useMemo(() => reviews.map((r) => r.rating), [reviews]);
  const average = averageRating(ratings);
  const breakdown = useMemo(() => ratingBreakdown(ratings), [ratings]);

  const platforms = useMemo(() => {
    const counts = new Map<ReviewPlatform, number>();
    reviews.forEach((review) => {
      const key = resolveReviewPlatform(review.source, review.position);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [reviews]);

  /** One card plus the gap — the distance a single arrow press travels. */
  const cardStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const first = track.firstElementChild as HTMLElement | null;
    if (!first) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = cardStep();
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (step <= 0 || maxScroll <= 1) {
      setPositions(1);
      setPosition(0);
      return;
    }
    const total = Math.floor(maxScroll / step) + 1;
    setPositions(total);
    setPosition(Math.min(total - 1, Math.round(track.scrollLeft / step)));
  }, [cardStep]);

  useEffect(() => {
    if (layout !== "carousel") return;
    const track = trackRef.current;
    if (!track) return;

    measure();
    track.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      track.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [layout, measure, reviews.length]);

  const scrollTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      track.scrollTo({ left: index * cardStep(), behavior: "smooth" });
    },
    [cardStep],
  );

  const go = useCallback(
    (delta: number) => {
      const next = Math.min(positions - 1, Math.max(0, position + delta));
      scrollTo(next);
    },
    [position, positions, scrollTo],
  );

  // Auto-advance like the aggregator slider, looping back at the end.
  // The scroll listener is what updates `position`, so the timer only scrolls.
  const positionRef = useRef(0);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (layout !== "carousel" || paused || positions <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      const current = positionRef.current;
      scrollTo(current + 1 >= positions ? 0 : current + 1);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [layout, paused, positions, scrollTo]);

  const hasReviews = reviews.length > 0;

  const writeReviewButton = showWriteReview ? (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#ff5e00] px-6 py-3 text-sm font-bold text-white font-sans shadow-md transition-all hover:bg-[#e55500] hover:shadow-lg"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path
          d="M4 20h4l10-10a2.8 2.8 0 1 0-4-4L4 16v4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Write a review
    </button>
  ) : null;

  return (
    <section className={`font-sans ${className}`.trim()}>
      {title ? (
        <h2
          className="mb-2 text-center text-2xl uppercase text-[#222] sm:text-3xl"
          style={{ fontFamily: "var(--font-unlimited-pie)" }}
        >
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className="mx-auto mb-8 max-w-2xl text-center text-[15px] text-gray-600">
          {subtitle}
        </p>
      ) : (
        <div className="mb-8" />
      )}

      {/* Summary bar */}
      {hasReviews ? (
        <div className="mb-7 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] sm:p-6">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="text-4xl font-bold leading-none text-[#222]">
                  {average.toFixed(1)}
                </div>
                <StarRating value={average} size={15} className="mt-2" />
                <div className="mt-1.5 text-xs text-gray-500">
                  {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </div>
              </div>

              {/* Rating distribution */}
              <div className="hidden w-44 flex-col gap-1 border-l border-gray-100 pl-5 sm:flex">
                {breakdown.map(({ stars, count }) => {
                  const pct = reviews.length
                    ? Math.round((count / reviews.length) * 100)
                    : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-3 text-right text-[11px] text-gray-500">
                        {stars}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#ffb400] transition-[width] duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[11px] tabular-nums text-gray-400">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              {platforms.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {platforms.map(([platform, count]) => {
                    const meta = reviewPlatformMeta(platform);
                    return (
                      <span
                        key={platform}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
                      >
                        <PlatformLogo platform={platform} size={15} />
                        {meta.label}
                        <span className="text-gray-400">{count}</span>
                      </span>
                    );
                  })}
                </div>
              ) : null}
              {writeReviewButton}
            </div>
          </div>
        </div>
      ) : null}

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : failed ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white/60 py-10 text-center text-sm text-gray-500">
          We couldn&apos;t load reviews right now. Please try again shortly.
        </p>
      ) : !hasReviews ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-12 text-center">
          <StarRating value={0} size={22} />
          <h3 className="mt-4 text-base font-bold text-[#222]">No reviews yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to share your experience with Sabary Tours.
          </p>
          {showWriteReview ? <div className="mt-5">{writeReviewButton}</div> : null}
        </div>
      ) : layout === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
        >
          <div
            ref={trackRef}
            className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {positions > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-4">
              <Arrow direction="prev" onClick={() => go(-1)} disabled={position === 0} />

              <div className="flex items-center gap-1.5">
                {Array.from({ length: positions }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollTo(i)}
                    aria-label={`Go to review ${i + 1}`}
                    aria-current={i === position}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === position
                        ? "w-6 bg-[#ff5e00]"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <Arrow
                direction="next"
                onClick={() => go(1)}
                disabled={position >= positions - 1}
              />
            </div>
          ) : null}
        </div>
      )}

      <WriteReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tourSlug={tourSlug}
      />
    </section>
  );
}
