import type { Metadata } from 'next';
/*
 * FONTS — change these two imports to change the site's typefaces.
 *
 * Each one exposes a CSS variable that `globals.css` picks up:
 *   --font-display-src -> --font-display (headings)
 *   --font-sans-src    -> --font-sans    (everything else)
 *
 * Keep the `variable` names as they are and only swap the font, or the theme
 * loses its handle on them. Any next/font/google family works here.
 */
import { Inter_Tight, Schibsted_Grotesk } from 'next/font/google';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { toLabeledHref, type SanityLabeledLink } from '@/lib/links';
import { SITE, type FooterLinkGroup, type NavLink } from '@/lib/site';
import { safeFetch } from '@/sanity/client';
import { FOOTER_QUERY, NAVIGATION_QUERY } from '@/sanity/queries';
import './globals.css';

const display = Schibsted_Grotesk({
  variable: '--font-display-src',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const sans = Inter_Tight({
  variable: '--font-sans-src',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

/**
 * Site-wide metadata defaults.
 *
 * Per-page `seo` fields from the CMS layer on top of this (see
 * `src/sanity/metadata.ts`); anything a page leaves unset falls back here.
 * `metadataBase` is what turns a relative og:image path into an absolute URL,
 * so set NEXT_PUBLIC_SITE_URL in production or social previews will break.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: SITE.name,
    template: `%s - ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
  },
};

const options = { next: { revalidate: 30 } };

type SanityNavigation = {
  navLeft?: SanityLabeledLink[] | null;
  navRight?: SanityLabeledLink[] | null;
} | null;

type SanityFooter = {
  linkGroups?: Array<{
    title?: string | null;
    links?: SanityLabeledLink[] | null;
  } | null> | null;
  copyright?: string | null;
} | null;

function asNavLinks(links: SanityLabeledLink[] | null | undefined): NavLink[] {
  return (links ?? [])
    .map((link) => toLabeledHref(link))
    .filter((link): link is NavLink => Boolean(link));
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Chrome only — a CMS outage leaves the header and footer bare rather than
  // failing every page. Page content is fetched with `client.fetch` and throws.
  const [navigation, footer] = await Promise.all([
    safeFetch<SanityNavigation>(NAVIGATION_QUERY, {}, options),
    safeFetch<SanityFooter>(FOOTER_QUERY, {}, options),
  ]);

  const navLeft = asNavLinks(navigation?.navLeft);
  const navRight = asNavLinks(navigation?.navRight);

  const linkGroups: FooterLinkGroup[] = (footer?.linkGroups ?? [])
    .filter(
      (group): group is { title: string; links?: SanityLabeledLink[] | null } =>
        Boolean(group?.title),
    )
    .map((group) => ({
      title: group.title,
      links: asNavLinks(group.links),
    }));

  return (
    <html
      lang='en'
      data-scroll-behavior='smooth'
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className='min-h-full'>
        <SiteHeader navLeft={navLeft} navRight={navRight} />
        {children}
        <SiteFooter linkGroups={linkGroups} copyright={footer?.copyright} />
      </body>
    </html>
  );
}
