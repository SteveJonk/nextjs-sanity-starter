import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {IntentLink} from 'sanity/router'
import {styles} from './panelStyles'
import {mediaStyles as m} from './mediaStyles'
import {
  ASSET_QUERY,
  ASSETS_QUERY,
  ASSET_TYPES,
  USAGE_QUERY,
  dedupeUsage,
  displayName,
  formatBytes,
  formatDate,
  formatDimensions,
  isImage,
  matchesFilter,
  matchesSearch,
  thumbnailUrl,
  typeLabel,
  uploadKind,
  type MediaAsset,
  type MediaAssetDetail,
  type MediaFilter,
  type MediaUsage,
} from './mediaData'

/**
 * The media library in the studio: every upload in one place, searchable, with
 * per-file details and the documents that use it, an upload area and a delete
 * button.
 *
 * It sits in the left-hand menu under "Media" — see `structure.ts`.
 *
 * Why hand-built: Sanity's own asset browser only opens from an image or file
 * field on a document, so there is no way to see what is actually in the
 * dataset, let alone to throw away something nothing points at any more.
 *
 * Deleting is only possible when no document references the file — that is not
 * just our rule, Sanity refuses it too. Drafts count: a photo that only appears
 * in an unpublished draft is in use.
 *
 * Loading happens in two stages. ASSETS_QUERY returns the list and that is on
 * screen immediately; USAGE_QUERY works out alongside it which files are used
 * anywhere and fills the labels in afterwards. That second part is the
 * expensive work (it has to walk the whole dataset per file) and it should not
 * stand between an editor and their overview. While it runs the cards show no
 * label and the "unused" filter is disabled.
 *
 * The grid renders `PAGE_SIZE` cards at a time. Without that limit a large
 * library hangs the browser on thousands of <img> elements in the DOM, and
 * `loading="lazy"` does not help with that — it only saves downloads.
 */

/** Pinned, so a new API version cannot quietly change these queries. */
const API_VERSION = '2025-02-19'

/** Cards per batch, with a "show more" underneath. */
const PAGE_SIZE = 60

type Status = {tone: 'ok' | 'error'; text: string}

