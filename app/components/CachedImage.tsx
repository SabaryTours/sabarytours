import Image, { type ImageProps } from "next/image";
import { resolveCachedImageSrc } from "../lib/cachedImage";

type CachedImageProps = Omit<ImageProps, "src"> & {
  src: string;
  /** Max width passed to Cloudinary/Unsplash transforms for stable CDN cache keys. */
  maxWidth?: number;
};

export default function CachedImage({
  src,
  maxWidth,
  unoptimized,
  ...props
}: CachedImageProps) {
  const resolved = resolveCachedImageSrc(src, maxWidth);
  const finalSrc = resolved.src || src;

  return (
    <Image
      {...props}
      src={finalSrc}
      unoptimized={unoptimized ?? resolved.unoptimized}
    />
  );
}
