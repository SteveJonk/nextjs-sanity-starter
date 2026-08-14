import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {linkFields} from './objects/linkFields'

const footerLinkMember = defineArrayMember({
  type: 'object',
  name: 'footerLink',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    ...linkFields,
  ],
  preview: {
    select: {
      title: 'label',
      linkType: 'linkType',
      href: 'href',
      internalTitle: 'internalLink.title',
    },
    prepare({title, linkType, href, internalTitle}) {
      return {
        title: title || 'Link',
        subtitle:
          linkType === 'internal'
            ? internalTitle || 'Internal page'
            : href || 'External URL',
      }
    },
  },
})

export const footerType = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'linkGroups',
      title: 'Link groups',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'linkGroup',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'links',
              type: 'array',
              of: [footerLinkMember],
            }),
          ],
          preview: {
            select: {title: 'title', links: 'links'},
            prepare({title, links}) {
              const count = Array.isArray(links) ? links.length : 0
              return {
                title: title || 'Link group',
                subtitle: `${count} link${count === 1 ? '' : 's'}`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
            }),
          ],
          preview: {
            select: {title: 'platform', subtitle: 'url'},
          },
        }),
      ],
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright text',
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Footer'}
    },
  },
})
