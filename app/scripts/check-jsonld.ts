/**
 * The smallest thing that fails when the structured data quietly changes.
 *
 * JSON-LD is invisible: a wrong shape only shows up once Google has been
 * ignoring it for weeks. Five things carry the weight here:
 *   1. `prune` drops empty fields but keeps the `@id` references intact —
 *      without those references the graph falls apart;
 *   2. the organisation takes CMS values and falls back to `site.ts` per field;
 *   3. a page with questions is ALSO an FAQPage, with exactly those questions;
 *   4. a page node has one path to the organisation, never two;
 *   5. the breadcrumb starts at Home and matches the visible one.
 *
 * Run with `npm run check:jsonld`. Pure functions only — no Sanity, no React.
 */
import assert from 'node:assert/strict';
import {
  ORGANIZATION_ID,
  WEBSITE_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  faqQuestions,
  jsonLdGraph,
  organizationJsonLd,
  pageBreadcrumbLabel,
  pageFaqs,
  pageJsonLd,
  postalAddress,
  prune,
  serializeJsonLd,
  siteJsonLd,
  websiteJsonLd,
  type JsonLdNode,
} from '@/lib/json-ld';
import { SITE_DEFAULTS, SITE_URL, resolveSiteInformation } from '@/lib/site';

/** The node with this `@type` from a graph — `@type` may also be a list. */
function node(graph: JsonLdNode | null, type: string): JsonLdNode {
  const nodes = (graph?.['@graph'] ?? []) as JsonLdNode[];
  const found = nodes.find((item) => {
    const types = item['@type'];
    return Array.isArray(types) ? types.includes(type) : types === type;
  });
  assert.ok(found, `no ${type} in the graph`);
  return found;
}

// 1. prune: empty out, references stay.
assert.deepEqual(
  prune({ '@type': 'Thing', name: 'x', empty: null, blank: '  ', list: [], nest: { a: null } }),
  { '@type': 'Thing', name: 'x' },
);
assert.equal(
  prune({ '@type': 'ImageObject', url: null }),
  undefined,
  'a bare @type is not a node',
);
assert.deepEqual(prune({ '@id': 'https://x/#organization' }), { '@id': 'https://x/#organization' });
assert.deepEqual(prune(['a', null, '', 'b']), ['a', 'b']);
assert.equal(prune([null, undefined]), undefined);
assert.equal(prune(0), 0, 'a zero is a value, not emptiness');
assert.equal(prune(false), false);
assert.equal(jsonLdGraph([null, undefined]), null, 'an empty graph is nothing');

assert.equal(absoluteUrl('/'), SITE_URL);
assert.equal(absoluteUrl(''), SITE_URL);
assert.equal(absoluteUrl('about'), `${SITE_URL}/about`);
assert.equal(absoluteUrl('/about'), `${SITE_URL}/about`);
assert.equal(absoluteUrl('https://elsewhere.example/x'), 'https://elsewhere.example/x');

// 2. Organisation: address parsing, site.ts fallback, CMS values win.
assert.deepEqual(postalAddress(['Prinsengracht 263', '1016 GV Amsterdam']), {
  '@type': 'PostalAddress',
  streetAddress: 'Prinsengracht 263',
  postalCode: '1016 GV',
  addressLocality: 'Amsterdam',
  addressCountry: SITE_DEFAULTS.addressCountry,
});
assert.deepEqual(postalAddress(['Chausseestrasse 1', '10115 Berlin']), {
  '@type': 'PostalAddress',
  streetAddress: 'Chausseestrasse 1',
  postalCode: '10115',
  addressLocality: 'Berlin',
  addressCountry: SITE_DEFAULTS.addressCountry,
});
// Without a recognisable postcode line everything stays street — better than guessing.
assert.deepEqual(postalAddress(['Somewhere 1']), {
  '@type': 'PostalAddress',
  streetAddress: 'Somewhere 1',
  addressCountry: SITE_DEFAULTS.addressCountry,
});
assert.equal(postalAddress([]), undefined);
assert.equal(postalAddress(null), undefined);

const defaults = resolveSiteInformation(null);
const fallback = organizationJsonLd(defaults);
assert.equal(fallback['@id'], ORGANIZATION_ID);
assert.equal(fallback.name, SITE_DEFAULTS.name);
assert.equal(fallback.telephone, SITE_DEFAULTS.phone);
assert.equal(prune(fallback)!.sameAs, undefined, 'no social links, no sameAs');

// The CMS wins field by field; anything an editor left blank falls back, and an
// unreachable CMS (null) is the same as every field being blank.
const merged = resolveSiteInformation({
  name: 'Other Co',
  phone: '  +31 (0)20 000 0000  ',
  description: '   ',
  address: ['Chausseestrasse 1', '10115 Berlin', null],
  socialLinks: ['https://example.com/profile', null, ''],
  language: 'de',
});
assert.equal(merged.name, 'Other Co');
assert.equal(merged.phone, '+31 (0)20 000 0000', 'values are trimmed');
assert.equal(merged.description, SITE_DEFAULTS.description, 'a blank field falls back');
assert.equal(merged.email, SITE_DEFAULTS.email, 'a missing field falls back');
assert.deepEqual(merged.address, ['Chausseestrasse 1', '10115 Berlin']);
assert.deepEqual(merged.socialLinks, ['https://example.com/profile']);
assert.deepEqual(
  resolveSiteInformation({ address: [], badges: [null, ''] }).address,
  [...SITE_DEFAULTS.address],
  'an emptied list falls back too',
);
assert.deepEqual(resolveSiteInformation(null).socialLinks, [], 'sameAs has nothing to fall back to');

