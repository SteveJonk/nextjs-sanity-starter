/**
 * Structured data (schema.org JSON-LD), built from what is in the CMS.
 *
 * Everything here is pure: a query result goes in, a plain object comes out.
 * The routes do the fetching and `<JsonLd>` does the rendering, so every shape
 * below can be checked without Sanity or React (`npm run check:jsonld`).
 *
 * The shape is ONE graph per page with `@id`s pointing at each other, rather
 * than separate blocks repeating the same facts:
 *
 *   - the organisation (`#organization`) and the site (`#website`) appear on
 *     every page — they come from `site.ts` plus the footer document the
 *     layout already fetches;
 *   - each page adds a `WebPage` to that, with a breadcrumb when it has one.
 *
 * Empty fields disappear: `prune` drops null, empty strings, empty arrays and
 * any object left empty by that, so a half-filled document never emits
 * `"telephone": null`.
 */
import { SITE_DEFAULTS, SITE_URL, type SiteInformation } from '@/lib/site';

export type JsonLdNode = Record<string, unknown>;

/** References between nodes — not the document itself, just the key. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const ORGANIZATION_REF = { '@id': ORGANIZATION_ID };
const WEBSITE_REF = { '@id': WEBSITE_ID };

/** `/about` -> `https://example.com/about`; `/` and `''` -> the origin. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  const suffix = path === '/' || path === '' ? '' : `/${path.replace(/^\//, '')}`;
  return `${SITE_URL}${suffix}`;
}

/**
 * Drop everything empty, including an object left empty by that. A bare
 * `@type` does not count as content; an `@id` does — `{"@id": "…#organization"}`
 * is the reference that holds the graph together.
 */
export function prune<T>(value: T): T | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value.trim() === '' ? undefined : (value.trim() as T);
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((item) => item !== undefined);
    return items.length ? (items as T) : undefined;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, prune(item)] as const)
      .filter(([, item]) => item !== undefined);
    const kept = entries.filter(([key]) => key !== '@type');
    if (!kept.length) return undefined;
    return Object.fromEntries(entries) as T;
  }
  return value;
}

/**
 * The JSON that goes inside the `<script>` tag.
 *
 * `<` is escaped: a CMS field containing `</script>` would otherwise end the
 * tag early and spill the rest of the graph into the page as markup. The
 * escape lives here rather than in the component so it can be tested.
 */
export function serializeJsonLd(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** The outer wrapper. Nodes that `prune` empties out fall away. */
export function jsonLdGraph(nodes: (JsonLdNode | null | undefined)[]): JsonLdNode | null {
  const graph = nodes
    .map((node) => (node ? prune(node) : undefined))
    .filter((node): node is JsonLdNode => Boolean(node));

  if (!graph.length) return null;

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ---------------------------------------------------------------------------
// Organisation + site
// ---------------------------------------------------------------------------

/**
 * The last address line is usually "postcode + city". Recognised: Dutch
 * (`1016 GV Amsterdam`), plain numeric (`10115 Berlin`, `94103 San Francisco`)
 * and UK outward+inward codes (`SW1A 1AA London`). Anything else stays part of
 * the street address, which is better than guessing wrong — adjust this one
 * regex if your addresses look different.
 */
const POSTAL_CODE_LINE =
  /^(\d{4}\s?[A-Z]{2}|\d{4,6}|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\s+(.+)$/;

export function postalAddress(
  lines: readonly (string | null | undefined)[] | null | undefined,
  addressCountry: string = SITE_DEFAULTS.addressCountry,
): JsonLdNode | undefined {
  const parts = (lines ?? []).map((line) => line?.trim()).filter(Boolean) as string[];
  if (!parts.length) return undefined;

  const last = parts[parts.length - 1];
  const match = POSTAL_CODE_LINE.exec(last);

  return prune({
    '@type': 'PostalAddress',
    streetAddress: (match ? parts.slice(0, -1) : parts).join(', '),
    postalCode: match?.[1],
    addressLocality: match?.[2],
    addressCountry,
  });
}

/**
 * The company behind the site. `Organization` is the safe generic type; swap it
 * for a more specific one (`LocalBusiness`, `Restaurant`, `RealEstateAgent`) if
 * the site is one — the sub-types carry opening hours, price range and the rest.
 *
 * Everything comes from the resolved `siteInformation`, so the CMS is what
 * search engines read; `site.ts` only supplies the defaults behind it.
 */
export function organizationJsonLd(site: SiteInformation): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: site.name,
    url: SITE_URL,
    description: site.description,
    telephone: site.phone,
    email: site.email,
    address: postalAddress(site.address, site.addressCountry),
    logo: site.logoUrl ? { '@type': 'ImageObject', url: site.logoUrl } : undefined,
    sameAs: site.socialLinks,
  };
}

export function websiteJsonLd(site: SiteInformation): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: site.name,
    inLanguage: site.language,
    publisher: ORGANIZATION_REF,
  };
}

