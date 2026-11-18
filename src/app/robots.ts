import { MetadataRoute } from 'next';

const APP_URL = process.env.APP_URL || 'https://hopehorizon.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/dashboard',
          '/api/',
          '/admin/',
          '/(auth)/',
          '/*?*token=',
          '/*?*secret=',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
