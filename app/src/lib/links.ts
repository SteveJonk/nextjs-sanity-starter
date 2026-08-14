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
    return slug === 'home' ? '/' : `/${slug}`;
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
