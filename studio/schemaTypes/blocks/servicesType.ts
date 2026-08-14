import {CaseIcon} from '@sanity/icons/Case'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const servicesType = defineType({
  name: 'services',
  title: 'Services',
  type: 'object',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lead',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Service cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({
              name: 'description',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
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
            defineField({name: 'link', type: 'link', title: 'Link', validation: (rule) => rule.required()}),
          ],
          preview: {
            select: {title: 'title', subtitle: 'label', media: 'image'},
          },
        }),
      ],
      validation: (rule) => rule.min(1).required(),
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight banner',
      description: 'Optional dark band under the cards. Leave the title empty to hide it.',
      type: 'object',
      fields: [
        defineField({name: 'badge', type: 'string'}),
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 3}),
        defineField({name: 'cta', type: 'cta'}),
      ],
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title || 'Services', subtitle: 'Services'}
    },
  },
})
