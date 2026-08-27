/**
 * The slug of the page that renders at `/`.
 *
 * The home page is an ordinary `page` document like any other, so every place
 * that turns a slug into a path — links, the sitemap, the `/home` redirect —
 * has to map this one slug to the root. Use `pathForSlug` rather than
 * repeating the check.
 */
export const HOME_SLUG = 'home';

/** Turn a page slug into its path, mapping the home page onto `/`. */
export function pathForSlug(slug: string): string {
  return slug === HOME_SLUG ? '/' : `/${slug}`;
}

export type SanityLink = {
  linkType?: 'internal' | 'external' | null;
  href?: string | null;
  internalLink?: { slug?: string | null } | null;
};

export type SanityLabeledLink = SanityLink & {
  label?: string | null;
};

/** Resolve a Sanity link/cta object to a usable href. */
export function resolveHref(link: SanityLink | undefined | null): string | undefined {
  if (!link) return undefined;
  if (link.linkType === 'internal') {
    const slug = link.internalLink?.slug;
    if (!slug) return undefined;
    return pathForSlug(slug);
  }
  // External, or legacy plain-string href content
  return link.href || undefined;
}

export function toLabeledHref(
  link: SanityLabeledLink | undefined | null,
): { label: string; href: string } | undefined {
  const href = resolveHref(link);
  if (!link?.label || !href) return undefined;
  return { label: link.label, href };
}