export function MediaLibrary() {
  const client = useClient({apiVersion: API_VERSION})

  const [assets, setAssets] = useState<MediaAsset[] | null>(null)
  const [used, setUsed] = useState<Set<string> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [opened, setOpened] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  // Stage 1: the list. Small and quick, and enough to draw the grid.
  useEffect(() => {
    let current = true
    setLoadError(null)

    client
      .fetch<MediaAsset[]>(ASSETS_QUERY, {types: [...ASSET_TYPES]})
      .then((result) => {
        if (current) setAssets(result)
      })
      .catch((error: unknown) => {
        if (current) setLoadError(error instanceof Error ? error.message : String(error))
      })

    return () => {
      current = false
    }
  }, [client, version])

  // Stage 2: which files are used somewhere. Runs apart from stage 1 and is
  // allowed to take its time; if it fails the labels stay away but the rest
  // keeps working.
  useEffect(() => {
    let current = true
    // On a reload the previous answer stays put instead of going back to null:
    // that saves a flicker, and after an upload or a delete it is still right —
    // a freshly uploaded file is not in it and is rightly called unused.
    client
      .fetch<string[]>(USAGE_QUERY, {types: [...ASSET_TYPES]})
      .then((ids) => {
        if (current) setUsed(new Set(ids))
      })
      .catch(() => {
        // Deliberately silent: the overview is still usable without this count,
        // and the detail panel does its own, authoritative check.
      })

    return () => {
      current = false
    }
  }, [client, version])

  const visible = useMemo(
    () =>
      (assets ?? []).filter(
        (a) => matchesFilter(a, filter, used ? used.has(a._id) : null) && matchesSearch(a, search),
      ),
    [assets, filter, used, search],
  )

  // A new search starts at the top again.
  useEffect(() => setLimit(PAGE_SIZE), [search, filter])

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      setUploading(true)
      setStatus(null)

      const failed: string[] = []
      let last: string | null = null

      for (const file of files) {
        try {
          const asset = await client.assets.upload(uploadKind(file), file, {filename: file.name})
          last = asset._id
        } catch (error) {
          failed.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      const succeeded = files.length - failed.length
      setStatus(
        failed.length
          ? {
              tone: 'error',
              text: `Uploaded ${succeeded} of ${files.length}.\n${failed.join('\n')}`,
            }
          : {tone: 'ok', text: `${succeeded} file${succeeded === 1 ? '' : 's'} added.`},
      )
      // A single upload we open straight away, so the editor sees it worked.
      if (last && files.length === 1) setOpened(last)
      setUploading(false)
      reload()
    },
    [client, reload],
  )

  const onDeleted = useCallback(
    (name: string) => {
      setOpened(null)
      setStatus({tone: 'ok', text: `“${name}” has been deleted.`})
      reload()
    },
    [reload],
  )

  const total = assets?.length ?? 0
  const unused = used ? (assets ?? []).filter((a) => !used.has(a._id)).length : null

  return (
    <div style={m.wrapper}>
      <p style={styles.intro}>
        Every file ever uploaded to Sanity — including the ones nothing uses any more. Click a file
        for its details and the documents that use it.
      </p>

      <div
        style={{...m.dropzone, ...(dragging ? m.dropzoneActive : null), marginTop: 16}}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void upload([...event.dataTransfer.files])
        }}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          style={{display: 'none'}}
          onChange={(event) => {
            void upload([...(event.target.files ?? [])])
            event.target.value = ''
          }}
        />
        <button
          type="button"
          style={styles.button}
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Add files'}
        </button>{' '}
        or drag them here. Images and documents (pdf) both work.
      </div>

      {status && (
        <div
          style={{
            ...m.message,
            borderColor: status.tone === 'error' ? 'var(--card-border-color, #f0c000)' : undefined,
          }}
        >
          {status.text}
        </div>
      )}

      <div style={m.toolbar}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by filename, title, alt text or type…"
          style={m.search}
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as MediaFilter)}
          style={m.select}
        >
          <option value="all">Everything</option>
          <option value="images">Images only</option>
          <option value="files">Files only</option>
          <option value="unused" disabled={used === null}>
            Unused only
          </option>
        </select>
        <span style={styles.intro}>
          {assets === null
            ? 'Loading…'
            : `${visible.length} of ${total}` +
              (unused === null ? ' — counting usage…' : ` — ${unused} unused`)}
        </span>
      </div>

      {loadError && <div style={styles.notice}>Could not load: {loadError}</div>}

      <div style={m.columns}>
        <div style={m.gridColumn}>
          {assets !== null && visible.length === 0 && !loadError && (
            <p style={styles.intro}>
              {total === 0
                ? 'There is nothing in the media library yet.'
                : 'No files found. Adjust the search or the filter.'}
            </p>
          )}

          <div style={m.grid}>
            {visible.slice(0, limit).map((asset) => (
              <MediaCard
                key={asset._id}
                asset={asset}
                inUse={used ? used.has(asset._id) : null}
                active={asset._id === opened}
                onOpen={() => setOpened(asset._id === opened ? null : asset._id)}
              />
            ))}
          </div>

          {visible.length > limit && (
            <div style={{...styles.row, marginBottom: 0}}>
              <button
                type="button"
                style={styles.secondary}
                onClick={() => setLimit((current) => current + PAGE_SIZE)}
              >
                Show more ({visible.length - limit} to go)
              </button>
            </div>
          )}
        </div>

        {opened && (
          <MediaDetail
            key={opened}
            assetId={opened}
            apiVersion={API_VERSION}
            onClose={() => setOpened(null)}
            onDeleted={onDeleted}
          />
        )}
      </div>
    </div>
  )
}

function MediaCard({
  asset,
  inUse,
  active,
  onOpen,
}: {
  asset: MediaAsset
  /** `null` while USAGE_QUERY runs — show no label yet. */
  inUse: boolean | null
  active: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{...m.card, ...(active ? m.cardSelected : null)}}
      title={displayName(asset)}
    >
      {isImage(asset) ? (
        <img src={thumbnailUrl(asset.url)} alt="" style={m.thumb} loading="lazy" />
      ) : (
        <span style={m.thumbFallback}>{asset.extension ?? 'file'}</span>
      )}
      <span style={m.cardBody}>
        <span style={{...m.cardName, display: 'block'}}>{displayName(asset)}</span>
        <span style={{...m.cardMeta, display: 'block'}}>
          {formatBytes(asset.size)}
          {isImage(asset) && asset.width ? ` · ${asset.width}×${asset.height}` : ''}
        </span>
        {inUse === false && <span style={m.badge}>unused</span>}
      </span>
    </button>
  )
}

