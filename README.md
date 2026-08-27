# Next.js + Sanity template

A block-based website scaffold: Next.js 16 (App Router, React 19, Tailwind v4)
in `app/`, a Sanity studio in `studio/`.

Editors build pages by stacking blocks in the studio; the front end renders
whatever they stacked. There are no per-page route files — add a page in the
studio and it is live.

## What's in it

- **Page builder** — ten blocks, each one CMS-editable, composable in any order
- **Three pages to start from** — a home page, a content page (`/about`) and a
  working contact page
- **SEO** — per-page meta title, description, OG image and `noindex`, driven
  from the CMS with sensible site-wide fallbacks
- **Theming** — one `@theme` block controls every colour, font and spacing token
- **Generated sitemap and robots.txt** — driven by the CMS, nothing to maintain
- **Structured data** — one schema.org graph per page, checked by a script
- **Forms** — CMS-authored, one page or several steps, mailed and spam-gated
- **Analytics** — GTM and the Meta pixel, both off until you set an id
- **Everything in the CMS** — pages, menus and the site's own details, with
  code-level defaults behind every field
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
npm run seed                  # site details, forms, the pages and the menus
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
| `danger`                                         | form errors                             |
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

Company name, description, phone, email, address, language and footer badges
live in the CMS, as the **Site information** singleton at the top of the
studio's menu. They drive the header, the footer, the page title template and
the structured data.

`app/src/lib/site.ts` holds the defaults for all of it, and does the same two
jobs `demo-content.ts` does for blocks: it is what the front end falls back to
when a field is empty **or the CMS is unreachable**, *and* it is what
`npm run seed:site` pushes into Sanity. Replace the constants once and both
sides move together.

Read the resolved values with `getSiteInformation()`
(`app/src/sanity/site-information.ts`) — never `SITE_DEFAULTS` directly in a
component, or an editor's change will not show up there. It is wrapped in
React's `cache`, so the layout, the metadata and the page routes share one
request.

One detail stays in code: **`SITE_URL`**, from `NEXT_PUBLIC_SITE_URL`. It
differs per deploy, and `metadataBase`, `robots.txt` and the structured data all
need it before — or without — a CMS round trip.

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
| `contactForm`| A form from Forms, with a contact panel beside it |
| `crossLinks` | Two cards pointing at related pages              |
| `ctaBand`    | Closing call to action over a photo              |

## Adding a block

Four touchpoints, in this order:

1. **`studio/schemaTypes/blocks/<name>Type.ts`** — define the fields
2. **`studio/schemaTypes/index.ts`** and **`pageBuilderType.ts`** — register it
   so editors can insert it
