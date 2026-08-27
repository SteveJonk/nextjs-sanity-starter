import {CogIcon} from '@sanity/icons/Cog'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Who the site belongs to: the details that appear in the header, the footer
 * and the structured data.
 *
 * A singleton — one document with a fixed `_id`, edited from the studio's top
 * menu. `npm run seed:site` fills it from the defaults in the app's
 * `src/lib/site.ts`, which are also what the front end falls back to when a
 * field here is empty.
 */
export const siteInformationType = defineType({
  name: 'siteInformation',
  title: 'Site information',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'identity', title: 'Identity', default: true},
    {name: 'contact', title: 'Contact'},
    {name: 'elsewhere', title: 'Elsewhere'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Site name',
      type: 'string',
      group: 'identity',
      description: 'Used in the logo, the page title template and the structured data.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      group: 'identity',
      description: 'The footer strapline, and the meta description a page does not set itself.',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      group: 'identity',
      description:
        'Only used in the structured data — search engines show it beside the site name. The visible logo is a component.',
    }),
    defineField({
      name: 'language',
      type: 'string',
      group: 'identity',
      initialValue: 'en',
      description: 'BCP 47 language tag, e.g. en, en-GB, nl. Sets the page language.',
    }),
    defineField({name: 'phone', type: 'string', group: 'contact'}),
    defineField({name: 'email', type: 'string', group: 'contact'}),
    defineField({
      name: 'address',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({type: 'string'})],
      description:
        'One line per row, as it should be printed. The last line is read as postcode + city.',
    }),
    defineField({
      name: 'addressCountry',
      title: 'Country code',
      type: 'string',
      group: 'contact',
      initialValue: 'NL',
      description: 'ISO 3166-1 alpha-2, e.g. NL, DE, GB. Structured data only.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'elsewhere',
      description: 'Profiles elsewhere. Tells search engines these accounts are the same company.',
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
      name: 'badges',
      title: 'Footer badges',
      type: 'array',
      group: 'elsewhere',
      of: [defineArrayMember({type: 'string'})],
      description: 'Memberships, certifications, awards. Leave empty to hide the row.',
    }),
  ],
  preview: {
    select: {title: 'name'},
    prepare({title}) {
      return {title: 'Site information', subtitle: title}
    },
  },
})
