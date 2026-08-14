import {defineField} from 'sanity'

/** Shared internal/external link fields for `link` and `cta` objects. */
export const linkFields = [
  defineField({
    name: 'linkType',
    title: 'Link type',
    type: 'string',
    options: {
      list: [
        {title: 'Internal page', value: 'internal'},
        {title: 'External URL', value: 'external'},
      ],
      layout: 'radio',
      direction: 'horizontal',
    },
    initialValue: 'external',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'internalLink',
    title: 'Page',
    type: 'reference',
    to: [{type: 'page'}],
    hidden: ({parent}) => parent?.linkType !== 'internal',
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as {linkType?: string} | undefined
        if (parent?.linkType === 'internal' && !value) {
          return 'Select a page'
        }
        return true
      }),
  }),
  defineField({
    name: 'href',
    title: 'URL',
    type: 'string',
    description: 'Path (/about), full URL, tel: or mailto:',
    hidden: ({parent}) => parent?.linkType !== 'external',
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as {linkType?: string} | undefined
        if (parent?.linkType === 'external' && !value?.trim()) {
          return 'Enter a URL'
        }
        return true
      }),
  }),
]
