/**
 * Shared Sanity write helpers for the per-page seed scripts in this folder.
 *
 * Requires SANITY_API_WRITE_TOKEN (Editor or Admin) in app/.env
 * Create one at: https://www.sanity.io/manage -> your project -> API -> Tokens
 *
 * Every upsert is idempotent: assets are reused by filename, FAQs by title,
 * pages by slug, navigation/footer by fixed singleton IDs. Re-running a seed
 * updates in place rather than creating duplicates.
 */
import {createHash, randomBytes} from 'node:crypto'
import {createReadStream, existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient, type SanityClient} from '@sanity/client'
import type {FaqItem} from '../../src/lib/demo-content'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.join(__dirname, '../../public')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_WRITE_TOKEN
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
}
if (!token) {
  throw new Error(
    'Missing SANITY_API_WRITE_TOKEN. Create a token with Editor rights at https://www.sanity.io/manage and add it to app/.env',
  )
}

export const projectRef = `${projectId}/${dataset}`

export const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-26',
  token,
  useCdn: false,
})

export function key(seed?: string) {
  if (seed) {
    return createHash('sha1').update(seed).digest('hex').slice(0, 12)
  }
  return randomBytes(6).toString('hex')
}

export function externalLink(href: string) {
  return {_type: 'link' as const, linkType: 'external' as const, href}
}

export function cta(label: string, href: string) {
  return {_type: 'cta' as const, label, linkType: 'external' as const, href}
}

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

function contentTypeFor(filename: string) {
  return CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? 'image/jpeg'
}

export async function uploadImage(publicPath: string, alt: string) {
  const relative = publicPath.replace(/^\//, '')
  const absolute = path.join(PUBLIC_DIR, relative)
  if (!existsSync(absolute)) {
    throw new Error(`Image not found: ${absolute}`)
  }

  const filename = path.basename(absolute)
  const existingId = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    {filename},
  )

  const assetId =
    existingId ??
    (
      await client.assets.upload('image', createReadStream(absolute), {
        filename,
        contentType: contentTypeFor(filename),
      })
    )._id

  if (existingId) {
    console.log(`  ↻ image ${filename}`)
  } else {
    console.log(`  ↑ image ${filename}`)
  }

  return {
    _type: 'image' as const,
    asset: {_type: 'reference' as const, _ref: assetId},
    alt,
  }
}

export async function upsertFaq(faq: FaqItem) {
  const existingId = await client.fetch<string | null>(
    `*[_type == "faq" && title == $title][0]._id`,
    {title: faq.question},
  )

  const doc = {
    _type: 'faq' as const,
    title: faq.question,
    answer: faq.answer,
    ...(faq.link ? {link: cta(faq.link.label, faq.link.href)} : {}),
    ...(faq.afterLink ? {afterLink: faq.afterLink} : {}),
  }

  if (existingId) {
    const patch = client.patch(existingId).set({
      title: faq.question,
      answer: faq.answer,
      ...(faq.link ? {link: cta(faq.link.label, faq.link.href)} : {}),
      ...(faq.afterLink ? {afterLink: faq.afterLink} : {}),
    })
    if (!faq.link) patch.unset(['link'])
    if (!faq.afterLink) patch.unset(['afterLink'])
    await patch.commit()
    console.log(`  ↻ faq ${faq.question}`)
    return existingId
  }

  const created = await client.create(doc)
  console.log(`  + faq ${faq.question}`)
  return created._id
}

export async function upsertPage(slug: string, title: string, content: unknown[]) {
  const existingId = await client.fetch<string | null>(
    `*[_type == "page" && slug.current == $slug][0]._id`,
    {slug},
  )

  const doc = {
    _type: 'page' as const,
    title,
    slug: {_type: 'slug' as const, current: slug},
    content,
  }

  if (existingId) {
    await client.patch(existingId).set(doc).commit()
    console.log(`✓ page /${slug === 'home' ? '' : slug} updated (${existingId})`)
    return existingId
  }

  const created = await client.create(doc)
  console.log(`✓ page /${slug === 'home' ? '' : slug} created (${created._id})`)
  return created._id
}
