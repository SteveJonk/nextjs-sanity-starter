/**
 * Seeds the second page — /about.
 *
 * This is the "content page" template: a page hero, the reusable body blocks,
 * and a closing CTA. Copy this file to add another page, change the slug and
 * pick a different set of blocks.
 */
import {
  BENEFITS,
  BENEFITS_IMAGE,
  BENEFITS_SECTION,
  CROSS_LINKS,
  CTA_BAND,
  FAQ_ITEMS,
  FAQ_SECTION,
  PAGE_HERO,
  STEPS,
  STEPS_SECTION,
} from '../../src/lib/demo-content'
import {
  cta,
  externalLink,
  key,
  uploadImage,
  upsertFaq,
  upsertPage,
} from './shared'

async function buildAboutContent(faqIds: string[]) {
  console.log('Building about blocks…')

  const heroImage = await uploadImage(PAGE_HERO.image.src, PAGE_HERO.image.alt)
  const benefitsImage = await uploadImage(BENEFITS_IMAGE.src, BENEFITS_IMAGE.alt)
  const ctaImage = await uploadImage(CTA_BAND.image.src, CTA_BAND.image.alt)

  const stepItems = await Promise.all(
    STEPS.map(async (step) => ({
      _key: key(step.number),
      number: step.number,
      title: step.title,
      body: step.body,
      image: await uploadImage(step.image, `${step.title} illustration`),
    })),
  )

  return [
    {
      _type: 'pageHero',
      _key: key('about-hero'),
      image: heroImage,
      breadcrumbLabel: PAGE_HERO.breadcrumbLabel,
      eyebrow: PAGE_HERO.eyebrow,
      title: PAGE_HERO.title,
      titleHighlight: PAGE_HERO.titleHighlight,
      lead: PAGE_HERO.lead,
      primaryCta: cta(PAGE_HERO.primaryCta.label, PAGE_HERO.primaryCta.href),
      secondaryCta: cta(PAGE_HERO.secondaryCta.label, PAGE_HERO.secondaryCta.href),
    },
    {
      _type: 'benefits',
      _key: key('about-benefits'),
      eyebrow: BENEFITS_SECTION.eyebrow,
      title: BENEFITS_SECTION.title,
      lead: BENEFITS_SECTION.lead,
      image: benefitsImage,
      items: BENEFITS.map((item) => ({...item, _key: key(item.title)})),
    },
    {
      _type: 'steps',
      _key: key('about-steps'),
      eyebrow: STEPS_SECTION.eyebrow,
      title: STEPS_SECTION.title,
      lead: STEPS_SECTION.lead,
      cta: cta(STEPS_SECTION.cta.label, STEPS_SECTION.cta.href),
      items: stepItems,
    },
    {
      _type: 'faqs',
      _key: key('about-faqs'),
      eyebrow: FAQ_SECTION.eyebrow,
      title: FAQ_SECTION.title,
      intro: FAQ_SECTION.intro,
      link: cta(FAQ_SECTION.link.label, FAQ_SECTION.link.href),
      // FAQs are referenced, not inlined, so one answer can appear on several pages.
      faqs: faqIds.map((id) => ({
        _type: 'reference' as const,
        _ref: id,
        _key: key(id),
      })),
    },
    {
      _type: 'crossLinks',
      _key: key('about-crosslinks'),
      items: CROSS_LINKS.map((link) => ({
        _key: key(link.title),
        title: link.title,
        body: link.body,
        link: externalLink(link.href),
      })),
    },
    {
      _type: 'ctaBand',
      _key: key('about-cta'),
      image: ctaImage,
      eyebrow: CTA_BAND.eyebrow,
      title: CTA_BAND.title,
      body: CTA_BAND.body,
      primaryCta: cta(CTA_BAND.primaryCta.label, CTA_BAND.primaryCta.href),
      secondaryCta: cta(CTA_BAND.secondaryCta.label, CTA_BAND.secondaryCta.href),
    },
  ]
}

export async function seedAbout() {
  console.log('FAQs')
  const faqIds: string[] = []
  for (const faq of FAQ_ITEMS) {
    faqIds.push(await upsertFaq(faq))
  }

  console.log('\nAbout page')
  await upsertPage('about', 'About', await buildAboutContent(faqIds))
}
