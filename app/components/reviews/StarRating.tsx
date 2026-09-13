"use client";

const STAR_PATH =
  "M12 2.6l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.42 6.2 20.47l1.11-6.46-4.7-4.58 6.49-.95L12 2.6z";

/** A single star — also used by the rating input in the write-review form. */
export function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className="shrink-0"
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

interface StarRatingProps {
  /** Supports fractions — 4.6 renders four full stars and a 60% fifth. */
  value: number;
  size?: number;
  gap?: number;
  className?: string;
  /** Screen-reader label. Omit inside a card that already states the rating. */
  label?: string;
}

export default function StarRating({
  value,
  size = 16,
  gap = 2,
  className = "",
  label,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value || 0));
  const percent = (clamped / 5) * 100;

  const row = (color: string) => (
    <span className="flex" style={{ gap: `${gap}px` }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} color={color} />
      ))}
    </span>
  );

  return (
    <span
      className={`relative inline-flex align-middle ${className}`.trim()}
      role="img"
      aria-label={label ?? `${clamped} out of 5 stars`}
    >
      {row("#e2e5ea")}
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        {row("#ffb400")}
      </span>
    </span>
  );
}
