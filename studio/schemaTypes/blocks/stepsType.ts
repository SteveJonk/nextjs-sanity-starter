import {StackCompactIcon} from '@sanity/icons/StackCompact'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const stepsType = defineType({
  name: 'steps',
  title: 'Steps',
  type: 'object',
  icon: StackCompactIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'lead', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'cta', type: 'cta'}),
    defineField({
      name: 'items',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'number', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'body', type: 'text', rows: 4, validation: (rule) => rule.required()}),
            defineField({
              name: 'image',
              type: 'image',
              options: {hotspot: true},
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'number', media: 'image'},
          },
        }),
      ],
      validation: (rule) => rule.min(1).required(),
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title || 'Steps', subtitle: 'Steps'}
    },
  },
})
