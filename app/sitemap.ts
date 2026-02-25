import { MetadataRoute } from 'next';
import { createClient } from './utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sabarytours.com';
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Dynamic package category pages
  const { data: packages } = await supabase
    .from('packages')
    .select('slug, updated_at')
    .order('created_at');

  const packagePages: MetadataRoute.Sitemap = (packages || []).map((pkg: any) => ({
    url: `${baseUrl}/packages/${pkg.slug}`,
    lastModified: pkg.updated_at ? new Date(pkg.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic tour pages
  const { data: tours } = await supabase
    .from('tours')
    .select('slug, category, updated_at')
    .eq('status', 'published');

  const tourPages: MetadataRoute.Sitemap = (tours || []).map((tour: any) => ({
    url: `${baseUrl}/packages/${tour.category || 'tours'}/${tour.slug}`,
    lastModified: tour.updated_at ? new Date(tour.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic blog pages
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published');

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...packagePages, ...tourPages, ...blogPages];
}
