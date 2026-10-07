/**
 * Always fails, on purpose: called from `/sentry-test` to check that server
 * errors reach Sentry (through `onRequestError` in `src/instrumentation.ts`).
 */

export function GET(): never {
  throw new Error('Sentry test: server error');
}
