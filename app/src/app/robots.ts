import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

/**
 * Served at `/robots.txt`.
 *
 * Crawl everything except API routes, and point at the sitemap so crawlers
 * find pages that nothing links to yet. Set NEXT_PUBLIC_SITE_URL in
 * production — the sitemap URL here has to be absolute.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
