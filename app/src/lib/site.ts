/**
 * Site-wide details, and the defaults they fall back to.
 *
 * These live in the CMS as the `siteInformation` singleton. The constants here
 * do two jobs at once, the same way `demo-content.ts` does for blocks: they are
 * what the front end falls back to when a field is empty (or the CMS is
 * unreachable), **and** they are what `npm run seed:site` pushes into Sanity.
 * Replace them once per project and both sides move together.
 *
 * Read the resolved values with `getSiteInformation()` from
 * `src/sanity/site-information.ts` — never reach for `SITE_DEFAULTS` in a
 * component, or an editor's change will not show up there.
 */
export const SITE_DEFAULTS = {
  name: 'Fieldnote',
  description:
    'A small design and engineering studio. We take on a handful of projects a year and stay on them until they are finished.',
  /** BCP 47 language tag. Sets `<html lang>` and `inLanguage` in the graph. */
  language: 'en',
  phone: '+31 (0)20 123 4567',
  email: 'hello@fieldnote.example',
  address: ['Prinsengracht 263', '1016 GV Amsterdam'],
  /** ISO 3166-1 alpha-2 code for the address above. Structured data only. */
  addressCountry: 'NL',
  /** Memberships, certifications, awards. Empty hides the footer row. */
  badges: ['B CORP', 'ISO 27001'],
} as const;

/**
 * The site's public origin, without a trailing slash.
 *
 * The one detail that stays out of the CMS: it comes from the environment
 * because it differs per deploy, and `metadataBase`, `robots.txt` and the
 * structured data all need it before — or without — a CMS round trip. The
 * localhost default keeps `npm run dev` working; set NEXT_PUBLIC_SITE_URL in
 * production.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/** Site details with every field filled in — defaults where the CMS is empty. */
export type SiteInformation = {
  name: string;
  description: string;
  language: string;
  phone: string;
  email: string;
  address: string[];
  addressCountry: string;
  badges: string[];
  /** Profile URLs elsewhere. Empty unless an editor adds some. */
  socialLinks: string[];
  logoUrl: string | null;
};

/** What the CMS hands over: every field optional, any of them blank. */
export type SiteInformationDocument = {
  name?: string | null;
  description?: string | null;
  language?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: Array<string | null> | null;
  addressCountry?: string | null;
  badges?: Array<string | null> | null;
  socialLinks?: Array<string | null> | null;
  logoUrl?: string | null;
} | null;

function text(value: string | null | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function list(
  value: Array<string | null> | null | undefined,
  fallback: readonly string[] = [],
): string[] {
  const items = (value ?? []).map((item) => item?.trim()).filter(Boolean) as string[];
  return items.length ? items : [...fallback];
}

/**
 * Lay the CMS document over the defaults.
 *
 * A field an editor left empty falls back rather than rendering as a blank —
 * which is also what happens when the CMS is unreachable and `doc` is null.
 * `socialLinks` is the exception: nothing to fall back to, so empty is empty.
 */
export function resolveSiteInformation(doc: SiteInformationDocument): SiteInformation {
  return {
    name: text(doc?.name, SITE_DEFAULTS.name),
    description: text(doc?.description, SITE_DEFAULTS.description),
    language: text(doc?.language, SITE_DEFAULTS.language),
    phone: text(doc?.phone, SITE_DEFAULTS.phone),
    email: text(doc?.email, SITE_DEFAULTS.email),
    address: list(doc?.address, SITE_DEFAULTS.address),
    addressCountry: text(doc?.addressCountry, SITE_DEFAULTS.addressCountry),
    badges: list(doc?.badges, SITE_DEFAULTS.badges),
    socialLinks: list(doc?.socialLinks),
    logoUrl: doc?.logoUrl?.trim() || null,
  };
}

/** `+31 (0)20 123 4567` -> `tel:+31201234567`. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function mailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}

export type NavLink = { href: string; label: string };

export type FooterLinkGroup = {
  title: string;
  links: NavLink[];
};
