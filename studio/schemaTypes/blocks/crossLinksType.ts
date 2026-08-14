import {LinkIcon} from '@sanity/icons/Link'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const crossLinksType = defineType({
  name: 'crossLinks',
  title: 'Cross links',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'body', type: 'text', rows: 2, validation: (rule) => rule.required()}),
            defineField({name: 'link', type: 'link', title: 'Link', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
      validation: (rule) => rule.min(1).max(4).required(),
    }),
  ],
  preview: {
    select: {title0: 'items.0.title', title1: 'items.1.title'},
    prepare({title0, title1}) {
      return {
        title: [title0, title1].filter(Boolean).join(' · ') || 'Cross links',
        subtitle: 'Cross links',
      }
    },
  },
})
