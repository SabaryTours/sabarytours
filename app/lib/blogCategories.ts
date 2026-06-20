export const BLOG_CATEGORIES = [
  {
    slug: "travel-tips",
    label: "Travel Tips",
    description: "Planning, packing, and getting around Ghana",
  },
  {
    slug: "culture-heritage",
    label: "Culture & Heritage",
    description: "History, traditions, and local life",
  },
  {
    slug: "food-nightlife",
    label: "Food & Nightlife",
    description: "Where to eat, drink, and vibe",
  },
  {
    slug: "destinations",
    label: "Destinations",
    description: "Places to explore across Ghana",
  },
  {
    slug: "adventures",
    label: "Adventures",
    description: "Outdoor thrills and day trips",
  },
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]["slug"];

export function getBlogCategoryLabel(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return BLOG_CATEGORIES.find((item) => item.slug === slug)?.label ?? null;
}

export function isBlogCategorySlug(value: string): value is BlogCategorySlug {
  return BLOG_CATEGORIES.some((item) => item.slug === value);
}
