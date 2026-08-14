import {ImagesIcon} from '@sanity/icons/Images'
import {defineField, defineType} from 'sanity'

export const pageHeroType = defineType({
  name: 'pageHero',
  title: 'Page hero',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'breadcrumbLabel',
      title: 'Breadcrumb label',
      type: 'string',
      description: 'Current page label in the breadcrumb (e.g. About)',
    }),
    defineField({name: 'eyebrow', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Headline text before the highlighted phrase',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'titleHighlight',
      title: 'Title highlight',
      type: 'string',
    }),
    defineField({name: 'lead', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'primaryCta', title: 'Primary CTA', type: 'cta'}),
    defineField({name: 'secondaryCta', title: 'Secondary CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'title', titleHighlight: 'titleHighlight', media: 'image'},
    prepare({title, titleHighlight, media}) {
      return {
        title: [title, titleHighlight].filter(Boolean).join(' '),
        subtitle: 'Page hero',
        media,
      }
    },
  },
})
