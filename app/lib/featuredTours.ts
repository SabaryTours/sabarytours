import { tourDetailHref } from "./tourUrls";

/** Max tours marked featured in admin and shown on the homepage. */
export const MAX_FEATURED_TOURS = 4;

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
    titlePatterns: ["private atv", "quad bike", "quadbike", "oboadaka experience"],
  },
  {
    key: "cape-coast",
    displayTitle: "Cape Coast & Kakum Adventure",
    duration: "1 Day",
    location: "Central Region",
    highlights: "Cape Coast Castle, Kakum Canopy Walk, guided historical experience",
    titlePatterns: ["cape coast & kakum", "cape coast and kakum"],
  },
  {
    key: "accra",
    displayTitle: "Accra City Experience",
    duration: "Half Day / Full Day",
    location: "Greater Accra",
    highlights: "Independence Square, Jamestown, Arts Centre, local food stops",
    titlePatterns: ["accra explorer", "accra city tour"],
  },
  {
    key: "batik",
    displayTitle: "Batik Making Experience",
    duration: "Half Day",
    location: "Greater Accra",
    highlights: "Hands-on wax-resist workshop — create and take home your own fabric",
    titlePatterns: ["batik making", "batik experience"],
  },
];

export function tourHref(category: string | null | undefined, slug: string): string {
  return tourDetailHref(category, slug);
}

export function matchTourByPatterns<T extends { title: string }>(
  tours: T[],
  patterns: string[]
): T | undefined {
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

export type TourForFeaturedCard = {
  title: string;
  slug?: string | null;
  category?: string | null;
  duration?: string | null;
  location?: string | null;
  description?: string | null;
  whats_included?: string[] | null;
  tour_images?: { image_url: string; display_order: number }[] | null;
};

function slugFromTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatTourDuration(duration: string | null | undefined): string {
  const raw = duration ? String(duration).trim() : "";
  if (!raw) return "See tour details";
  if (/day|hour|min/i.test(raw)) return raw;
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    return `${raw} day${n === 1 ? "" : "s"}`;
  }
  return raw;
}

export function buildTourHighlights(tour: {
  whats_included?: string[] | null;
  description?: string | null;
}): string {
  const included = (tour.whats_included || []).map((s) => String(s).trim()).filter(Boolean);
  if (included.length > 0) {
    const text = included.slice(0, 3).join(", ");
    return text.length > 200 ? `${text.slice(0, 197)}...` : text;
  }
  const desc = tour.description?.trim();
  if (desc) return desc.length > 200 ? `${desc.slice(0, 197)}...` : desc;
  return "Guided experience with Sabary Tours";
}

export function tourToFeaturedCard(
  tour: TourForFeaturedCard,
  overrides?: Partial<Pick<FeaturedTourCard, "title" | "duration" | "location" | "highlights">>
): FeaturedTourCard {
  const slug = tour.slug?.trim() || slugFromTitle(tour.title);
  const sortedImages = [...(tour.tour_images || [])].sort(
    (a, b) => a.display_order - b.display_order
  );
  const image = sortedImages[0]?.image_url || "/assets/placeholder-tour.jpg";
  return {
    title: overrides?.title ?? tour.title,
    duration: overrides?.duration ?? formatTourDuration(tour.duration),
    location: overrides?.location ?? (tour.location?.trim() || "Ghana"),
    highlights: overrides?.highlights ?? buildTourHighlights(tour),
    href: tourHref(tour.category, slug),
    image,
  };
}
