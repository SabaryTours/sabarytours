import { MetadataRoute } from 'next';
import { getSiteUrl } from './lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/booking/success',
          '/booking/error',
          '/booking/verify',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
