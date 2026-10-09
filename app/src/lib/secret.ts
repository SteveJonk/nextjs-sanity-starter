import { createHash, timingSafeEqual } from 'node:crypto';

/** Constant-time compare; hashing first evens out the lengths. */
export function matchesSecret(given: string, expected: string) {
  const hash = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(given), hash(expected));
}
