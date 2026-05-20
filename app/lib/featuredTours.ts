export type FeaturedTourCard = {
  title: string;
  duration: string;
  location: string;
  highlights: string;
  href: string;
  image?: string;
};

export type FeaturedTourMatcher = {
  key: string;
  displayTitle: string;
  duration: string;
  location: string;
  highlights: string;
  /** First published tour whose title contains any pattern (in order) wins */
  titlePatterns: string[];
};

export const FEATURED_TOUR_MATCHERS: FeaturedTourMatcher[] = [
  {
    key: "quad",
    displayTitle: "Quadbike Adventure Experience",
    duration: "7–8 Hours / Full Day",
    location: "Aburi — Eastern Region / Adventure Park",
    highlights:
      "Off-road riding, guided quadbike trails, nature + adrenaline experience",
    titlePatterns: [
      "private atv",
      "quad bike",
      "quadbike",
      "oboadaka experience",
    ],
  },
  {
    key: "cape-coast",
    displayTitle: "Cape Coast & Kakum Adventure",
    duration: "1 Day",
    location: "Central Region",
    highlights:
      "Cape Coast Castle, Kakum Canopy Walk, guided historical experience",
    titlePatterns: ["cape coast & kakum", "cape coast and kakum"],
  },
  {
    key: "accra",
    displayTitle: "Accra City Experience",
    duration: "Half Day / Full Day",
    location: "Greater Accra",
    highlights:
      "Independence Square, Jamestown, Arts Centre, local food stops",
    titlePatterns: ["accra explorer", "accra city tour"],
  },
];

export function tourHref(category: string | null | undefined, slug: string): string {
  const cat = (category || "tours").trim() || "tours";
  return `/packages/${cat}/${slug}`;
}

export function matchTourByPatterns<
  T extends { title: string },
>(tours: T[], patterns: string[]): T | undefined {
  for (const pattern of patterns) {
    const p = pattern.toLowerCase();
    const hit = tours.find((t) => t.title.toLowerCase().includes(p));
    if (hit) return hit;
  }
  return undefined;
}

export function matcherToFallbackCard(m: FeaturedTourMatcher): FeaturedTourCard {
  return {
    title: m.displayTitle,
    duration: m.duration,
    location: m.location,
    highlights: m.highlights,
    href: "/packages",
    image: "/assets/apex-61.JPG",
  };
}
