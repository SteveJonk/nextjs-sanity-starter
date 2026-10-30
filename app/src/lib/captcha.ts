/**
 * Server half of the form spam check. No Next.js in here, so the verdicts can
 * be checked by `npm run check:form`.
 */

export type CaptchaProvider = 'recaptcha' | 'turnstile';

const VERIFY_URL: Record<CaptchaProvider, string> = {
  recaptcha: 'https://www.google.com/recaptcha/api/siteverify',
  turnstile: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
};

/**
 * Asks the provider about a token. Both speak the same siteverify protocol.
 *
 * `unavailable` means the provider itself could not be reached, and the
 * submission goes through marked as unverified rather than turning real
 * visitors away. The provider is asked even when the token is empty — the
 * browser posts none when the widget failed to load — so a bot cannot fake an
 * outage by leaving the token out: while the provider is up, that is `failed`.
 */
export async function verifyCaptcha(
  provider: CaptchaProvider,
  token: string,
  secret: string,
): Promise<'passed' | 'failed' | 'unavailable'> {
  let result: { success?: boolean; 'error-codes'?: string[] };
  try {
    const response = await fetch(VERIFY_URL[provider], {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    result = await response.json();
  } catch (error) {
    console.error(`submit-form: ${provider} unreachable, letting the submission through unverified`, error);
    return 'unavailable';
  }
  if (result.success === true) return 'passed';
  // `invalid-input-secret` here is a config error, not a bot.
  console.warn(`submit-form: ${provider} rejected the token`, result['error-codes']);
  return 'failed';
}
