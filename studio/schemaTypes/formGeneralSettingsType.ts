import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

/**
 * Mail and spam settings shared by every `form`. A singleton.
 *
 * Sending goes through Mailjet's HTTP API — see the app's
 * `src/app/api/submit-form/route.ts`. Swapping providers means changing that
 * one function; nothing else here is Mailjet-specific.
 *
 * The API credentials below are a fallback for local work only. A Sanity
 * dataset is readable by anyone who knows the project id, so in production
 * these belong in the app environment (MAILJET_API_KEY / MAILJET_API_SECRET),
 * which wins over whatever is stored here.
 */
export const formGeneralSettingsType = defineType({
  name: 'formGeneralSettings',
  title: 'Form settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'mail', title: 'Mail', default: true},
    {name: 'branding', title: 'Mail design'},
    {name: 'spam', title: 'Spam'},
  ],
  fields: [
    defineField({
      name: 'adminEmail',
      title: 'Admin e-mail',
      type: 'string',
      group: 'mail',
      description: 'Default recipient. A form with its own "Recipients" overrides this.',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'fromEmail',
      title: 'Sender address',
      type: 'string',
      group: 'mail',
      description:
        'Address the mail is sent from. Must be a sender your mail provider has validated, or it is rejected. Falls back to the admin address.',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'fromName',
      title: 'Sender name',
      type: 'string',
      group: 'mail',
    }),
    defineField({
      name: 'confirmationSubject',
      title: 'Subject',
      type: 'string',
      group: 'mail',
      description: 'Default subject of the mail to the recipients. A form can override it.',
      initialValue: 'New message from the website',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'confirmationMessage',
      title: 'Message',
      type: 'text',
      rows: 4,
      group: 'mail',
      description: 'Default intro above the table of answers. A form can override it.',
      initialValue: 'A new message came in through the website.',
    }),
    defineField({
      name: 'mailjetApiKey',
      title: 'Mailjet API key',
      type: 'string',
      group: 'mail',
      description: 'Fallback only — prefer MAILJET_API_KEY in the app environment.',
    }),
    defineField({
      name: 'mailjetApiSecret',
      title: 'Mailjet API secret',
      type: 'string',
      group: 'mail',
      description: 'Fallback only — prefer MAILJET_API_SECRET in the app environment.',
    }),
    defineField({
      // Not called `logo`: that field name also exists on siteInformation, and
      // queries that fetch singletons by _id would grow an extra branch.
      name: 'mailLogo',
      title: 'Logo in the mail',
      type: 'image',
      group: 'branding',
      description: 'Sits at the top of every form mail. Leave empty to show only the sender name.',
    }),
    defineField({
      name: 'primaryColor',
      title: 'Accent colour',
      type: 'string',
      group: 'branding',
      description: 'Hex code, e.g. #0f172a. Used for the bar and the accents in the mail.',
      initialValue: '#0f172a',
      validation: (rule) => rule.regex(/^#[0-9a-fA-F]{6}$/, {name: 'hex colour'}),
    }),
    defineField({
      name: 'textColor',
      title: 'Text colour',
      type: 'string',
      group: 'branding',
      description: 'Hex code, e.g. #0f172a. The colour of the text in the mail.',
      initialValue: '#0f172a',
      validation: (rule) => rule.regex(/^#[0-9a-fA-F]{6}$/, {name: 'hex colour'}),
    }),
    defineField({
      name: 'recaptchaEnabled',
      title: 'Enable reCAPTCHA',
      type: 'boolean',
      group: 'spam',
      description: 'Google reCAPTCHA v2 ("I am not a robot") on every form.',
      initialValue: false,
    }),
    defineField({
      name: 'recaptchaSiteKey',
      title: 'reCAPTCHA site key',
      type: 'string',
      group: 'spam',
      description: 'Public — it ships in the page.',
      hidden: ({document}) => !document?.recaptchaEnabled,
      validation: (rule) =>
        rule.custom((field, context) =>
          context.document?.recaptchaEnabled && !field
            ? 'Site key is required when reCAPTCHA is enabled'
            : true,
        ),
    }),
    defineField({
      name: 'recaptchaSecretKey',
      title: 'reCAPTCHA secret key',
      type: 'string',
      group: 'spam',
      description: 'Fallback only — prefer RECAPTCHA_SECRET_KEY in the app environment.',
      hidden: ({document}) => !document?.recaptchaEnabled,
      validation: (rule) =>
        rule.custom((field, context) =>
          context.document?.recaptchaEnabled && !field
            ? 'Secret key is required when reCAPTCHA is enabled'
            : true,
        ),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Form settings'}
    },
  },
})
