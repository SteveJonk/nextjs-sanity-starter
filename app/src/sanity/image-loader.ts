import type { ImageLoaderProps } from 'next/image';

/** Quality for the Sanity CDN; with `auto=format` that usually ends up WebP/AVIF. */
export const SANITY_QUALITY = 85;

/**
 * Sanity images the CDN can resize itself. SVGs are excluded: they should come
 * through unscaled.
 */
export function isSanityImage(src: unknown): src is string {
  if (typeof src !== 'string' || !src.startsWith('https://cdn.sanity.io/images/')) return false;
  return !src.split('?')[0].toLowerCase().endsWith('.svg');
}

/**
 * Loader for next/image: lets the Sanity CDN render every srcset width straight
 * from the original, instead of Next resizing and recompressing an
 * already-compressed fixed size.
 *
 * The `w`/`h` that `imageSrc()` puts in the URL then only act as an aspect
 * ratio: for a crop (`h` present) the height scales with the width. Other
 * parameters (`rect` from a hotspot crop, `fit`) are kept.
 */
export function sanityLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  const params = url.searchParams;
  const w = Number(params.get('w'));
  const h = Number(params.get('h'));

  params.set('w', String(width));
  if (w > 0 && h > 0) params.set('h', String(Math.round((width * h) / w)));
  params.set('q', String(quality ?? SANITY_QUALITY));
  params.set('auto', 'format');

  // URLSearchParams encodes the commas in `rect=` as %2C; keep them the way
  // @sanity/image-url writes them.
  return url.toString().replace(/%2C/gi, ',');
}