/** The two nodes that appear on every page. */
export function siteJsonLd(site: SiteInformation): JsonLdNode | null {
  return jsonLdGraph([organizationJsonLd(site), websiteJsonLd(site)]);
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export type Crumb = { name: string; path: string };

/** "Home" is always in front; a trail of only Home is not a breadcrumb. */
export function breadcrumbJsonLd(path: string, trail: Crumb[]): JsonLdNode | undefined {
  if (!trail.length) return undefined;

  const items = [{ name: 'Home', path: '/' }, ...trail];

  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export type FaqInput = { question?: string | null; answer?: string | null };

export function faqQuestions(faqs: readonly FaqInput[] | null | undefined): JsonLdNode[] {
  return (faqs ?? [])
    .filter((faq) => faq?.question && faq?.answer)
    .map((faq) => ({
      '@type': 'Question',
      name: faq.question!.trim(),
      acceptedAnswer: { '@type': 'Answer', text: faq.answer!.trim() },
    }));
}

/** One page-builder block, seen from the outside. */
type ContentBlock = { _type?: string } & Record<string, unknown>;

/**
 * The questions on a page, from the `faqs` blocks in the page builder. The FAQ
 * entries are references and `PAGE_QUERY` already resolves them, so what
 * arrives here is the question (`title`) with its answer.
 */
export function pageFaqs(
  content: readonly ContentBlock[] | null | undefined,
): FaqInput[] {
  return (content ?? [])
    .filter((block) => block?._type === 'faqs')
    .flatMap((block) => (Array.isArray(block.faqs) ? block.faqs : []))
    .filter((faq): faq is { title?: string; answer?: string } => Boolean(faq))
    .map((faq) => ({ question: faq.title, answer: faq.answer }));
}

/**
 * The label the `pageHero` block shows in its visible breadcrumb.
 *
 * Structured data should describe what is on the page, so the breadcrumb in
 * the graph follows the one the visitor sees; the page title is the fallback
 * for pages without a `pageHero`.
 */
export function pageBreadcrumbLabel(
  content: readonly ContentBlock[] | null | undefined,
): string | undefined {
  const hero = (content ?? []).find((block) => block?._type === 'pageHero');
  const label = hero?.breadcrumbLabel;
  return typeof label === 'string' && label.trim() ? label.trim() : undefined;
}

export type PageInput = {
  path: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  faqs?: readonly FaqInput[] | null;
  trail?: Crumb[];
  /** BCP 47 tag from `siteInformation`; defaults to the one in `site.ts`. */
  language?: string;
  /** For pages that are something more specific than a `WebPage`. */
  type?: string | string[];
  extra?: JsonLdNode;
};

/**
 * One `WebPage` per URL. If the page carries questions, that same node is ALSO
 * an `FAQPage` — two separate nodes for one URL would claim two pages that do
 * not exist.
 */
export function webPageJsonLd(input: PageInput): JsonLdNode {
  const url = absoluteUrl(input.path);
  const questions = faqQuestions(input.faqs);
  const base = input.type ?? 'WebPage';
  const types = Array.isArray(base) ? [...base] : [base];
  if (questions.length && !types.includes('FAQPage')) types.push('FAQPage');

  return {
    '@type': types.length === 1 ? types[0] : types,
    '@id': `${url}#page`,
    url,
    name: input.title,
    description: input.description,
    inLanguage: input.language ?? SITE_DEFAULTS.language,
    isPartOf: WEBSITE_REF,
    // Deliberately NO `about` pointing at the organisation. The company already
    // hangs off the page via `isPartOf` -> WebSite -> `publisher`, and a second
    // path to that node means a validator fills it in twice — including
    // anything attached to it, such as a rating. One path to a node, always.
    primaryImageOfPage: input.imageUrl ? { '@type': 'ImageObject', url: input.imageUrl } : undefined,
    breadcrumb: input.trail?.length ? { '@id': `${url}#breadcrumb` } : undefined,
    mainEntity: questions.length ? questions : undefined,
    ...input.extra,
  };
}

/** What one CMS page adds to the graph. */
export function pageJsonLd(input: PageInput): JsonLdNode | null {
  return jsonLdGraph([
    webPageJsonLd(input),
    input.trail?.length ? breadcrumbJsonLd(input.path, input.trail) : undefined,
  ]);
}
