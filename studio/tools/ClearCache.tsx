import {useEffect, useState} from 'react'
import {styles} from './panelStyles'

/**
 * "Refresh website": expires the website's cached Sanity content right now,
 * for when a publish does not show up (the webhook missed it, or it was a
 * change outside the studio). Calls the app's `/api/revalidate` with
 * SANITY_REVALIDATE_SECRET — the same secret the webhook signs with.
 *
 * The secret is not stored in the dataset nor the bundle; the editor pastes it
 * once and it stays in this browser's localStorage. The website address is
 * SANITY_STUDIO_SITE_URL.
 */

const SECRET_KEY = 'revalidateSecret'
const SITE_URL = process.env.SANITY_STUDIO_SITE_URL || ''

const input = {
  padding: 8,
  borderRadius: 4,
  border: '1px solid var(--card-border-color, #c9cdd4)',
  background: 'transparent',
  color: 'inherit',
}

function readSecret() {
  try {
    return window.localStorage.getItem(SECRET_KEY) ?? ''
  } catch {
    return ''
  }
}

export function ClearCache() {
  const [secret, setSecret] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ok: boolean; message: string} | null>(null)

  useEffect(() => setSecret(readSecret()), [])

  const saveSecret = (value: string) => {
    setSecret(value)
    try {
      window.localStorage.setItem(SECRET_KEY, value)
    } catch {
      // Private mode: the secret just lasts for this page view.
    }
  }

  const clear = async () => {
    setBusy(true)
    setResult(null)
    try {
      const response = await fetch(new URL('/api/revalidate', SITE_URL), {
        method: 'POST',
        headers: {'x-revalidate-secret': secret},
      })
      const body = (await response.json().catch(() => null)) as {ok?: boolean; message?: string} | null
      setResult(
        body?.ok
          ? {ok: true, message: 'The website shows the published content on the next visit.'}
          : {ok: false, message: body?.message ?? `Unexpected response (HTTP ${response.status}).`},
      )
    } catch (error) {
      setResult({
        ok: false,
        message: `Could not reach ${SITE_URL}: ${error instanceof Error ? error.message : error}`,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{display: 'grid', gap: 12, padding: 24, maxWidth: 640}}>
      <div style={{fontWeight: 600, fontSize: 16}}>Refresh website</div>
      <div style={styles.intro}>
        A publish normally shows on the website within a few seconds. Not seeing a change? Clear the
        cache here: the website fetches all published content again.
      </div>

      <label style={{display: 'grid', gap: 6, fontSize: 13}}>
        Cache secret (SANITY_REVALIDATE_SECRET, only kept in this browser)
        <input
          type='password'
          value={secret}
          onChange={(event) => saveSecret(event.currentTarget.value)}
          autoComplete='off'
          style={input}
        />
      </label>

      {!SITE_URL ? (
        <div style={styles.notice}>SANITY_STUDIO_SITE_URL is not set in studio/.env.</div>
      ) : null}

      <div style={{...styles.row, margin: 0}}>
        <button
          type='button'
          style={styles.button}
          disabled={!SITE_URL || !secret || busy}
          onClick={clear}
        >
          {busy ? 'Working…' : 'Clear cache'}
        </button>
      </div>

      {result ? (
        <div style={{...styles.notice, borderColor: result.ok ? 'var(--card-border-color)' : '#e5484d'}}>
          <b>{result.ok ? 'Done' : 'Failed'}</b> — {result.message}
        </div>
      ) : null}
    </div>
  )
}
