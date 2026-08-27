import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  /**
   * Typegen runs from the studio — the CLI needs a studio project root — but
   * everything it reads and writes belongs to the app: the GROQ lives in
   * `app/src/sanity/queries.ts` and the types are written next to it. That is
   * what gives every `defineQuery` a `*_QUERY_RESULT` type and lets
   * `client.fetch(QUERY)` type itself, without a hand-written generic.
   */
  typegen: {
    path: '../app/src/**/*.{ts,tsx}',
    schema: '../app/src/sanity/schema.json',
    generates: '../app/src/sanity/sanity.types.ts',
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
