/**
 * Sentry in the browser.
 *
 * The DSN is read as a literal `process.env.NEXT_PUBLIC_SENTRY_DSN` rather
 * than through `sentry.options.ts`, because that is what Next inlines at build
 * time. Without a DSN the `if` below is dead code and the bundler drops the
 * dynamic import with it — no Sentry chunk is emitted at all.
 */
import type { captureRouterTransitionStart } from '@sentry/nextjs';

let capture: typeof captureRouterTransitionStart | undefined;

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import('@sentry/nextjs').then(async (Sentry) => {
    const { sentryOptions } = await import('../sentry.options');
    Sentry.init(sentryOptions);
    capture = Sentry.captureRouterTransitionStart;
  });
}

// Next calls this on every client-side navigation. It stays a no-op until the
// chunk above has landed, and forever when there is no DSN.
export const onRouterTransitionStart: typeof captureRouterTransitionStart = (
  ...args
) => capture?.(...args);
