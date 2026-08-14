/** Seeds the home page. */
import {
  CTA_BAND,
  HERO,
  HERO_SLIDES,
  INTRO,
  MEDIA_TEXT,
  SERVICES,
  SERVICES_SECTION,
} from '../../src/lib/demo-content'
import {cta, externalLink, key, uploadImage, upsertPage} from './shared'

async function buildHomeContent() {
  console.log('Building home blocks…')

  const heroSlides = await Promise.all(
    HERO_SLIDES.map(async (slide) => ({
      ...(await uploadImage(slide.src, slide.alt)),
      _key: key(slide.src),
    })),
  )

  const introImage = await uploadImage(INTRO.image.src, INTRO.image.alt)

  const serviceItems = await Promise.all(
    SERVICES.map(async (service) => ({
      _key: key(service.label),
      label: service.label,
      title: service.title,
      description: service.description,
      link: externalLink(service.href),
      image: await uploadImage(service.image.src, service.image.alt),
    })),
  )

  const mediaImage = await uploadImage(MEDIA_TEXT.image.src, MEDIA_TEXT.image.alt)
  const ctaImage = await uploadImage(CTA_BAND.image.src, CTA_BAND.image.alt)

  return [
    {
      _type: 'hero',
      _key: key('home-hero'),
      slides: heroSlides,
      eyebrow: HERO.eyebrow,
      title: HERO.title,
      titleHighlight: HERO.titleHighlight,
      lead: HERO.lead,
      primaryCta: cta(HERO.primaryCta.label, HERO.primaryCta.href),
      secondaryCta: cta(HERO.secondaryCta.label, HERO.secondaryCta.href),
      badgeValue: HERO.badgeValue,
      badgeLabel: HERO.badgeLabel,
    },
    {
      _type: 'intro',
      _key: key('home-intro'),
      image: introImage,
      stampValue: INTRO.stampValue,
      stampLabel: INTRO.stampLabel,
      eyebrow: INTRO.eyebrow,
      title: INTRO.title,
      titleHighlight: INTRO.titleHighlight,
      leads: INTRO.leads,
      facts: INTRO.facts.map((fact) => ({...fact, _key: key(fact.label)})),
      link: cta(INTRO.link.label, INTRO.link.href),
    },
    {
      _type: 'services',
      _key: key('home-services'),
      title: SERVICES_SECTION.title,
      lead: SERVICES_SECTION.lead,
      items: serviceItems,
      highlight: {
        badge: SERVICES_SECTION.highlight.badge,
        title: SERVICES_SECTION.highlight.title,
        body: SERVICES_SECTION.highlight.body,
        cta: cta(
          SERVICES_SECTION.highlight.cta.label,
          SERVICES_SECTION.highlight.cta.href,
        ),
      },
    },
    {
      _type: 'mediaText',
      _key: key('home-media'),
      eyebrow: MEDIA_TEXT.eyebrow,
      title: MEDIA_TEXT.title,
      paragraphs: MEDIA_TEXT.paragraphs,
      cta: cta(MEDIA_TEXT.cta.label, MEDIA_TEXT.cta.href),
      image: mediaImage,
    },
    {
      _type: 'ctaBand',
      _key: key('home-cta'),
      image: ctaImage,
      eyebrow: CTA_BAND.eyebrow,
      title: CTA_BAND.title,
      body: CTA_BAND.body,
      primaryCta: cta(CTA_BAND.primaryCta.label, CTA_BAND.primaryCta.href),
      secondaryCta: cta(CTA_BAND.secondaryCta.label, CTA_BAND.secondaryCta.href),
    },
  ]
}

export async function seedHome() {
  console.log('Home page')
  await upsertPage('home', 'Home', await buildHomeContent())
}
