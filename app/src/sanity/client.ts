import { createClient } from 'next-sanity';
import { env } from '@/lib/env';

export const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: env.apiVersion,
  useCdn: false,
});

/**
 * Fetch that degrades instead of throwing.
 *
 * Use this only for decorative content — the navigation and footer — so an
 * unreachable CMS does not take down every page with it. Page content
 * deliberately does NOT use this: if the CMS is down, the page should error
 * loudly rather than quietly render as missing.
 */
type FetchOptions = {
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function safeFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options?: FetchOptions,
): Promise<T | null> {
  try {
    return await client.fetch<T>(query, params, options);
  } catch (error) {
    console.error(
      `Sanity fetch failed, rendering without it: ${
        error instanceof Error ? error.message : error
      }`,
    );
    return null;
  }
}
