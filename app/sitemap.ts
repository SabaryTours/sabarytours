import { MetadataRoute } from "next";
import { createClient } from "./utils/supabase/server";
import { getSiteUrl } from "./lib/seo/site";
import { tourDetailHref } from "./lib/tourUrls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const supabase = await createClient();
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

  const { data: packages } = await supabase
    .from("packages")
    .select("slug, updated_at")
    .order("created_at");

  const packagePages: MetadataRoute.Sitemap = (packages || []).map((pkg: { slug: string; updated_at?: string }) => ({
    url: `${baseUrl}/packages/${pkg.slug}`,
    lastModified: pkg.updated_at ? new Date(pkg.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const { data: tours } = await supabase
    .from("tours")
    .select("slug, category, updated_at")
    .eq("status", "published");

  const tourPages: MetadataRoute.Sitemap = (tours || []).map((tour: { slug: string; category?: string; updated_at?: string }) => ({
    url: `${baseUrl}${tourDetailHref(tour.category || "", tour.slug)}`,
    lastModified: tour.updated_at ? new Date(tour.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published");

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((post: { slug: string; updated_at?: string }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...packagePages, ...tourPages, ...blogPages];
}
