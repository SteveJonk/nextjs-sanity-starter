/**
 * Queries, types and formatting helpers for the Media panel (`MediaTool.tsx`).
 *
 * Kept apart from the component so the GROQ and the text formatting can be read
 * — and reused — on their own; the panel itself is only about the UI.
 */

/** The two document types Sanity creates for you on upload. */
export const ASSET_TYPES = ['sanity.imageAsset', 'sanity.fileAsset'] as const

/**
 * The overview list. Only the fields a card or the search box needs — an
 * image's `metadata` carries a base64 LQIP and a colour palette, and fetching
 * that for hundreds of files is a waste of bandwidth. The rest arrives when a
 * single file is opened, through ASSET_QUERY.
 *
 * This query deliberately does not look at references: that is the expensive
 * part, and it happens separately in USAGE_QUERY so the grid is there at once.
 */
export const ASSETS_QUERY = `*[_type in $types] | order(_createdAt desc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  originalFilename,
  title,
  description,
  altText,
  url,
  size,
  mimeType,
  extension,
  "width": metadata.dimensions.width,
  "height": metadata.dimensions.height
}`

/**
 * The ids of the files at least one document points at — more than that the
 * overview does not need, because it shows a yes/no label rather than a count.
 * (A count would be wrong anyway: `references()` returns a draft and its
 * published version as two documents. The detail panel deduplicates them.)
 *
 * Two things make this lighter than a `count()` per file inside ASSETS_QUERY:
 * `defined(…[0])` stops at the first hit instead of counting every reference,
 * and the answer is a list of ids rather than a field on every file. It also
 * runs alongside the list, not before it.
 */
export const USAGE_QUERY = `*[_type in $types && defined(*[references(^._id)][0])]._id`

/** One file with everything on it, plus where it is used. */
export const ASSET_QUERY = `{
  "asset": *[_id == $id][0],
  "usage": *[references($id)] | order(_type asc) {
    _id,
    _type,
    "title": coalesce(title, name, label, _id)
  }
}`

export type MediaAsset = {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  originalFilename?: string | null
  title?: string | null
  description?: string | null
  altText?: string | null
  url: string
  size?: number | null
  mimeType?: string | null
  extension?: string | null
  width?: number | null
  height?: number | null
}

/** The full asset document; which fields it carries differs per upload. */
export type MediaAssetDetail = MediaAsset & {
  assetId?: string | null
  sha1hash?: string | null
  path?: string | null
  creditLine?: string | null
  metadata?: {
    dimensions?: {width?: number; height?: number; aspectRatio?: number}
    hasAlpha?: boolean
    isOpaque?: boolean
    palette?: {dominant?: {background?: string; foreground?: string}}
    exif?: Record<string, unknown>
  } | null
}

export type MediaUsage = {
  _id: string
  _type: string
  title?: string | null
}

/**
 * What an editor knows a document type as in the studio. A type that is missing
 * here falls back to its raw name, so adding a document type is optional —
 * add a line when the raw name would confuse an editor.
 */
const TYPE_LABELS: Record<string, string> = {
  page: 'Page',
  faq: 'FAQ',
  form: 'Form',
  navigation: 'Navigation',
  footer: 'Footer',
  siteInformation: 'Site information',
  formGeneralSettings: 'Form settings',
}

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type
}

export function isImage(asset: {_type: string; mimeType?: string | null}): boolean {
  return asset._type === 'sanity.imageAsset' || Boolean(asset.mimeType?.startsWith('image/'))
}

/** What `client.assets.upload()` wants as its first argument. */
export function uploadKind(file: {type: string}): 'image' | 'file' {
  return file.type.startsWith('image/') ? 'image' : 'file'
}

export function formatBytes(bytes?: number | null): string {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} kB`
  return `${(kb / 1024).toFixed(1)} MB`
}

/** `undefined` as the locale: the editor's own browser setting decides. */
export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {day: 'numeric', month: 'long', year: 'numeric'})
}

export function formatDimensions(asset: {width?: number | null; height?: number | null}): string {
  if (!asset.width || !asset.height) return '—'
  return `${asset.width} × ${asset.height} px`
}

/** The name a file goes by in the overview. */
export function displayName(asset: {
  originalFilename?: string | null
  title?: string | null
  _id: string
}): string {
  return asset.title || asset.originalFilename || asset._id
}

/**
 * Every word in the search has to appear somewhere in the text fields — so
 * "garden jpg" finds `back-garden.jpg` but not `garden.png`.
 */
export function matchesSearch(asset: MediaAsset, search: string): boolean {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true

  const haystack = [
    asset.originalFilename,
    asset.title,
    asset.description,
    asset.altText,
    asset.extension,
    asset.mimeType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return terms.every((term) => haystack.includes(term))
}

export type MediaFilter = 'all' | 'images' | 'files' | 'unused'

/**
 * `inUse` is `null` while USAGE_QUERY is still running. The "unused" filter is
 * disabled in the UI until then, so in practice this case does not come up;
 * here it counts as "don't know yet" and therefore not as unused.
 */
export function matchesFilter(
  asset: MediaAsset,
  filter: MediaFilter,
  inUse: boolean | null,
): boolean {
  if (filter === 'images') return isImage(asset)
  if (filter === 'files') return !isImage(asset)
  if (filter === 'unused') return inUse === false
  return true
}

/**
 * `references()` returns a draft and its published version as two documents.
 * To an editor that is one document, so fold them together; the published
 * version wins when both are there.
 */
export function dedupeUsage(usage: MediaUsage[]): (MediaUsage & {draft: boolean})[] {
  const byBaseId = new Map<string, MediaUsage & {draft: boolean}>()

  for (const doc of usage) {
    const draft = doc._id.startsWith('drafts.')
    const baseId = draft ? doc._id.slice('drafts.'.length) : doc._id
    const existing = byBaseId.get(baseId)
    if (!existing || (existing.draft && !draft)) {
      byBaseId.set(baseId, {...doc, _id: baseId, draft})
    }
  }

  return [...byBaseId.values()]
}

/** A thumbnail at the size we need; Sanity's CDN scales the original for us. */
export function thumbnailUrl(url: string, size = 320): string {
  return `${url}?w=${size}&h=${size}&fit=crop&auto=format`
}
