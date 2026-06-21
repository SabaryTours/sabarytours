export const BLOG_CATEGORIES = [
  {
    slug: "ghana-travel-guides",
    label: "Ghana Travel Guides",
    description: "Complete guides to planning and exploring Ghana",
  },
  {
    slug: "destinations",
    label: "Destinations",
    description: "Places to explore across Ghana",
  },
  {
    slug: "ghana-culture-history",
    label: "Ghana Culture & History",
    description: "Heritage, traditions, and stories from Ghana",
  },
  {
    slug: "food-local-experience",
    label: "Food & Local Experience",
    description: "Food, nightlife, local vibes, and authentic experiences",
  },
  {
    slug: "travel-tips-hacks",
    label: "Travel Tips & Hacks",
    description: "Planning, packing, and smart ways to travel",
  },
  {
    slug: "sabary-tour-stories",
    label: "Sabary Tour Stories",
    description: "Guest stories and behind-the-scenes from our tours",
  },
  {
    slug: "events-festivals",
    label: "Events & Festivals",
    description: "Festivals, happenings, and what’s on in Ghana",
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
