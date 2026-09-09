// Sentry for the Node.js server runtime. Imported by `src/instrumentation.ts`,
// and only when a DSN is configured.
import * as Sentry from '@sentry/nextjs';

import { sentryOptions } from './sentry.options';

Sentry.init(sentryOptions);