function MediaDetail({
  assetId,
  apiVersion,
  onClose,
  onDeleted,
}: {
  assetId: string
  apiVersion: string
  onClose: () => void
  onDeleted: (name: string) => void
}) {
  const client = useClient({apiVersion})

  const [asset, setAsset] = useState<MediaAssetDetail | null>(null)
  const [usage, setUsage] = useState<MediaUsage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let current = true
    setError(null)

    client
      .fetch<{asset: MediaAssetDetail | null; usage: MediaUsage[]}>(ASSET_QUERY, {id: assetId})
      .then((result) => {
        if (!current) return
        setAsset(result.asset)
        setUsage(result.usage ?? [])
      })
      .catch((err: unknown) => {
        if (current) setError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      current = false
    }
  }, [client, assetId])

  const documents = useMemo(() => dedupeUsage(usage), [usage])

  const remove = useCallback(async () => {
    if (!asset) return
    setBusy(true)
    setError(null)
    try {
      await client.delete(asset._id)
      onDeleted(displayName(asset))
    } catch (err) {
      // Sanity refuses an asset that is still referenced too; if that happens
      // here, the list above is out of date.
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
      setConfirming(false)
    }
  }, [asset, client, onDeleted])

  if (error && !asset) {
    return (
      <aside style={m.detail}>
        <div style={styles.notice}>Could not load: {error}</div>
      </aside>
    )
  }

  if (!asset) {
    return (
      <aside style={m.detail}>
        <p style={styles.intro}>Loading…</p>
      </aside>
    )
  }

  const rows: [string, string][] = [
    ['Filename', asset.originalFilename ?? '—'],
    ['Title', asset.title || '—'],
    ['Alt text', asset.altText || '—'],
    ['Description', asset.description || '—'],
    ['Kind', isImage(asset) ? 'Image' : 'File'],
    ['File type', asset.mimeType ?? '—'],
    ...(isImage(asset) ? ([['Dimensions', formatDimensions(asset)]] as [string, string][]) : []),
    ['Size', formatBytes(asset.size)],
    ['Uploaded', formatDate(asset._createdAt)],
    ['Updated', formatDate(asset._updatedAt)],
    ['Document id', asset._id],
  ]

  return (
    <aside style={m.detail}>
      {isImage(asset) ? (
        <img src={thumbnailUrl(asset.url, 640)} alt="" style={m.detailPreview} />
      ) : (
        <div style={{...m.thumbFallback, aspectRatio: '3 / 1', borderRadius: 4}}>
          {asset.extension ?? 'file'}
        </div>
      )}

      <h2 style={m.detailTitle}>{displayName(asset)}</h2>

      <table style={m.table}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row" style={m.th}>
                {label}
              </th>
              <td style={m.td}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{...m.cardMeta, marginTop: 12}}>
        <a href={asset.url} target="_blank" rel="noreferrer">
          Open the original
        </a>
      </p>

      <h3 style={m.sectionTitle}>
        {documents.length === 0
          ? 'Used nowhere'
          : `Used in ${documents.length} document${documents.length === 1 ? '' : 's'}`}
      </h3>

      {documents.length > 0 && (
        <ul style={m.list}>
          {documents.map((doc) => (
            <li key={doc._id}>
              <IntentLink intent="edit" params={{id: doc._id, type: doc._type}}>
                {doc.title || doc._id}
              </IntentLink>{' '}
              <span style={{color: 'var(--card-muted-fg-color, #6b7280)'}}>
                ({typeLabel(doc._type)}
                {doc.draft ? ', draft' : ''})
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={{...styles.row, marginBottom: 0}}>
        {documents.length === 0 ? (
          confirming ? (
            <>
              <button type="button" style={m.danger} onClick={() => void remove()} disabled={busy}>
                {busy ? 'Deleting…' : 'Yes, delete permanently'}
              </button>
              <button type="button" style={styles.secondary} onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" style={m.danger} onClick={() => setConfirming(true)}>
              Delete
            </button>
          )
        ) : (
          <p style={{...styles.intro, margin: 0}}>
            This file cannot be deleted while something uses it. Remove it from the documents above
            first.
          </p>
        )}
        <button type="button" style={styles.secondary} onClick={onClose}>
          Close
        </button>
      </div>

      {error && <div style={m.message}>Could not delete: {error}</div>}
    </aside>
  )
}
