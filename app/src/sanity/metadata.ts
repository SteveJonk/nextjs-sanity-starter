import type { SanityImageSource } from '@sanity/image-url';
import type { Metadata } from 'next';
import { urlFor } from '@/sanity/image';

export type SanitySeo = {
  title?: string | null;
  description?: string | null;
  ogImage?: SanityImageSource | null;
  noIndex?: boolean | null;
};

type SanityPage = {
  title?: string | null;
  seo?: SanitySeo | null;
} | null;

/**
 * Map a page document's `seo` object onto Next metadata.
 *
 * IMPORTANT — Next merges metadata by KEY PRESENCE, not by value. Returning
 * `{ title: undefined }` deletes the root layout's title rather than
 * inheriting it, so every optional key below is added with a conditional
 * spread and is simply absent when the CMS field is empty. Keep that pattern
 * when you add fields here.
 */
type Options = {
  /**
   * On the home page the document title ("Home") is not a useful <title>, so
   * an unset `seo.title` falls through to the layout default instead.
   */
  isHome?: boolean;
};

export function pageMetadata(page: SanityPage, options?: Options): Metadata {
  if (!page) {
    return { title: 'Page not found', robots: { index: false } };
  }

  const seo = page.seo ?? {};
  const title = seo.title || (options?.isHome ? null : page.title) || null;
  const description = seo.description || null;
  const image = seo.ogImage
    ? urlFor(seo.ogImage)?.width(1200).height(630).fit('crop').url()
    : null;

  return {
    // The root layout's `title.template` appends the site name.
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    ...(title || description || image
      ? {
          openGraph: {
            type: 'website',
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
            ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
          },
        }
      : {}),
    ...(image ? { twitter: { card: 'summary_large_image' as const } } : {}),
  };
}
