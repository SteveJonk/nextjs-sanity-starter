import { defineQuery } from 'next-sanity';

/**
 * Resolve internal page references on link/cta objects.
 *
 * A link in the studio is either an external URL or a reference to a `page`
 * document; this projection pulls the referenced slug up so `resolveHref` in
 * `src/lib/links.ts` can turn either shape into an href.
 */
const linkExpansion = /* groq */ `{
  ...,
  internalLink->{
    "slug": slug.current
  }
}`;

/**
 * One page and its blocks.
 *
 * The `content[]` projection spreads every block wholesale (`...`) and then
 * re-projects the fields that need resolving — links, referenced documents.
 * When you add a block with a link field, add its field name here or the href
 * will arrive as an unresolved reference.
 */
export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    seo,
    content[]{
      ...,
      primaryCta${linkExpansion},
      secondaryCta${linkExpansion},
      link${linkExpansion},
      cta${linkExpansion},
      highlight{
        ...,
        cta${linkExpansion}
      },
      items[]{
        ...,
        link${linkExpansion},
        cta${linkExpansion}
      },
      _type == "faqs" => {
        ...,
        faqs[]->{
          ...,
          link${linkExpansion}
        },
        link${linkExpansion}
      }
    }
  }
`);

/** Slugs of every page, for generateStaticParams and the sitemap. */
export const PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`);

export const NAVIGATION_QUERY = defineQuery(`
  *[_id == "navigation"][0]{
    navLeft[]${linkExpansion},
    navRight[]${linkExpansion}
  }
`);

export const FOOTER_QUERY = defineQuery(`
  *[_id == "footer"][0]{
    linkGroups[]{
      title,
      links[]${linkExpansion}
    },
    copyright
  }
`);
