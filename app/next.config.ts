import { withSentryConfig } from '@sentry/nextjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: 'standalone',
  // Anchor Turbopack to this app; stray ~/ lockfiles otherwise become the root.
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

// No DSN, no Sentry: the build plugin is skipped entirely, so nothing is
// injected into the bundle and no source maps are uploaded.
// See `sentry.options.ts` for the runtime side.
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      // All options: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Only log source-map uploads in CI.
      silent: !process.env.CI,

      // Uploading needs a token; without one, skip it instead of warning on
      // every build.
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
      },

      // Off: this roughly doubles source-map upload size and memory during the
      // build, which OOM-kills small build servers. Turn on if you have the
      // headroom and want stack traces from third-party chunks.
      widenClientFileUpload: false,

      // Routes browser requests to Sentry through the app, past ad-blockers.
      // Costs you the traffic. Must not collide with middleware matchers.
      tunnelRoute: '/monitoring',

      webpack: {
        automaticVercelMonitors: true,
        treeshake: {
          removeDebugLogging: true,
        },
      },
    })
  : nextConfig;
