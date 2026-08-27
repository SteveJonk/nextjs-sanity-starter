/**
 * The `siteInformation` singleton, filled from the defaults in
 * `src/lib/site.ts`.
 *
 * Same deal as the block content: the constants there are both what the front
 * end falls back to and what lands in Sanity, so replacing them once moves
 * both sides. Re-running overwrites the document, so edits made in the studio
 * are lost — seed once at the start of a project, then edit in the studio.
 *
 * `socialLinks` and `logo` are deliberately not seeded: there is nothing
 * truthful to put there, and an empty `sameAs` is better than a made-up one.
 */
import {SITE_DEFAULTS} from '../../src/lib/site'
import {client} from './shared'

export async function seedSiteInformation() {
  console.log('Site information')

  await client.createOrReplace({
    _id: 'siteInformation',
    _type: 'siteInformation' as const,
    name: SITE_DEFAULTS.name,
    description: SITE_DEFAULTS.description,
    language: SITE_DEFAULTS.language,
    phone: SITE_DEFAULTS.phone,
    email: SITE_DEFAULTS.email,
    address: [...SITE_DEFAULTS.address],
    addressCountry: SITE_DEFAULTS.addressCountry,
    badges: [...SITE_DEFAULTS.badges],
  })

  console.log('✓ siteInformation singleton upserted')
}
