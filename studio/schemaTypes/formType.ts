import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Multi-step forms keep their fields under `steps`, simple ones under `fields`. */
const isSteps = (document?: Record<string, unknown>) => document?.mode === 'steps'

/**
 * Every form on the site. One page of fields by default; switch **Type** to
 * "In steps" to spread the same fields over steps with a progress bar.
 *
 * A form is a document, not a block, so the same one can be dropped onto
 * several pages. Submitting goes through the app's /api/submit-form, and the
 * shared mail settings live in `formGeneralSettings`.
 */
export const formType = defineType({
  name: 'form',
  title: 'Form',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [
    {name: 'content', title: 'Fields', default: true},
    {name: 'labels', title: 'Buttons & confirmation'},
    {name: 'mail', title: 'Mail'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Name of the form. Only shown on the site if "Show title" is on.',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'showTitle',
      title: 'Show title',
      type: 'boolean',
      initialValue: false,
      group: 'content',
    }),
    defineField({
      name: 'mode',
      title: 'Type',
      type: 'string',
      initialValue: 'simple',
      group: 'content',
      description:
        'In steps shows a progress bar and a "Next" button, and checks each step before moving on.',
      options: {
        list: [
          {title: 'One page', value: 'simple'},
          {title: 'In steps', value: 'steps'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fields',
      title: 'Fields',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'formField'})],
      hidden: ({document}) => isSteps(document),
      // Only required in the mode that uses it — a hidden required field would
      // otherwise block publishing with no visible explanation.
      validation: (rule) =>
        rule.custom((value, context) =>
          isSteps(context.document) || (Array.isArray(value) && value.length > 0)
            ? true
            : 'Add at least one field.',
        ),
    }),
    defineField({
      name: 'steps',
      type: 'array',
      group: 'content',
      hidden: ({document}) => !isSteps(document),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'formStep',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              description: 'Optional heading above this step.',
            }),
            defineField({
              name: 'fields',
              type: 'array',
              of: [defineArrayMember({type: 'formField'})],
              validation: (rule) => rule.min(1).required(),
            }),
          ],
          preview: {
            select: {title: 'title', fields: 'fields'},
            prepare({title, fields}) {
              const count = Array.isArray(fields) ? fields.length : 0
              return {
                title: title || 'Step',
                subtitle: `${count} ${count === 1 ? 'field' : 'fields'}`,
              }
            },
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((value, context) =>
          !isSteps(context.document) || (Array.isArray(value) && value.length > 0)
            ? true
            : 'Add at least one step.',
        ),
    }),
    defineField({
      name: 'submitButtonText',
      type: 'string',
      initialValue: 'Send',
      group: 'labels',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'nextButtonText',
      type: 'string',
      initialValue: 'Next',
      group: 'labels',
      hidden: ({document}) => !isSteps(document),
    }),
    defineField({
      name: 'backButtonText',
      type: 'string',
      initialValue: 'Back',
      group: 'labels',
      hidden: ({document}) => !isSteps(document),
    }),
    defineField({
      name: 'redirectAfterSubmit',
      title: 'Redirect after sending',
      type: 'boolean',
      initialValue: false,
      group: 'labels',
      description:
        'On: after a successful submission the visitor goes to another page (a thank-you page, say) instead of seeing the confirmation below.',
    }),
    defineField({
      name: 'redirectLink',
      title: 'Redirect to',
      type: 'link',
      group: 'labels',
      hidden: ({document}) => !document?.redirectAfterSubmit,
      description: 'A page on this site, or an external URL.',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!context.document?.redirectAfterSubmit) return true
          const link = value as {linkType?: string} | undefined
          if (!link?.linkType) return 'Pick a page or fill in a URL.'
          // The link object validates its own halves; this only catches an
          // empty object, which those rules never see.
          return true
        }),
    }),
    defineField({
      name: 'successTitle',
      type: 'string',
      description: 'Shown instead of the form after a successful submission.',
      group: 'labels',
      hidden: ({document}) => Boolean(document?.redirectAfterSubmit),
      // Not required while redirecting: the confirmation is never rendered, and
      // a hidden required field would block publishing with no visible reason.
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.redirectAfterSubmit || value
            ? true
            : 'Fill in a confirmation title.',
        ),
    }),
    defineField({
      name: 'successBody',
      type: 'text',
      rows: 3,
      group: 'labels',
      hidden: ({document}) => Boolean(document?.redirectAfterSubmit),
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.redirectAfterSubmit || value
            ? true
            : 'Fill in a confirmation message.',
        ),
    }),
    defineField({
      name: 'mailRecipients',
      title: 'Recipients',
      type: 'string',
      group: 'mail',
      description:
        'Where this submission goes. Several addresses are allowed, separated by commas. Empty = the admin address from Form settings.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          const bad = value
            .split(',')
            .map((address) => address.trim())
            .filter((address) => address && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address))
          return bad.length ? `Not a valid e-mail address: ${bad.join(', ')}` : true
        }),
    }),
    defineField({
      name: 'mailSubject',
      title: 'Subject',
      type: 'string',
      group: 'mail',
      description: 'Subject of the mail to the recipients. Empty = the text from Form settings.',
    }),
    defineField({
      name: 'mailMessage',
      title: 'Message',
      type: 'text',
      rows: 4,
      group: 'mail',
      description: 'Intro above the table of answers. Empty = the text from Form settings.',
    }),
    defineField({
      name: 'sendCopyToSubmitter',
      title: 'Also mail the person who filled it in',
      type: 'boolean',
      initialValue: false,
      group: 'mail',
      description:
        'Uses the first field of type E-mail in this form as the recipient. Without such a field nothing happens.',
    }),
    defineField({
      name: 'copySubject',
      title: 'Subject (mail to the sender)',
      type: 'string',
      group: 'mail',
      hidden: ({document}) => !document?.sendCopyToSubmitter,
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.sendCopyToSubmitter && !value
            ? 'Fill in a subject for the mail to the sender.'
            : true,
        ),
    }),
    defineField({
      name: 'copyMessage',
      title: 'Message (mail to the sender)',
      type: 'text',
      rows: 4,
      group: 'mail',
      hidden: ({document}) => !document?.sendCopyToSubmitter,
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.sendCopyToSubmitter && !value
            ? 'Fill in a message for the mail to the sender.'
            : true,
        ),
    }),
  ],
  preview: {
    select: {title: 'title', mode: 'mode', fields: 'fields', steps: 'steps'},
    prepare({title, mode, fields, steps}) {
      const list = mode === 'steps' ? steps : fields
      const count = Array.isArray(list) ? list.length : 0
      return {
        title: title || 'Form',
        subtitle:
          mode === 'steps'
            ? `In steps · ${count} ${count === 1 ? 'step' : 'steps'}`
            : `One page · ${count} ${count === 1 ? 'field' : 'fields'}`,
      }
    },
  },
})
