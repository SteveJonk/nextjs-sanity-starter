# Next.js + Sanity template

A block-based website scaffold: Next.js 16 (App Router, React 19, Tailwind v4)
in `app/`, a Sanity studio in `studio/`.

Editors build pages by stacking blocks in the studio; the front end renders
whatever they stacked. There are no per-page route files — add a page in the
studio and it is live.

## What's in it

- **Page builder** — ten blocks, each one CMS-editable, composable in any order
- **Two pages to start from** — a home page and a content page (`/about`)
- **SEO** — per-page meta title, description, OG image and `noindex`, driven
  from the CMS with sensible site-wide fallbacks
- **Theming** — one `@theme` block controls every colour, font and spacing token
- **Seeding** — one command fills a fresh Sanity project with working content

## Setup

You need a Sanity project. Create one at [sanity.io/manage](https://www.sanity.io/manage)
(free tier is fine) and note its project id.

```bash
# 1. Initiate Openwolf (if you want to use this)
npx openwolf init (or openwolf init)
npx openwolf dashboard (or openwolf dashboard)

# 1. Studio
cd studio
cp .env.example .env          # fill in SANITY_STUDIO_PROJECT_ID
npm install
npm run dev                   # http://localhost:3333

# 2. App
cd ../app
cp .env.example .env          # same project id, plus a write token for seeding
npm install
npm run seed                  # creates the home + about pages and the menus
npm run dev                   # http://localhost:3000
```

The write token for `npm run seed` comes from **sanity.io/manage → API →
Tokens**, with Editor rights. It is only used by the seed script, never at
runtime.

Without a `.env`, the app fails fast with a message telling you which variable
is missing.

## Making it yours

### Colours and fonts

Everything visual is defined in one place: the `@theme` block at the top of
**`app/src/app/globals.css`**. It ships as neutral Tailwind slate so a fresh
project looks like plain Tailwind rather than someone else's brand.

Colours are named by **role**, not by hue, so a dark or colourful brand drops in
without renaming anything:

| Token                                            | Used for                                |
| ------------------------------------------------ | --------------------------------------- |
| `surface`, `surface-alt`                         | page and panel backgrounds              |
| `fg`, `muted`, `subtle`                          | text, in descending emphasis            |
| `inverse`, `inverse-fg`                          | dark bands and the text on them         |
| `accent`, `accent-deep`                          | soft fills, tags, quiet highlights      |
| `accent-strong`                                  | links, focus rings, the one loud colour |
| `brand`, `brand-hover`, `brand-deep`, `brand-fg` | primary buttons and the loudest UI      |

No component references a raw colour, so editing those values recolours the
whole site. There is no `tailwind.config.ts` — Tailwind v4 puts the theme in
CSS, and `@theme` turns each token into utilities automatically
(`--color-accent` gives you `bg-accent`, `text-accent`, `border-accent`).

**Fonts** are the two `next/font` imports at the top of
`app/src/app/layout.tsx`. Swap the families, keep the `variable` names
(`--font-display-src`, `--font-sans-src`), and the theme picks them up.

The same block also holds spacing (`--spacing-section`, `--spacing-wrap`),
breakpoints, radii, shadows and animations. The breakpoints deliberately differ
from Tailwind's defaults — the layouts are built against them, so change with
care.

### Site details

`app/src/lib/site.ts` — company name, phone, email, address, footer badges.
Used by the header, footer and CTA blocks.

### Copy

`app/src/lib/demo-content.ts` holds the demo copy for every block, and it does
two jobs at once: it is what a block falls back to when the CMS has not supplied
a field, **and** it is what `npm run seed` pushes into Sanity. Replace the
strings there and both sides move together.

The copy is written for an invented studio ("Fieldnote") so that a seeded site
reads like a real site instead of a page of lorem ipsum — it is easier to judge
spacing and hierarchy against sentences of realistic length. It is still filler:
replace it, along with the matching details in `app/src/lib/site.ts`.

## The blocks

| Block        | What it is                                       |
| ------------ | ------------------------------------------------ |
| `hero`       | Full-bleed opener with a cycling image and badge |
| `pageHero`   | Shorter opener for inner pages, with breadcrumb  |
| `intro`      | Text and image with a stat row                   |
| `services`   | Three cards plus an optional dark highlight band |
| `mediaText`  | Text column beside a supporting photo            |
| `benefits`   | Icon list beside an image                        |
| `steps`      | Numbered process with a sticky image             |
| `faqs`       | Accordion, fed by reusable FAQ documents         |
| `crossLinks` | Two cards pointing at related pages              |
| `ctaBand`    | Closing call to action over a photo              |

## Adding a block

Four touchpoints, in this order:

1. **`studio/schemaTypes/blocks/<name>Type.ts`** — define the fields
2. **`studio/schemaTypes/index.ts`** and **`pageBuilderType.ts`** — register it
   so editors can insert it
3. **`app/src/sanity/queries.ts`** — project any link or reference fields inside
   `PAGE_QUERY`; a link you forget here arrives as an unresolved reference
4. **`app/src/components/PageBuilder.tsx`** — add a `case`, and the component in
   `app/src/components/blocks/`

Give the component optional props with defaults from `demo-content.ts` and it
renders before an editor has filled anything in. Unknown block types log a
warning and render nothing, so a half-built block never breaks a page.

## SEO

Every `page` document has an `seo` object: meta title, description, OG image
and a `noindex` toggle. `app/src/sanity/metadata.ts` maps it onto Next's
`Metadata`, and anything left empty falls back to the site defaults in
`layout.tsx`.

One trap worth knowing, because it is easy to reintroduce: **Next merges
metadata by key presence, not by value.** Returning `{ title: undefined }`
deletes the parent title rather than inheriting it. That is why every optional
key in `metadata.ts` is added with a conditional spread and is simply absent
when the CMS field is empty. Keep that pattern when adding fields.

Set `NEXT_PUBLIC_SITE_URL` in production — it is what turns relative OG image
paths into the absolute URLs social platforms require.

## Layout

```
app/
  src/app/            routes: / , /[slug] , not-found, globals.css (the theme)
  src/components/
    blocks/           one component per page-builder block
    layout/           header, footer
    ui/               small shared primitives
  src/hooks/          scroll, sticky header, mobile nav
  src/lib/            site constants, demo copy, link resolution, env
  src/sanity/         client, queries, image helpers, metadata mapping
  scripts/seed/       one file per seeded page
studio/
  schemaTypes/
    blocks/           one file per block
    objects/          shared field groups (seo, link, cta)
  structure.ts        studio menu and singletons
```

## Commands

```bash
# app/
npm run dev          npm run build        npm run start
npm run lint         npm run typecheck
npm run seed         npm run seed:home    npm run seed:about   npm run seed:nav

# studio/
npm run dev          npm run build        npm run deploy
```

## Notes

- `npm run build` needs a reachable Sanity project, since pages are prerendered
  from CMS content. The header and footer degrade gracefully if the CMS is
  unreachable; page content does not, on purpose — an outage should surface as
  an error, not as a silently empty page.
- Placeholder images live in `app/public/images/`. Replace them with real photos
  and update the paths in `demo-content.ts`.
- Pages are revalidated every 30 seconds (`revalidate: 30` in the route files).
