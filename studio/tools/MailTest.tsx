import {useEffect, useState} from 'react'
import {useEditState, useFormValue, type FieldProps} from 'sanity'
import {styles} from './panelStyles'

/**
 * "Send test mail" on Form settings → Mail. Calls the app's `/api/test-mail`,
 * which sends one mail with the PUBLISHED settings — unpublished changes are
 * flagged.
 *
 * The route wants MAIL_TEST_SECRET in a header. It is not stored in the
 * dataset nor the bundle; the editor pastes it once and it stays in this
 * browser's localStorage.
 *
 * The website address is SANITY_STUDIO_SITE_URL; without it the editor types
 * it once and it is kept in localStorage too.
 */

const SECRET_KEY = 'mailTestSecret'
const SITE_URL_KEY = 'mailTestSiteUrl'
const ENV_SITE_URL = process.env.SANITY_STUDIO_SITE_URL || ''

const input = {
  padding: 8,
  borderRadius: 4,
  border: '1px solid var(--card-border-color, #c9cdd4)',
  background: 'transparent',
  color: 'inherit',
}

function readStored(key: string) {
  try {
    return window.localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Private mode: the value just lasts for this page view.
  }
}

export function MailTest(props: FieldProps) {
  const adminEmail = useFormValue(['adminEmail']) as string | undefined
  const {draft} = useEditState('formGeneralSettings', 'formGeneralSettings')
  const [siteUrl, setSiteUrl] = useState(ENV_SITE_URL)
  const [secret, setSecret] = useState('')
  const [to, setTo] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ok: boolean; message: string} | null>(null)

  useEffect(() => {
    setSecret(readStored(SECRET_KEY))
    if (!ENV_SITE_URL) setSiteUrl(readStored(SITE_URL_KEY))
  }, [])

  const saveSecret = (value: string) => {
    setSecret(value)
    store(SECRET_KEY, value)
  }
  const saveSiteUrl = (value: string) => {
    setSiteUrl(value)
    store(SITE_URL_KEY, value)
  }
  const validUrl = /^https?:\/\/[^/\s]+/.test(siteUrl.trim())

  const send = async () => {
    setBusy(true)
    setResult(null)
    try {
      // No trailing slash: the app would redirect it, and a redirected preflight fails CORS.
      const response = await fetch(new URL('/api/test-mail', siteUrl.trim()), {
        method: 'POST',
        headers: {'x-mail-test-secret': secret, 'content-type': 'application/json'},
        body: JSON.stringify({to: to.trim() || undefined}),
      })
      const body = (await response.json().catch(() => null)) as typeof result
      setResult(body ?? {ok: false, message: `Unexpected response (HTTP ${response.status}).`})
    } catch (error) {
      setResult({
        ok: false,
        message: `Could not reach ${siteUrl}: ${error instanceof Error ? error.message : error}`,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{display: 'grid', gap: 12}}>
      <div style={{fontWeight: 600, fontSize: 14}}>{props.title}</div>
      <div style={styles.intro}>
        Sends one mail with the published settings above, so you can check the provider works
        before a visitor finds out it does not.
      </div>

      {ENV_SITE_URL ? null : (
        <label style={{display: 'grid', gap: 6, fontSize: 13}}>
          Website address (or set SANITY_STUDIO_SITE_URL)
          <input
            type='url'
            value={siteUrl}
            placeholder='https://www.example.com'
            onChange={(event) => saveSiteUrl(event.currentTarget.value)}
            style={input}
          />
        </label>
      )}
      <label style={{display: 'grid', gap: 6, fontSize: 13}}>
        Test-mail secret (MAIL_TEST_SECRET, only kept in this browser)
        <input
          type='password'
          value={secret}
          onChange={(event) => saveSecret(event.currentTarget.value)}
          autoComplete='off'
          style={input}
        />
      </label>
      <label style={{display: 'grid', gap: 6, fontSize: 13}}>
        Send to
        <input
          type='email'
          value={to}
          placeholder={adminEmail || 'Admin e-mail'}
          onChange={(event) => setTo(event.currentTarget.value)}
          style={input}
        />
      </label>

      {draft ? (
        <div style={styles.notice}>
          There are unpublished changes. The test uses the published settings — publish first.
        </div>
      ) : null}

      <div style={{...styles.row, margin: 0}}>
        <button
          type='button'
          style={styles.button}
          disabled={!validUrl || !secret || busy}
          onClick={send}
        >
          {busy ? 'Sending…' : 'Send test mail'}
        </button>
      </div>

      {result ? (
        <div style={{...styles.notice, borderColor: result.ok ? 'var(--card-border-color)' : '#e5484d'}}>
          <b>{result.ok ? 'Sent' : 'Failed'}</b> — {result.message}
        </div>
      ) : null}
    </div>
  )
}
