/**
 * Seeds the navigation and footer singletons.
 *
 * Menu items point at pages by reference, so run this after seeding the pages
 * — until a page exists the link falls back to a plain path.
 */
import {SITE} from '../../src/lib/site'
import {client, key} from './shared'

function navLinkExternal(label: string, href: string) {
  return {
    _key: key(`${label}:${href}`),
    label,
    linkType: 'external' as const,
    href,
  }
}

function navLinkInternal(label: string, pageId: string) {
  return {
    _key: key(`internal:${label}:${pageId}`),
    label,
    linkType: 'internal' as const,
    internalLink: {_type: 'reference' as const, _ref: pageId},
  }
}

async function pageIdBySlug(slug: string) {
  return client.fetch<string | null>(
    `*[_type == "page" && slug.current == $slug][0]._id`,
    {slug},
  )
}

/** Link to a seeded page by slug, falling back to a plain path if it is missing. */
async function pageLink(label: string, slug: string) {
  const id = await pageIdBySlug(slug)
  return id ? navLinkInternal(label, id) : navLinkExternal(label, `/${slug}`)
}

async function upsertNavigation() {
  const aboutLink = await pageLink('About', 'about')

  // The header splits its menu either side of the logo.
  const doc = {
    _id: 'navigation',
    _type: 'navigation' as const,
    navLeft: [aboutLink, navLinkExternal('Services', '#')],
    navRight: [navLinkExternal('Work', '#'), navLinkExternal('Contact', '#')],
  }

  await client.createOrReplace(doc)
  console.log('✓ navigation singleton upserted')
}

async function upsertFooter() {
  const aboutLink = await pageLink('About', 'about')

  const doc = {
    _id: 'footer',
    _type: 'footer' as const,
    linkGroups: [
      {
        _key: key('footer-company'),
        title: 'Company',
        links: [aboutLink, navLinkExternal('Work', '#')],
      },
      {
        _key: key('footer-more'),
        title: 'More',
        links: [
          navLinkExternal('Services', '#'),
          navLinkExternal('Contact', '#'),
        ],
      },
    ],
    copyright: `© ${new Date().getFullYear()} ${SITE.name}`,
  }

  await client.createOrReplace(doc)
  console.log('✓ footer singleton upserted')
}

export async function seedNavigation() {
  console.log('Navigation & footer')
  await upsertNavigation()
  await upsertFooter()
}
