# Studio

The Sanity studio for this project. Content edited here is what the app in
`../app` renders.

## Setup

```bash
cp .env.example .env   # fill in SANITY_STUDIO_PROJECT_ID
npm install
npm run dev            # http://localhost:3333
```

## Layout

- `schemaTypes/blocks/` — one file per page-builder block
- `schemaTypes/objects/` — shared field groups (`seo`, `link`, `cta`)
- `schemaTypes/pageBuilderType.ts` — which blocks editors can insert
- `structure.ts` — the studio's left-hand menu, including the singletons
- `schemaTypes/siteInformationType.ts` — the site's own details (name, contact,
  language, social links); the app falls back to `app/src/lib/site.ts` per field
  and `npm run seed:site` fills it from there
- `sanity.cli.ts` — CLI config, including the `typegen` paths that point at the
  app

## Types

```bash
npm run typegen        # schema extract + sanity typegen generate
```

Writes `../app/src/sanity/schema.json` and `../app/src/sanity/sanity.types.ts`.
Typegen runs from here because the CLI needs a studio project root, but the
GROQ it reads and the types it writes belong to the app. Run it after changing
a schema type; the root `README.md` has the full story.

See the root `README.md` for how a block travels from here to the front end.
