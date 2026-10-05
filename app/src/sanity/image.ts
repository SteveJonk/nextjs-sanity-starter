import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/client';

const { projectId, dataset } = client.config();

const builder =
  projectId && dataset
    ? createImageUrlBuilder({ projectId, dataset })
    : null;

export type SanityImage = SanityImageSource & {
  _key?: string;
  alt?: string;
};

/**
 * An image field can exist in Sanity without a file — only an `alt` filled
 * in, or the photo removed again. `@sanity/image-url` throws on that
 * ("Unable to resolve image URL from source"), which fails the whole build.
 * Treat such objects as "no image".
 */
function hasImage(source: SanityImageSource | undefined | null): boolean {
  if (!source) return false;
  if (typeof source === 'string') return true;
  const s = source as { asset?: unknown; _ref?: unknown; _id?: unknown; url?: unknown };
  return Boolean(s.asset || s._ref || s._id || s.url);
}

export function urlFor(source: SanityImageSource | undefined | null) {
  if (!hasImage(source)) return null;
  return builder?.image(source as SanityImageSource) ?? null;
}

export function imageSrc(
  source: SanityImage | undefined | null,
  width: number,
  height?: number,
): string | null {
  if (!hasImage(source)) return null;
  let builder = urlFor(source)?.width(width);
  if (height) builder = builder?.height(height).fit('crop');
  return builder?.url() ?? null;
}

export function toImage(
  source: SanityImage | undefined | null,
  width: number,
  height?: number,
): { src: string; alt: string } | undefined {
  const src = imageSrc(source, width, height);
  if (!src) return undefined;
  return { src, alt: source?.alt ?? '' };
}
