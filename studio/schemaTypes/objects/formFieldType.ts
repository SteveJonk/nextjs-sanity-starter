import {defineArrayMember, defineField, defineType} from 'sanity'

/** Hide a setting unless the field's input type is one of these. */
const onlyFor =
  (...types: string[]) =>
  ({parent}: {parent?: {type?: string}}) =>
    !types.includes(parent?.type ?? '')

/** The opposite: hide a setting *for* these input types. */
const notFor =
  (...types: string[]) =>
  ({parent}: {parent?: {type?: string}}) =>
    types.includes(parent?.type ?? '')

/**
 * One input in a form.
 *
 * `name` is the key the answer is submitted and mailed under, so it is
 * constrained to something safe to put in a URL and an e-mail table. `width`
 * is what lets two fields share a row — see `toFieldRows` in the app's
 * `src/lib/form-fields.ts`.
 */
export const formFieldType = defineType({
  name: 'formField',
  title: 'Field',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'name',
      type: 'string',
      description:
        'Key this answer is submitted and mailed under. Letters, digits, - and _; no spaces.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {name: 'field name'})
          .error('Start with a letter and use only letters, digits, - or _.'),
    }),
    defineField({
      name: 'type',
      type: 'string',
      initialValue: 'text',
      options: {
        list: [
          {title: 'Text', value: 'text'},
          {title: 'E-mail', value: 'email'},
          {title: 'Phone', value: 'tel'},
          {title: 'URL', value: 'url'},
          {title: 'Text area', value: 'textarea'},
          {title: 'Dropdown', value: 'select'},
          {title: 'Radio buttons', value: 'radio'},
          {title: 'Checkboxes', value: 'checkbox'},
          {title: 'File upload', value: 'file'},
          {title: 'Hidden field', value: 'hidden'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultValue',
      title: 'Value',
      type: 'string',
      description:
        'The value submitted with the form. Double braces are filled in by the page: ' +
        'a hidden field with {{path}} sends the page it was submitted from. ' +
        'A token the page does not know is sent empty.',
      hidden: onlyFor('hidden'),
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as {type?: string} | undefined)?.type === 'hidden' && !value
            ? 'A hidden field without a value sends nothing.'
            : true,
        ),
    }),
    defineField({
      name: 'width',
      type: 'string',
      initialValue: 'full',
      description: 'Two consecutive half-width fields share one row on desktop.',
      options: {
        list: [
          {title: 'Full width', value: 'full'},
          {title: 'Half width', value: 'half'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      hidden: notFor('hidden'),
    }),
    defineField({
      name: 'isRequired',
      title: 'Required',
      type: 'boolean',
      initialValue: false,
      hidden: notFor('hidden'),
    }),
    defineField({
      name: 'placeholder',
      type: 'string',
      description:
        'On a dropdown this becomes the empty first choice (e.g. "Choose one"). Leave it empty to preselect the first option instead.',
      hidden: onlyFor('text', 'email', 'tel', 'url', 'textarea', 'select'),
    }),
    defineField({
      name: 'helpText',
      type: 'string',
      description: 'Small print under the field. Supports [label](https://link).',
      hidden: notFor('hidden'),
    }),
    defineField({
      name: 'selectOptions',
      title: 'Dropdown options',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      hidden: onlyFor('select'),
    }),
    defineField({
      name: 'radioOptions',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      hidden: onlyFor('radio'),
    }),
    defineField({
      name: 'checkboxOptions',
      type: 'array',
      of: [defineArrayMember({type: 'text', rows: 2})],
      description: 'One checkbox per option. Supports [label](https://link).',
      hidden: onlyFor('checkbox'),
    }),
  ],
  preview: {
    select: {title: 'label', type: 'type', isRequired: 'isRequired'},
    prepare({title, type, isRequired}) {
      return {
        title: title || 'Field',
        subtitle: [type, isRequired ? 'required' : null].filter(Boolean).join(' · '),
      }
    },
  },
})