3. **`app/src/sanity/queries.ts`** — project any link or reference fields inside
   `PAGE_QUERY`; a link you forget here arrives as an unresolved reference, and
   a nested one (inside an object, as on `contactForm`'s panel) needs its own
   branch
4. **`app/src/components/PageBuilder.tsx`** — add a `case`, and the component in
   `app/src/components/blocks/`
5. **`npm run typegen`** — regenerate the types for the new fields (see
   [Types](#types))

Give the component optional props with defaults from `demo-content.ts` and it
renders before an editor has filled anything in. Unknown block types log a
warning and render nothing, so a half-built block never breaks a page.

## Types

The schema is the source of truth for types, not a second set of hand-written
interfaces. `npm run typegen` extracts the studio schema and runs Sanity
TypeGen over the GROQ in `app/src/sanity/queries.ts`:

```bash
cd app && npm run typegen     # or: cd studio && npm run typegen
```

Two files are written, both committed so a fresh clone type-checks without
running anything:

- **`app/src/sanity/schema.json`** — the extracted studio schema
- **`app/src/sanity/sanity.types.ts`** — a type per document and object, a
  `<NAME>_QUERY_RESULT` type per `defineQuery`, and a `@sanity/client` module
  augmentation that maps each query string to its result

That augmentation is what makes `client.fetch(PAGE_QUERY, { slug })` return
`PAGE_QUERY_RESULT` on its own — no generic to pass, and no type to keep in
sync by hand. Import the result types directly where you need to name one:

```ts
import type { PAGE_QUERY_RESULT } from '@/sanity/sanity.types';
```

The command runs from the studio, because the Sanity CLI needs a studio project
root, but everything it reads and writes lives in the app — that mapping is the
`typegen` block in `studio/sanity.cli.ts`. The app's `npm run typegen` is a
thin delegate to it, so either directory works.

Rerun it whenever you change a schema type or a query; the generated types go
stale silently otherwise. Extraction loads `studio/sanity.config.ts`, so
`studio/.env` needs `SANITY_STUDIO_PROJECT_ID` — no network call is made, and
nothing about your project ends up in the generated files.

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
paths into the absolute URLs social platforms require, and it is the origin the
sitemap and `robots.txt` are built from.

### Structured data

Every page carries a schema.org JSON-LD graph, built in
`app/src/lib/json-ld.ts` and rendered by `app/src/components/JsonLd.tsx`.

It is **one graph per page**, with `@id`s pointing at each other, rather than
separate blocks repeating the same facts:

- `#organization` and `#website` are on every page — the layout renders them
  from the **Site information** singleton, including its social links
  (`sameAs`), with `src/lib/site.ts` as the fallback behind every field
- each page adds a `WebPage` with its title, description and OG image
- a page with an `faqs` block is *also* an `FAQPage`, on the same node — two
  nodes for one URL would claim two pages that do not exist
- a `pageHero` block's breadcrumb label becomes a `BreadcrumbList`, so the
  structured data matches the breadcrumb the visitor actually sees

Two rules are load-bearing and easy to undo by accident:

- **Empty in means absent out.** `prune` drops nulls, blank strings and empty
  arrays, so a half-filled document never emits `"telephone": null`.
- **One path to any node.** The page node deliberately has no `about` pointing
  back at the organisation: it is already reachable via
  `isPartOf` → `WebSite` → `publisher`, and a second path makes validators fill
  that node in twice, along with anything attached to it (a rating, say). Adding
  a second reference is exactly what Google reports as duplicate rich results.

```bash
npm run check:jsonld npm run check:form    # asserts both rules, plus the shapes above
```

That script is pure — no Sanity, no React, no `.env` — so it runs on a fresh
clone in about a second and fails loudly when a shape changes. Structured data is invisible in the browser;
without something like this you find out weeks later, from Search Console.

To make the company something more specific than a generic `Organization`
(`LocalBusiness`, `Restaurant`, `RealEstateAgent`, …), change the one `@type` in
`organizationJsonLd` — the sub-types add opening hours, price range and the rest.

### Sitemap and robots.txt

`/sitemap.xml` and `/robots.txt` are generated, not files you maintain:

- **`app/src/app/sitemap.ts`** lists every published page straight from the CMS,
  using each document's `_updatedAt` as `lastModified`. There are no per-page
  route files to keep in sync — publish a page in the studio and it is in the
  sitemap. The home page comes back with the slug `home` and is mapped to `/`
  by `pathForSlug` in `src/lib/links.ts`, the same helper that resolves links.
- **`app/src/app/robots.ts`** allows everything except `/api/` and points at the
  sitemap.

Both are absolute-URL routes, so they need `NEXT_PUBLIC_SITE_URL`; without it
they fall back to `http://localhost:3000`, which is fine in development and
wrong everywhere else.

## Forms

Forms are authored in the studio and rendered by one component, so adding a
field is an editor's job, not a deploy.

- **Forms** (a document) — the fields, the button labels, the confirmation, and
  where the answers are mailed. Switch **Type** to *In steps* and the same
  fields spread over several steps with a progress bar and per-step validation.
- **Form settings** (a singleton) — the shared mail settings, the mail's logo
  and colours, and the reCAPTCHA switch.
- **`contactForm`** (a block) — drops a form onto a page, with the surrounding
  copy and an optional contact panel beside it. The form is a *reference*, so
  the same one can appear on several pages and its fields live in one place.

```bash
npm run seed:forms      # form settings + a working contact form
npm run seed:contact    # /contact, the page that renders it
npm run check:form      # assertions over the layout and the allow-list
```

`seed:forms` writes the form document and the shared settings; `seed:contact`
writes the page that references it, and `seed:nav` points the Contact menu
items at that page. Run in that order, or let `npm run seed` do it for you.

### How a submission travels

1. `FormRenderer` posts the whole form — every step at once — to
   `/api/submit-form`.
2. The route re-fetches the form document. **That document is the allow-list**:
   a key the browser posts that the form does not declare never reaches the
   mail. `npm run check:form` asserts that the query and the renderer agree,
   because if they drift the form quietly stops recording answers.
3. Answers are rendered into an HTML + plain-text mail (`src/lib/form-mail.ts`)
   and sent through Mailjet. Swapping providers means rewriting one function,
   `sendViaMailjet`; nothing else is provider-specific.

### Field types and layout

Text, e-mail, phone, URL, textarea, dropdown, radio, checkboxes, file upload
and hidden. Every field has a width: **two consecutive half-width fields share
a row**, everything else gets its own.

A **hidden** field carries context the visitor never types. Its value may
contain `{{token}}` placeholders, filled from what the page passes as
`context` — the starter passes `{{path}}`, so the mail says which page the form
was sent from. An unknown token is sent empty rather than leaking the raw
`{{…}}`.

### Mail and spam settings

The credentials belong in `app/.env`, not in the CMS — a Sanity dataset is
readable by anyone who knows the project id. The route prefers the environment
and falls back to Form settings, which is convenient locally and wrong in
production:

```bash
MAILJET_API_KEY=        MAILJET_API_SECRET=
MAILJET_FROM_EMAIL=     CONTACT_ADMIN_EMAIL=
RECAPTCHA_SECRET_KEY=   # only when reCAPTCHA is switched on
```

reCAPTCHA is off by default, and while it is off **no Google script is loaded**
— same stance as the analytics tags. Switch it on in Form settings, put the
site key there (it is public and ships in the page) and the secret in `.env`.
The route fails closed: any doubt about a token is a rejected submission.

Uploads are capped at 5 MB and travel as mail attachments; nothing is stored.

## Analytics

`app/src/components/TrackingScripts.tsx` carries Google Tag Manager and the
Meta (Facebook) pixel. Both are opt-in and off by default — a fresh clone loads
no third-party scripts at all. Set either id in `app/.env` to turn one on:

```bash
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
```

The component has two halves, both already wired into `app/src/app/layout.tsx`:
`TrackingScriptsHead` in `<head>` for the loaders, and `TrackingScriptsBody` as
the first element inside `<body>` for the `<noscript>` fallbacks — that
placement is what the vendors specify, and a `<noscript>` in `<head>` is
invalid.

The snippets are kept verbatim as the vendors publish them, which is why they
are injected as inline strings; the only interpolated value is the id itself.
Adding another tag means another `env` entry and another conditional block.

**Consent:** the tags load as soon as the page does. If you need a cookie
banner, gate GTM behind it and let GTM's own consent mode handle the rest —
there is no consent layer in here.

## Layout

```
app/
  src/app/            routes: / , /[slug] , not-found, sitemap, robots,
                      api/submit-form, globals.css (the theme)
  src/components/
    blocks/           one component per page-builder block
    layout/           header, footer
    ui/               small shared primitives
    form/             the form renderer and its field components
    TrackingScripts   GTM + Meta pixel, both opt-in
    JsonLd            renders one structured-data graph
  src/hooks/          scroll, sticky header, mobile nav
  src/lib/            site defaults, demo copy, link resolution, env,
                      json-ld (schema.org), form-fields + form-mail
  src/sanity/         client, queries, image helpers, metadata mapping,
                      site-information fetch, generated types
  scripts/seed/       one file per seeded page, plus the singletons and forms
  scripts/check-jsonld.ts   assertions over the structured data
  scripts/check-form.ts     assertions over the form layout + allow-list
studio/
  schemaTypes/
    blocks/           one file per block
    objects/          shared field groups (seo, link, cta)
  structure.ts        studio menu and singletons
                      (site information, navigation, footer)
```

## Deploying the studio

`.github/workflows/deploy-sanity-studio.yml` builds and deploys the studio on
every push to `main` that touches `studio/`, and can be run by hand from the
Actions tab. One deploy at a time — a new push cancels a run in progress.

Configure it once, under **Settings → Secrets and variables → Actions**:

| Where          | Name                       | Needed?  | What it is                                                        |
| -------------- | -------------------------- | -------- | ----------------------------------------------------------------- |
| Secrets        | `SANITY_AUTH_TOKEN`        | yes      | Deploy token — sanity.io/manage → API → Tokens, or `npx sanity login` and copy from `~/.config/sanity` |
| Variables      | `SANITY_STUDIO_PROJECT_ID` | yes      | Same project id as `studio/.env`                                   |
| Variables      | `SANITY_STUDIO_DATASET`    | optional | Defaults to `production`                                           |
| Variables      | `SANITY_STUDIO_TITLE`      | optional | Defaults to `Studio`                                               |
| Variables      | `SANITY_STUDIO_HOSTNAME`   | optional | Which `*.sanity.studio` to deploy to; unset reuses the existing one |

None of the `SANITY_STUDIO_*` values is a secret — they ship inside the studio
bundle, which is why they are *variables* and why they are set at job level:
Vite bakes them in at build time, so setting them only on the deploy step would
be too late.

The workflow fails early with a pointer to this table when the project id is
missing, rather than part way through a build.

**The app is not deployed here.** Host it wherever you like — the workflow
deliberately only covers the studio.

## Commands

```bash
# app/
npm run dev          npm run build        npm run start
npm run lint         npm run typecheck    npm run typegen
npm run check:jsonld npm run check:form
npm run seed         npm run seed:site    npm run seed:forms
npm run seed:home    npm run seed:about   npm run seed:contact
npm run seed:nav

# studio/
npm run dev          npm run build        npm run deploy
npm run typegen      npm run schema:extract
```

## Notes

- `npm run build` needs a reachable Sanity project, since pages are prerendered
  from CMS content. The header and footer degrade gracefully if the CMS is
  unreachable; page content does not, on purpose — an outage should surface as
  an error, not as a silently empty page.
- Placeholder images live in `app/public/images/`. Replace them with real photos
  and update the paths in `demo-content.ts`.
- Pages are revalidated every 30 seconds (`revalidate: 30` in the route files).
