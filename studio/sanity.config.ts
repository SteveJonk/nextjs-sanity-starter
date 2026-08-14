import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

/**
 * Project id and dataset come from the environment so the studio and the app
 * can share one `.env`. Copy `.env.example` to `.env` before `npm run dev`.
 * Sanity exposes only `SANITY_STUDIO_*` variables to the studio bundle.
 */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID. Copy studio/.env.example to studio/.env and fill it in.',
  )
}

export default defineConfig({
  name: 'default',
  title: process.env.SANITY_STUDIO_TITLE || 'Studio',

  projectId,
  dataset,

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
