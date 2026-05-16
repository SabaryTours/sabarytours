/**
 * Inserts Cloudinary delivery transforms after /image/upload/.
 * https://cloudinary.com/documentation/image_transformation_reference
 *
 * Prefer next/image with unoptimized={true} for these URLs so Next does not
 * re-fetch and re-encode what Cloudinary already delivered.
 */
const IMAGE_UPLOAD = "/image/upload/";

export function cloudinaryOptimizedImageUrl(
  url: string | undefined | null,
  opts?: { maxWidth?: number }
): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes(IMAGE_UPLOAD)) return url;
  if (url.includes("f_auto") && url.includes("q_auto")) return url;

  const parts = ["f_auto", "q_auto"];
  if (opts?.maxWidth != null) {
    parts.push(`w_${opts.maxWidth}`, "c_limit");
  }
  return url.replace(IMAGE_UPLOAD, `${IMAGE_UPLOAD}${parts.join(",")}/`);
}
