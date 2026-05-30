const PLACEHOLDER = "/assets/placeholder-blog.jpg";

/** Curated cover images for legacy posts whose DB `image_url` is a bare filename. */
const SLUG_COVER_IMAGES: Record<string, string> = {
  "aburi-botanical-gardens":
    "https://images.unsplash.com/photo-1590523277543-a94d0e5e36a1?w=1200&h=675&fit=crop",
  "adom-waterfalls":
    "https://images.unsplash.com/photo-1432407693419-9c9a072059ec?w=1200&h=675&fit=crop",
  "akaa-waterfalls":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop",
  "bonsu-ecopark":
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=675&fit=crop",
  "nzulezu-the-village-on-stilts":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=675&fit=crop",
  "most-visited-tourist-destinations-in-ghana":
    "https://images.unsplash.com/photo-1596394516093-a501276e619f?w=1200&h=675&fit=crop",
  "the-need-for-guided-tours":
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=675&fit=crop",
  "the-13th-edition-of-chale-wote-festival":
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=675&fit=crop",
  "quad-bike-destinations-in-ghana":
    "https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=1200&h=675&fit=crop",
  "escaping-city-pressure":
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=675&fit=crop",
  "top-art-galleries-in-ghana-you-must-visit":
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=675&fit=crop",
  "how-to-apply-for-a-ghanaian-passport-abroad-a-step-by-step-guide-for-ghanaians-in-the-diaspora":
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=675&fit=crop",
  "top-12-art-galleries-in-ghana-you-must-visit-2025-guide":
    "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=1200&h=675&fit=crop",
  "top-10-most-visited-tourist-attractions-in-ghana-2024-report":
    "https://images.unsplash.com/photo-1596394516093-a501276e619f?w=1200&h=675&fit=crop",
  "how-to-apply-for-a-ghana-visa-online-2025-guide-ghana-travel-requirements":
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=675&fit=crop",
  "ghana-officially-launches-december-in-gh-2025":
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=675&fit=crop",
  "ghana-cedi-at-60-and-its-relevance-to-the-tourism-sector":
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=675&fit=crop",
  "top-december-events-in-ghana-2025-your-ultimate-detty-december-guide":
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=675&fit=crop",
  "top-tourist-destinations-in-ghana-2025-edition":
    "https://images.unsplash.com/photo-1547471080-7cc2caa137a0?w=1200&h=675&fit=crop",
  "ghana-airports-boosts-traveler-confidence-new-anti-extortion-hotline-launched":
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=675&fit=crop",
  "ghana-reduces-passport-application-fees-to-ghs-350-what-travelers-need-to-know":
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=675&fit=crop",
  "some-facts-you-need-to-know-about-wli-waterfall":
    "https://images.unsplash.com/photo-1432407693419-9c9a072059ec?w=1200&h=675&fit=crop",
  "the-year-of-return-monument":
    "https://images.unsplash.com/photo-1596394516093-a501276e619f?w=1200&h=675&fit=crop",
  "fort-william-highest-transporter-of-slaves-in-ghana":
    "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&h=675&fit=crop",
  "how-boti-falls-was-discovered":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop",
  "five-unkown-waterfalls-in-ghana":
    "https://images.unsplash.com/photo-1432407693419-9c9a072059ec?w=1200&h=675&fit=crop",
  "experience-10-adventurous-activities-in-ghana":
    "https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=1200&h=675&fit=crop",
  "experience-ghana-share-ghana-initiative-launched":
    "https://images.unsplash.com/photo-1547471080-7cc2caa137a0?w=1200&h=675&fit=crop",
  "experience-amazing-getaway-destinations-in-aburi":
    "https://images.unsplash.com/photo-1590523277543-a94d0e5e36a1?w=1200&h=675&fit=crop",
};

function legacyUploadBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_LEGACY_BLOG_IMAGE_BASE_URL?.trim();
  if (fromEnv) return fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`;
  return "https://www.sabarytours.com/wp-content/uploads/";
}

export function resolveBlogImageUrl(
  imageUrl: string | null | undefined,
  slug?: string | null,
): string {
  const trimmed = imageUrl?.trim() || "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  if (slug && SLUG_COVER_IMAGES[slug]) {
    return SLUG_COVER_IMAGES[slug];
  }
  if (trimmed) {
    return `${legacyUploadBase()}${encodeURIComponent(trimmed)}`;
  }
  return PLACEHOLDER;
}
