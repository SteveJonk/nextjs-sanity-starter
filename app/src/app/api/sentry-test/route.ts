import type { NextRequest } from 'next/server';
import { isSentryTestSecret } from '@/lib/sentry-test';

/**
 * Always fails, on purpose: called from `/sentry-test` to check that server
 * errors reach Sentry (through `onRequestError` in `src/instrumentation.ts`).
 * Without SENTRY_TEST_SECRET in the `x-sentry-test-secret` header it is a 404.
 */
export function GET(request: NextRequest) {
  if (!isSentryTestSecret(request.headers.get('x-sentry-test-secret'))) {
    return new Response(null, { status: 404 });
  }

  throw new Error('Sentry test: server error');
}
