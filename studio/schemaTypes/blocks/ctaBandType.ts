import {BellIcon} from '@sanity/icons/Bell'
import {defineField, defineType} from 'sanity'

export const ctaBandType = defineType({
  name: 'ctaBand',
  title: 'CTA band',
  type: 'object',
  icon: BellIcon,
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
    defineField({name: 'eyebrow', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'body', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'primaryCta', title: 'Primary CTA', type: 'cta'}),
    defineField({name: 'secondaryCta', title: 'Secondary CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'title', media: 'image'},
    prepare({title, media}) {
      return {title: title || 'CTA band', subtitle: 'CTA band', media}
    },
  },
})
