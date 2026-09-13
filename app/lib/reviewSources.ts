/**
 * Maps a review's stored `source` / `position` fields onto the platform it came
 * from, so the widget can badge each card the way an aggregator would.
 */

export type ReviewPlatform =
  | "google"
  | "tripadvisor"
  | "facebook"
  | "instagram"
  | "twitter"
  | "tiktok"
  | "website";

export type ReviewPlatformMeta = {
  key: ReviewPlatform;
  label: string;
  /** Brand colour used for the badge ring and platform chips. */
  color: string;
};

const PLATFORM_META: Record<ReviewPlatform, ReviewPlatformMeta> = {
  google: { key: "google", label: "Google", color: "#4285F4" },
  tripadvisor: { key: "tripadvisor", label: "Tripadvisor", color: "#00AA6C" },
  facebook: { key: "facebook", label: "Facebook", color: "#1877F2" },
  instagram: { key: "instagram", label: "Instagram", color: "#E1306C" },
  twitter: { key: "twitter", label: "X", color: "#111111" },
  tiktok: { key: "tiktok", label: "TikTok", color: "#010101" },
  website: { key: "website", label: "Sabary Tours", color: "#ff5e00" },
};

const PLATFORM_PATTERNS: [ReviewPlatform, RegExp][] = [
  ["google", /google/i],
  ["tripadvisor", /trip\s*advisor/i],
  ["facebook", /facebook/i],
  ["instagram", /instagram/i],
  ["twitter", /twitter/i],
  ["tiktok", /tik\s*tok/i],
];

/** Best guess at where a review came from. Falls back to the site itself. */
export function resolveReviewPlatform(
  source?: string | null,
  position?: string | null,
): ReviewPlatform {
  const haystack = `${source || ""} ${position || ""}`;
  for (const [platform, pattern] of PLATFORM_PATTERNS) {
    if (pattern.test(haystack)) return platform;
  }
  return "website";
}

export function reviewPlatformMeta(platform: ReviewPlatform): ReviewPlatformMeta {
  return PLATFORM_META[platform];
}

/**
 * Cleans the handle stored in `position`, which admins write as
 * "@serwaaberry - instagram". Returns "" when it just repeats the name.
 */
export function reviewHandle(
  position?: string | null,
  name?: string | null,
): string {
  const raw = (position || "").trim();
  if (!raw) return "";

  const handle = raw
    .replace(
      /\s*[-–—|,]\s*(instagram|twitter|facebook|tiktok|google|trip\s*advisor|x)\s*$/i,
      "",
    )
    .trim();

  if (!handle) return "";
  if (handle.toLowerCase() === (name || "").trim().toLowerCase()) return "";
  return handle;
}

/** Average rating rounded to one decimal, 0 when there is nothing to average. */
export function averageRating(ratings: number[]): number {
  const valid = ratings.filter((r) => Number.isFinite(r) && r > 0);
  if (valid.length === 0) return 0;
  const total = valid.reduce((sum, r) => sum + r, 0);
  return Math.round((total / valid.length) * 10) / 10;
}

/** Count per star level, highest first: index 0 is 5 stars. */
export function ratingBreakdown(ratings: number[]): { stars: number; count: number }[] {
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratings.filter((r) => Math.round(r) === stars).length,
  }));
}
