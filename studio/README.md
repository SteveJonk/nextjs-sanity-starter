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

See the root `README.md` for how a block travels from here to the front end.
