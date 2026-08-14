import {defineType} from 'sanity'
import {linkFields} from './linkFields'

export const linkType = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: linkFields,
})
