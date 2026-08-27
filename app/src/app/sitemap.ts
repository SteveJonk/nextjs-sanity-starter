import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { HOME_SLUG, pathForSlug } from '@/lib/links';
import { client } from '@/sanity/client';
import { PAGE_SLUGS_QUERY } from '@/sanity/queries';

const options = { next: { revalidate: 30 } };

/**
 * Every CMS page, listed from the CMS itself.
 *
 * There are no per-page route files, so there is nothing to keep in sync by
 * hand: publish a page in the studio and it appears here. `lastModified`
 * comes from the document's own `_updatedAt`, which is what tells crawlers a
 * page is worth re-fetching.
 *
 * Served at `/sitemap.xml`; `robots.ts` points at it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await client.fetch(PAGE_SLUGS_QUERY, {}, options);

  return pages.map((page) => ({
    url: `${env.siteUrl}${pathForSlug(page.slug)}`,
    lastModified: new Date(page._updatedAt),
    changeFrequency: 'monthly' as const,
    // The home page is the entry point; the rest sit a level below it.
    priority: page.slug === HOME_SLUG ? 1 : 0.8,
  }));
}
