const FALLBACK = "/assets/placeholder-tour.jpg";

/**
 * Ensures a value from the database is a valid `next/image` src.
 *
 * next/image requires either:
 *   - an absolute URL (http:// or https://)
 *   - a path starting with /
 *
 * If the value is a bare filename ("Hotel.jpg"), empty, or otherwise invalid,
 * we return a safe fallback placeholder.
 */
export function safeImageUrl(
  raw: string | null | undefined,
  fallback = FALLBACK
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  // Absolute URLs are fine
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Paths with a leading slash are fine
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Anything else (bare filename, relative path, garbage) → fallback
  return fallback;
}
