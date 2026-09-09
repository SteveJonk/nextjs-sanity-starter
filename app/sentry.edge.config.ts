// Sentry for the edge runtime (middleware, edge routes). Imported by
// `src/instrumentation.ts`, and only when a DSN is configured.
import * as Sentry from '@sentry/nextjs';

import { sentryOptions } from './sentry.options';

Sentry.init(sentryOptions);
