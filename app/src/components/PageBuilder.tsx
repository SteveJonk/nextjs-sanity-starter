import { Benefits } from '@/components/blocks/Benefits';
import { CrossLinks } from '@/components/blocks/CrossLinks';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Faq } from '@/components/blocks/Faq';
import { Hero } from '@/components/blocks/Hero';
import { Intro } from '@/components/blocks/Intro';
import { MediaText } from '@/components/blocks/MediaText';
import { PageHero } from '@/components/blocks/PageHero';
import { Services } from '@/components/blocks/Services';
import { Steps } from '@/components/blocks/Steps';
import { imageSrc, toImage, type SanityImage } from '@/sanity/image';
import { resolveHref, type SanityLabeledLink, type SanityLink } from '@/lib/links';
import type { Benefit } from '@/lib/demo-content';

type SanityCta = SanityLabeledLink;

type PageBlock = {
  _type: string;
  _key: string;
  [key: string]: unknown;
};

function toCta(cta: SanityCta | undefined | null) {
  const href = resolveHref(cta);
  if (!cta?.label || !href) return undefined;
  return { label: cta.label, href };
}

/**
 * Map one Sanity block onto its React component.
 *
 * ADDING A BLOCK — four touchpoints, in this order:
 *   1. `studio/schemaTypes/blocks/<name>Type.ts`   — the fields
 *   2. `studio/schemaTypes/index.ts` + `pageBuilderType.ts` — register it
 *   3. `src/sanity/queries.ts`                     — project any link fields
 *   4. a `case` here + a component in `src/components/blocks/`
 *
 * Every field arrives untyped (`unknown`) because the block union is open, so
 * each case casts what it reads. Unknown types warn and render nothing rather
 * than throwing — a page keeps working while a new block is half-built.
 */
