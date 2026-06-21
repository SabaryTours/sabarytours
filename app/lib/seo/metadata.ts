import type { Metadata } from "next";
import { absoluteUrl } from "./site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  images?: string[];
  keywords?: string[];
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  images = [],
  keywords = [],
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const ogImages = images
    .filter(Boolean)
    .map((img) => (img.startsWith("http") ? img : absoluteUrl(img)));

  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical },
    ...(keywords.length > 0 ? { keywords } : {}),
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description: description.slice(0, 160),
      url: canonical,
      type: "website",
      ...(ogImages.length > 0 ? { images: ogImages.map((url) => ({ url })) } : {}),
    },
  };
}
