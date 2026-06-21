import { cloudinaryOptimizedImageUrl } from "./cloudinaryUrl";

/**
 * Resolve image src for CDN-backed URLs so we skip Vercel/Next image optimization.
 * Cloudinary & Unsplash already cache transformed variants at the edge — routing
 * through /_next/image duplicates work and lowers cache hit rate.
 */
export function resolveCachedImageSrc(
  url: string | undefined | null,
  maxWidth = 1200,
): { src: string; unoptimized: boolean } {
  const trimmed = url?.trim() || "";
  if (!trimmed) return { src: "", unoptimized: false };

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return { src: trimmed, unoptimized: false };
  }

  if (trimmed.includes("res.cloudinary.com")) {
    return {
      src: cloudinaryOptimizedImageUrl(trimmed, { maxWidth }),
      unoptimized: true,
    };
  }

  if (trimmed.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(trimmed);
      if (!parsed.searchParams.has("w")) parsed.searchParams.set("w", String(maxWidth));
      if (!parsed.searchParams.has("q")) parsed.searchParams.set("q", "80");
      if (!parsed.searchParams.has("fit")) parsed.searchParams.set("fit", "crop");
      return { src: parsed.toString(), unoptimized: true };
    } catch {
      return { src: trimmed, unoptimized: true };
    }
  }

  return { src: trimmed, unoptimized: false };
}