function renderBlock(block: PageBlock) {
  switch (block._type) {
    case 'hero': {
      const slides = (block.slides as SanityImage[] | undefined)
        ?.map((slide) => toImage(slide, 2400, 1600))
        .filter((slide): slide is { src: string; alt: string } => Boolean(slide));
      return (
        <Hero
          key={block._key}
          slides={slides}
          eyebrow={block.eyebrow as string | undefined}
          title={block.title as string | undefined}
          titleHighlight={block.titleHighlight as string | undefined}
          lead={block.lead as string | undefined}
          primaryCta={toCta(block.primaryCta as SanityCta)}
          secondaryCta={toCta(block.secondaryCta as SanityCta)}
          badgeValue={block.badgeValue as string | undefined}
          badgeLabel={block.badgeLabel as string | undefined}
        />
      );
    }
    case 'intro': {
      return (
        <Intro
          key={block._key}
          image={toImage(block.image as SanityImage, 800, 1000)}
          stampValue={block.stampValue as string | undefined}
          stampLabel={block.stampLabel as string | undefined}
          eyebrow={block.eyebrow as string | undefined}
          title={block.title as string | undefined}
          titleHighlight={block.titleHighlight as string | undefined}
          leads={block.leads as string[] | undefined}
          facts={block.facts as { value: string; label: string }[] | undefined}
          link={toCta(block.link as SanityCta)}
        />
      );
    }
    case 'services': {
      const items = (
        block.items as
          | Array<{
              label: string;
              title: string;
              description: string;
              image: SanityImage;
              link?: SanityLink;
            }>
          | undefined
      )
        ?.map((item, index) => {
          const href = resolveHref(item.link);
          if (!href) return null;
          return {
            label: item.label,
            title: item.title,
            description: item.description,
            href,
            image: toImage(item.image, 640, 768) ?? { src: '', alt: '' },
            delay: (index === 0 ? undefined : index) as 1 | 2 | 3 | undefined,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      const highlight = block.highlight as
        | { badge?: string; title?: string; body?: string; cta?: SanityCta }
        | undefined;
      return (
        <Services
          key={block._key}
          title={block.title as string | undefined}
          lead={block.lead as string | undefined}
          items={items}
          highlight={
            highlight?.title
              ? {
                  badge: highlight.badge ?? '',
                  title: highlight.title,
                  body: highlight.body ?? '',
                  cta: toCta(highlight.cta),
                }
              : undefined
          }
        />
      );
    }
    case 'mediaText': {
      return (
        <MediaText
          key={block._key}
          eyebrow={block.eyebrow as string | undefined}
          title={block.title as string | undefined}
          paragraphs={block.paragraphs as string[] | undefined}
          cta={toCta(block.cta as SanityCta)}
          image={toImage(block.image as SanityImage, 900, 720)}
        />
      );
    }
    case 'pageHero': {
      return (
        <PageHero
          key={block._key}
          image={toImage(block.image as SanityImage, 2400, 1600)}
          breadcrumbLabel={block.breadcrumbLabel as string | undefined}
          eyebrow={block.eyebrow as string | undefined}
          title={block.title as string | undefined}
          titleHighlight={block.titleHighlight as string | undefined}
          lead={block.lead as string | undefined}
          primaryCta={toCta(block.primaryCta as SanityCta)}
          secondaryCta={toCta(block.secondaryCta as SanityCta)}
        />
      );
    }
    case 'benefits': {
      return (
        <Benefits
          key={block._key}
          eyebrow={block.eyebrow as string | undefined}
          title={block.title as string | undefined}
          lead={block.lead as string | undefined}
          image={toImage(block.image as SanityImage, 900, 1125)}
          items={block.items as Benefit[] | undefined}
        />
      );
    }
    case 'steps': {
      const items = (
        block.items as
          | Array<{
              number: string;
              title: string;
              body: string;
              image: SanityImage;
            }>
          | undefined
      )?.map((item) => ({
        number: item.number,
        title: item.title,
        body: item.body,
        image: imageSrc(item.image, 900, 1125) ?? '',
      }));
      return (
        <Steps
          key={block._key}
          eyebrow={block.eyebrow as string | undefined}
          title={block.title as string | undefined}
          lead={block.lead as string | undefined}
          cta={toCta(block.cta as SanityCta)}
          items={items}
        />
      );
    }
    case 'faqs': {
      // FAQs are their own documents so one answer can be reused across pages.
      const items = (
        block.faqs as
          | Array<{
              title?: string;
              answer?: string;
              link?: SanityCta;
              afterLink?: string;
            }>
          | undefined
      )
        ?.filter((faq) => faq?.title && faq?.answer)
        .map((faq) => ({
          question: faq.title!,
          answer: faq.answer!,
          link: toCta(faq.link),
          afterLink: faq.afterLink,
        }));
      return (
        <Faq
          key={block._key}
          eyebrow={block.eyebrow as string | undefined}
          title={block.title as string | undefined}
          intro={block.intro as string | undefined}
          link={toCta(block.link as SanityCta)}
          items={items}
        />
      );
    }
    case 'crossLinks': {
      const items = (
        block.items as
          | Array<{ title?: string; body?: string; link?: SanityLink }>
          | undefined
      )
        ?.map((item) => {
          const href = resolveHref(item.link);
          if (!item.title || !item.body || !href) return null;
          return { title: item.title, body: item.body, href };
        })
        .filter((item): item is { title: string; body: string; href: string } =>
          Boolean(item),
        );
      return <CrossLinks key={block._key} items={items} />;
    }
    case 'ctaBand': {
      return (
        <CtaBand
          key={block._key}
          image={toImage(block.image as SanityImage, 2400, 1200)}
          eyebrow={block.eyebrow as string | undefined}
          title={block.title as string | undefined}
          body={block.body as string | undefined}
          primaryCta={toCta(block.primaryCta as SanityCta)}
          secondaryCta={toCta(block.secondaryCta as SanityCta)}
        />
      );
    }
    default:
      console.warn(`Unknown page builder block type: ${block._type}`);
      return null;
  }
}

export function PageBuilder({ content }: { content?: PageBlock[] | null }) {
  if (!Array.isArray(content) || content.length === 0) return null;

  return <>{content.map((block) => renderBlock(block))}</>;
}
