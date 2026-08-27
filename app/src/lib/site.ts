/**
 * Site-wide constants used by the header, footer and CTA blocks.
 *
 * These are the details that appear in too many places to be worth putting in
 * the CMS. The values below belong to the invented studio the demo content is
 * written for — replace all of them once per project.
 */
export const SITE = {
  name: 'Fieldnote',
  /**
   * The site's public origin, without a trailing slash.
   *
   * The one value here that comes from the environment, because it differs per
   * deploy: `metadataBase`, the sitemap, `robots.txt` and the structured data
   * all build absolute URLs from it. The localhost default keeps `npm run dev`
   * working; set NEXT_PUBLIC_SITE_URL in production.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, ''),
  /** Used as the meta description fallback and the footer strapline. */
  description:
    'A small design and engineering studio. We take on a handful of projects a year and stay on them until they are finished.',
  phone: '+31 (0)20 123 4567',
  phoneHref: 'tel:+31201234567',
  email: 'hello@fieldnote.example',
  emailHref: 'mailto:hello@fieldnote.example',
  address: ['Prinsengracht 263', '1016 GV Amsterdam'],
  /** ISO 3166-1 country code for the address above, used in structured data. */
  addressCountry: 'NL',
  /**
   * BCP 47 language tag. Sets `<html lang>` and `inLanguage` in the structured
   * data, so the two cannot drift apart.
   */
  language: 'en',
} as const;

export type NavLink = { href: string; label: string };

export type FooterLinkGroup = {
  title: string;
  links: NavLink[];
};

/**
 * Small text badges in the footer — memberships, certifications, awards.
 * Set to an empty array to hide the row.
 */
export const FOOTER_BADGES: readonly string[] = ['B CORP', 'ISO 27001'];
