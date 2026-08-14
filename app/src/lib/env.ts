/**
 * Sanity connection details, read from the environment.
 *
 * Copy `.env.example` to `.env` and fill in the project id before running
 * `npm run dev`. The id is not a secret — it ships in the client bundle — so
 * it lives in a `NEXT_PUBLIC_` variable.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill it in — see the README under "Connect a Sanity project".`,
    );
  }
  return value;
}

export const env = {
  projectId: required(
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  ),
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  /** Pin this: Sanity treats the date as the API contract version. */
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-07-26',
};
