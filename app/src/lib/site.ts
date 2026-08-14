/**
 * Site-wide constants used by the header, footer and CTA blocks.
 *
 * These are the details that appear in too many places to be worth putting in
 * the CMS. The values below belong to the invented studio the demo content is
 * written for — replace all of them once per project.
 */
export const SITE = {
  name: 'Fieldnote',
  /** Used as the meta description fallback and the footer strapline. */
  description:
    'A small design and engineering studio. We take on a handful of projects a year and stay on them until they are finished.',
  phone: '+31 (0)20 123 4567',
  phoneHref: 'tel:+31201234567',
  email: 'hello@fieldnote.example',
  emailHref: 'mailto:hello@fieldnote.example',
  address: ['Prinsengracht 263', '1016 GV Amsterdam'],
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
