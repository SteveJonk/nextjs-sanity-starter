import {defineField, defineType} from 'sanity'
import {linkFields} from './linkFields'

export const ctaType = defineType({
  name: 'cta',
  title: 'CTA',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    ...linkFields,
  ],
})
