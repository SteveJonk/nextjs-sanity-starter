import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const faqsType = defineType({
  name: 'faqs',
  title: 'FAQs',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'intro', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'link', type: 'cta'}),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})],
      validation: (rule) => rule.min(1).required(),
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title || 'FAQs', subtitle: 'FAQs'}
    },
  },
})
