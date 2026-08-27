/**
 * Seeds /contact — the page the demo form actually lives on.
 *
 * Kept separate from the form itself: `seed:forms` writes the form document
 * and the shared settings, this writes a page that references it. Run
 * `seed:forms` first, or the block points at a form that does not exist yet.
 */
import {CONTACT_FORM, CONTACT_HERO} from '../../src/lib/demo-content'
import {CONTACT_FORM_ID} from './forms'
import {cta, key, uploadImage, upsertPage} from './shared'

async function buildContactContent() {
  console.log('Building contact blocks…')

  const heroImage = await uploadImage(CONTACT_HERO.image.src, CONTACT_HERO.image.alt)

  return [
    {
      _type: 'pageHero',
      _key: key('contact-hero'),
      image: heroImage,
      breadcrumbLabel: CONTACT_HERO.breadcrumbLabel,
      eyebrow: CONTACT_HERO.eyebrow,
      title: CONTACT_HERO.title,
      titleHighlight: CONTACT_HERO.titleHighlight,
      lead: CONTACT_HERO.lead,
    },
    {
      _type: 'contactForm',
      _key: key('contact-form'),
      eyebrow: CONTACT_FORM.eyebrow,
      title: CONTACT_FORM.title,
      lead: CONTACT_FORM.lead,
      note: CONTACT_FORM.note,
      // A reference, not an inline copy: the same form can sit on several
      // pages and its fields are edited in one place.
      form: {_type: 'reference' as const, _ref: CONTACT_FORM_ID},
      aside: {
        title: CONTACT_FORM.aside.title,
        body: CONTACT_FORM.aside.body,
        items: CONTACT_FORM.aside.items.map((item) => ({
          ...item,
          _type: 'contactItem' as const,
          _key: key(item.title),
        })),
        cta: cta(CONTACT_FORM.aside.cta.label, CONTACT_FORM.aside.cta.href),
      },
    },
  ]
}

export async function seedContact() {
  console.log('Contact page')
  await upsertPage('contact', 'Contact', await buildContactContent())
}
