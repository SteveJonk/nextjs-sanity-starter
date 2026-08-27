import { cache } from 'react';
import { resolveSiteInformation, type SiteInformation } from '@/lib/site';
import { safeFetch } from '@/sanity/client';
import { SITE_INFORMATION_QUERY } from '@/sanity/queries';
import type { SITE_INFORMATION_QUERY_RESULT } from '@/sanity/sanity.types';

const options = { next: { revalidate: 30 } };

/**
 * The site's details, with defaults filled in where the CMS is empty.
 *
 * `cache` makes this one request per render no matter how many callers ask —
 * the layout, the metadata and both page routes all do. It uses `safeFetch`,
 * so a CMS outage leaves the site rendering with the defaults from `site.ts`
 * rather than failing every page.
 */
export const getSiteInformation = cache(async (): Promise<SiteInformation> => {
  // `safeFetch` takes an explicit generic, so the typegen augmentation does not
  // apply — name the generated result type instead of hand-writing one.
  const doc = await safeFetch<SITE_INFORMATION_QUERY_RESULT>(
    SITE_INFORMATION_QUERY,
    {},
    options,
  );
  return resolveSiteInformation(doc);
});
