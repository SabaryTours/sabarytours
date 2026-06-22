import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "./lib/seo/site";
import { tourDetailHref } from "./lib/tourUrls";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function cleanSlug(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/packages`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/featured-tours`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/upcoming-tours`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/customized-package`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const { data: packages, error: packagesError } = await supabase
    .from("packages")
    .select("slug, updated_at")
    .order("created_at");

  if (packagesError) {
    console.error("sitemap: failed to load packages", packagesError.message);
  }

  const packagePages: MetadataRoute.Sitemap = (packages || [])
    .map((pkg) => {
      const slug = cleanSlug(pkg.slug);
      if (!slug) return null;
      return {
        url: `${baseUrl}/packages/${slug}`,
        lastModified: pkg.updated_at ? new Date(pkg.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const { data: tours, error: toursError } = await supabase
    .from("tours")
    .select("slug, category, updated_at")
    .eq("status", "published");

  if (toursError) {
    console.error("sitemap: failed to load tours", toursError.message);
  }

  const tourPages: MetadataRoute.Sitemap = (tours || [])
    .map((tour) => {
      const slug = cleanSlug(tour.slug);
      if (!slug) return null;
      const href = tourDetailHref(tour.category, slug);
      if (href === "/packages") return null;
      return {
        url: `${baseUrl}${href}`,
        lastModified: tour.updated_at ? new Date(tour.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published");

  if (postsError) {
    console.error("sitemap: failed to load posts", postsError.message);
  }

  const blogPages: MetadataRoute.Sitemap = (posts || [])
    .map((post) => {
      const slug = cleanSlug(post.slug);
      if (!slug) return null;
      return {
        url: `${baseUrl}/blog/${slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return [...staticPages, ...packagePages, ...tourPages, ...blogPages];
}
