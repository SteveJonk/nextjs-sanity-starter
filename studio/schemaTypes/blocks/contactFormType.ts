import {CommentIcon} from '@sanity/icons/Comment'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A form from Forms, with a contact panel beside it.
 *
 * The block owns the surrounding copy; the form itself is a reference, so the
 * same form can appear on several pages and its fields are edited in one place.
 */
export const contactFormType = defineType({
  name: 'contactForm',
  title: 'Contact form',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'lead', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({
      name: 'form',
      title: 'Form',
      type: 'reference',
      to: [{type: 'form'}],
      description: 'The form to show. Its fields are managed under Forms.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      type: 'string',
      description: 'Small print under the submit button.',
    }),
    defineField({
      name: 'aside',
      title: 'Contact panel',
      type: 'object',
      description: 'The panel beside the form. Leave the title empty to hide it.',
      fields: [
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 3}),
        defineField({
          name: 'items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'contactItem',
              fields: [
                defineField({
                  name: 'icon',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Phone', value: 'phone'},
                      {title: 'WhatsApp', value: 'whatsapp'},
                      {title: 'Mail', value: 'mail'},
                      {title: 'Map pin', value: 'pin'},
                    ],
                    layout: 'radio',
                    direction: 'horizontal',
                  },
                  validation: (rule) => rule.required(),
                }),
                defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'subtitle', type: 'string'}),
              ],
              preview: {select: {title: 'title', subtitle: 'subtitle'}},
            }),
          ],
        }),
        defineField({name: 'cta', type: 'cta'}),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'form.title'},
    prepare({title, subtitle}) {
      return {title: title || 'Contact form', subtitle: subtitle || 'Contact form'}
    },
  },
})
