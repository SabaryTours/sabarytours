import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/login', '/register'],
      },
    ],
    sitemap: 'https://sabarytours.com/sitemap.xml',
  };
}
