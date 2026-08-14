import {ImagesIcon} from '@sanity/icons/Images'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const heroType = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'slides',
      title: 'Background slides',
      type: 'array',
      of: [
        defineArrayMember({
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
        }),
      ],
      validation: (rule) => rule.min(1).max(3).required(),
    }),
    defineField({
      name: 'eyebrow',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Main headline text before the highlighted phrase',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'titleHighlight',
      title: 'Title highlight',
      type: 'string',
      description: 'Italic phrase rendered after the title (e.g. brand name)',
    }),
    defineField({
      name: 'lead',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
      type: 'cta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'cta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'badgeLabel',
      title: 'Badge label',
      type: 'string',
      description: 'Small label under the badge value (e.g. YEARS)',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      titleHighlight: 'titleHighlight',
      media: 'slides.0',
    },
    prepare({title, titleHighlight, media}) {
      return {
        title: [title, titleHighlight].filter(Boolean).join(' '),
        subtitle: 'Hero',
        media,
      }
    },
  },
})
