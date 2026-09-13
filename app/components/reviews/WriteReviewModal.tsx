"use client";

import { useEffect, useRef, useState } from "react";

import { Star } from "./StarRating";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

interface WriteReviewModalProps {
  open: boolean;
  onClose: () => void;
  /** Ties the review to a tour when the widget is scoped to one. */
  tourSlug?: string;
}

export default function WriteReviewModal({
  open,
  onClose,
  tourSlug,
}: WriteReviewModalProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Close on Escape and keep the page behind from scrolling.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Reset the form for the next visit, after the closing transition.
  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => {
      setName("");
      setContent("");
      setRating(5);
      setError(null);
      setDone(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourSlug,
          name: name.trim(),
          rating,
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post your review.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="print:hidden fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2
            id="write-review-title"
            className="text-[22px] uppercase leading-none text-[#222]"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            Write a <span className="text-[#ff5e00]">review</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {done ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="#16a34a"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-base font-bold text-[#222] font-sans">
              Thanks for sharing!
            </h3>
            <p className="text-sm text-gray-600 font-sans">
              Your review has been sent for approval and will appear here shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-[#1b0a00] py-3 text-sm font-bold uppercase tracking-wide text-white font-sans transition-colors hover:bg-[#3f1a0b]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#222] font-sans">
                Your rating
              </label>
              <div
                className="flex items-center gap-3"
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={30}
                        color={(hovered ?? rating) >= star ? "#ffb400" : "#e2e5ea"}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-500 font-sans">
                  {RATING_LABELS[hovered ?? rating]}
                </span>
              </div>
            </div>

            <input
              ref={nameRef}
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#222] font-sans transition-colors focus:border-[#ff5e00] focus:ring-2 focus:ring-[#ff5e00]/20 focus:outline-none"
            />

            <textarea
              placeholder="Tell other travelers about your experience…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              maxLength={1500}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#222] font-sans transition-colors focus:border-[#ff5e00] focus:ring-2 focus:ring-[#ff5e00]/20 focus:outline-none"
            />

            {error ? (
              <p className="text-sm text-red-600 font-sans">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-xl bg-[#ff5e00] py-3.5 text-sm font-bold uppercase tracking-wide text-white font-sans shadow-md transition-all hover:bg-[#e55500] hover:shadow-lg disabled:opacity-70"
            >
              {submitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Post review"
              )}
            </button>

            <p className="text-center text-xs text-gray-400 font-sans">
              Reviews are published after a quick check by our team.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