const fromCms = prune(organizationJsonLd(merged)) as JsonLdNode;
assert.equal(fromCms.name, 'Other Co');
assert.equal(fromCms.telephone, '+31 (0)20 000 0000');
assert.deepEqual(fromCms.sameAs, ['https://example.com/profile']);
assert.deepEqual(fromCms.address, {
  '@type': 'PostalAddress',
  streetAddress: 'Chausseestrasse 1',
  postalCode: '10115',
  addressLocality: 'Berlin',
  addressCountry: SITE_DEFAULTS.addressCountry,
});

assert.deepEqual(websiteJsonLd(defaults).publisher, { '@id': ORGANIZATION_ID });
assert.equal(websiteJsonLd(defaults).inLanguage, SITE_DEFAULTS.language);
assert.equal(websiteJsonLd(merged).inLanguage, 'de', 'the language follows the CMS');

const site = siteJsonLd(defaults);
assert.equal(node(site, 'Organization')['@id'], ORGANIZATION_ID);
assert.equal(node(site, 'WebSite')['@id'], WEBSITE_ID);

// 3. A page with questions is also an FAQPage, with exactly those questions.
const content = [
  { _type: 'pageHero', breadcrumbLabel: 'About' },
  { _type: 'intro', title: 'Not a question' },
  {
    _type: 'faqs',
    faqs: [
      { title: 'What do you do?', answer: 'Design and engineering.' },
      { title: 'Where are you?', answer: 'Amsterdam.' },
      { title: 'Half filled', answer: null },
    ],
  },
];

assert.deepEqual(pageFaqs(content), [
  { question: 'What do you do?', answer: 'Design and engineering.' },
  { question: 'Where are you?', answer: 'Amsterdam.' },
  { question: 'Half filled', answer: null },
]);
assert.equal(faqQuestions(pageFaqs(content)).length, 2, 'an answerless question is dropped');
assert.equal(pageFaqs([]).length, 0);
assert.equal(pageFaqs(null).length, 0);

assert.equal(pageBreadcrumbLabel(content), 'About');
assert.equal(pageBreadcrumbLabel([{ _type: 'pageHero' }]), undefined);
assert.equal(pageBreadcrumbLabel([{ _type: 'intro' }]), undefined);

const about = pageJsonLd({
  path: '/about',
  title: 'About',
  description: 'Who we are.',
  language: defaults.language,
  faqs: pageFaqs(content),
  trail: [{ name: pageBreadcrumbLabel(content)!, path: '/about' }],
});
const aboutPage = node(about, 'WebPage');
assert.deepEqual(aboutPage['@type'], ['WebPage', 'FAQPage']);
assert.equal(aboutPage['@id'], `${SITE_URL}/about#page`);
assert.equal(aboutPage.inLanguage, SITE_DEFAULTS.language);
assert.equal(
  (pageJsonLd({ path: '/x', language: 'de' })?.['@graph'] as JsonLdNode[])[0].inLanguage,
  'de',
  'a page node follows the CMS language too',
);
assert.deepEqual(aboutPage.isPartOf, { '@id': WEBSITE_ID });
assert.equal((aboutPage.mainEntity as unknown[]).length, 2);
assert.deepEqual((aboutPage.mainEntity as JsonLdNode[])[0], {
  '@type': 'Question',
  name: 'What do you do?',
  acceptedAnswer: { '@type': 'Answer', text: 'Design and engineering.' },
});

// 4. One path to the organisation. A second one (`about`) makes a validator
//    fill that node in twice, along with anything hanging off it.
assert.equal(aboutPage.about, undefined, 'the page must not point at the organisation as well');

// A page without questions stays a plain WebPage, and without a trail it has
// no breadcrumb reference pointing at a node that is not there.
const plain = pageJsonLd({ path: '/plain', title: 'Plain' });
const plainPage = node(plain, 'WebPage');
assert.equal(plainPage['@type'], 'WebPage');
assert.equal(plainPage.mainEntity, undefined);
assert.equal(plainPage.breadcrumb, undefined);
assert.equal(
  ((plain?.['@graph'] ?? []) as JsonLdNode[]).length,
  1,
  'no trail, no BreadcrumbList',
);

// 5. The breadcrumb starts at Home and matches the visible one.
assert.deepEqual(aboutPage.breadcrumb, { '@id': `${SITE_URL}/about#breadcrumb` });
const crumbs = node(about, 'BreadcrumbList');
assert.equal(crumbs['@id'], `${SITE_URL}/about#breadcrumb`);
assert.deepEqual(crumbs.itemListElement, [
  { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
  { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
]);
assert.equal(breadcrumbJsonLd('/about', []), undefined, 'Home alone is not a breadcrumb');

// The serialised graph can never close its own script tag.
assert.ok(
  !serializeJsonLd({ '@type': 'Thing', name: '</script><img onerror=x>' }).includes('<'),
  'every < must be escaped',
);

console.log('check:jsonld — all assertions passed');
