import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Guards `/sentry-test` and `/api/sentry-test`: both answer 404 unless
 * SENTRY_TEST_SECRET is set and the request carries the same value, so
 * strangers can't fill the Sentry project with test issues.
 */
export function isSentryTestSecret(given: string | null | undefined) {
  const expected = process.env.SENTRY_TEST_SECRET;
  if (!expected || !given) return false;
  // Constant-time compare; hashing first evens out the lengths.
  const hash = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(given), hash(expected));
}
