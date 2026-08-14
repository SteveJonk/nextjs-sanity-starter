import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {defineField, defineType} from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Question',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Inline link (optional)',
      type: 'cta',
      description: 'Inserted after the answer text, before afterLink',
    }),
    defineField({
      name: 'afterLink',
      title: 'Text after link',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
