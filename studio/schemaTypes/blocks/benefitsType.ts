import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const benefitsType = defineType({
  name: 'benefits',
  title: 'Benefits',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'lead', type: 'text', rows: 3, validation: (rule) => rule.required()}),
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
      name: 'items',
      title: 'Benefits',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              type: 'string',
              options: {
                list: [
                  {title: 'Person', value: 'person'},
                  {title: 'Camera', value: 'camera'},
                  {title: 'Chart', value: 'chart'},
                  {title: 'Document', value: 'doc'},
                  {title: 'House', value: 'house'},
                  {title: 'Renovate', value: 'renovate'},
                  {title: 'Scale', value: 'scale'},
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'body', type: 'text', rows: 3, validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'title', subtitle: 'icon'}},
        }),
      ],
      validation: (rule) => rule.min(1).required(),
    }),
  ],
  preview: {
    select: {title: 'title', media: 'image'},
    prepare({title, media}) {
      return {title: title || 'Benefits', subtitle: 'Benefits', media}
    },
  },
})
