/**
 * Everything the app reads from the environment, in one place.
 *
 * Copy `.env.example` to `.env` and fill in the project id before running
 * `npm run dev`. The id is not a secret — it ships in the client bundle — so
 * it lives in a `NEXT_PUBLIC_` variable.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill it in — see the README under "Connect a Sanity project".`,
    );
  }
  return value;
}

/** No trailing slash — callers append their own path. */
function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export const env = {
  projectId: required(
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  ),
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  /** Pin this: Sanity treats the date as the API contract version. */
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-07-26',
  /**
   * The site's public origin, without a trailing slash.
   *
   * Used by `metadataBase` for absolute OG image URLs, and by the sitemap and
   * robots routes. The localhost fallback keeps `npm run dev` working; set the
   * real value in production or every absolute URL points at localhost.
   */
  siteUrl: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  /**
   * Analytics, both optional — leave them unset and no third-party script is
   * loaded at all. See `src/components/TrackingScripts.tsx`.
   */
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || undefined,
  facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || undefined,
};
