'use client';

import NextError from 'next/error';
import { useEffect } from 'react';

/**
 * Last-resort error boundary: it replaces the root layout, so it renders its
 * own `<html>`. Reports to Sentry only when a DSN is configured.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Literal env read: no DSN, no Sentry chunk in the bundle.
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
    void import('@sentry/nextjs').then((Sentry) => Sentry.captureException(error));
  }, [error]);

  return (
    <html lang="nl">
      <body>
        {/* Next's own error page. It wants a status code, and the App Router
        does not expose one here, so 0 renders the generic message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
