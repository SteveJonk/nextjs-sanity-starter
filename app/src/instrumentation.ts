/**
 * Server-side instrumentation hook. Without `NEXT_PUBLIC_SENTRY_DSN` both
 * exports return immediately and `@sentry/nextjs` is never imported.
 */
import type { captureRequestError } from '@sentry/nextjs';

import { SENTRY_DSN } from '../sentry.options';

export async function register() {
  if (!SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError: typeof captureRequestError = async (...args) => {
  if (!SENTRY_DSN) return;

  const Sentry = await import('@sentry/nextjs');
  return Sentry.captureRequestError(...args);
};
