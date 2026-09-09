/**
 * One source of Sentry settings for the client, the server and the edge
 * runtime. Everything is env-driven.
 *
 * `NEXT_PUBLIC_SENTRY_DSN` is the master switch: leave it unset and no Sentry
 * code is loaded at all — not in the browser bundle, not in `instrumentation`,
 * and `next.config.ts` skips the build plugin. The DSN is not a secret; it
 * ships in the client bundle, which is why it is `NEXT_PUBLIC_`.
 */

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryOptions = {
  dsn: SENTRY_DSN,
  // Share of transactions traced. 1 is fine to start with; lower it once the
  // site has traffic.
  tracesSampleRate: Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 1,
  ),
  dataCollection: {
    // No user data, no request bodies. Widen deliberately if you ever need it:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    userInfo: false,
    httpBodies: [],
  },
};
