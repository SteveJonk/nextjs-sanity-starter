import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'
import {MailTest} from '../tools/MailTest'

/**
 * Mail and spam settings shared by every `form`. A singleton.
 *
 * Sending goes through Mailjet's HTTP API or the client's own SMTP server,
 * picked by `mailProvider` — see the app's `src/lib/mail.ts`.
 *
 * The credentials below are a fallback for local work only. A Sanity dataset
 * is readable by anyone who knows the project id, so in production these
 * belong in the app environment (MAILJET_API_KEY / MAILJET_API_SECRET,
 * SMTP_USER / SMTP_PASSWORD), which wins over whatever is stored here.
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
      name: 'mailProvider',
      title: 'Mail provider',
      type: 'string',
      group: 'mail',
      description: 'MAIL_PROVIDER in the app environment overrides this.',
      options: {
        list: [
          {title: 'Mailjet', value: 'mailjet'},
          {title: 'SMTP (own mail server)', value: 'smtp'},
        ],
        layout: 'radio',
      },
      initialValue: 'mailjet',
    }),
    defineField({
      name: 'mailjetApiKey',
      title: 'Mailjet API key',
      type: 'string',
      group: 'mail',
      description: 'Fallback only — prefer MAILJET_API_KEY in the app environment.',
      hidden: ({document}) => (document?.mailProvider ?? 'mailjet') !== 'mailjet',
    }),
    defineField({
      name: 'mailjetApiSecret',
      title: 'Mailjet API secret',
      type: 'string',
      group: 'mail',
      description: 'Fallback only — prefer MAILJET_API_SECRET in the app environment.',
      hidden: ({document}) => (document?.mailProvider ?? 'mailjet') !== 'mailjet',
    }),
    defineField({
      name: 'smtpHost',
      title: 'SMTP server',
      type: 'string',
      group: 'mail',
      description: 'E.g. smtp.office365.com or mail.example.com. SMTP_HOST overrides this.',
      hidden: ({document}) => document?.mailProvider !== 'smtp',
      validation: (rule) =>
        rule.custom((field, context) =>
          context.document?.mailProvider === 'smtp' && !field
            ? 'SMTP server is required when SMTP is the mail provider'
            : true,
        ),
    }),
    defineField({
      name: 'smtpSecurity',
      title: 'Encryption',
      type: 'string',
      group: 'mail',
      description: 'Ask the mail host which one; STARTTLS on port 587 is the most common.',
      options: {
        list: [
          {title: 'STARTTLS (usually port 587)', value: 'starttls'},
          {title: 'SSL/TLS (usually port 465)', value: 'ssl'},
          {title: 'None (port 25, not recommended)', value: 'none'},
        ],
        layout: 'radio',
      },
      initialValue: 'starttls',
      hidden: ({document}) => document?.mailProvider !== 'smtp',
    }),
    defineField({
      name: 'smtpPort',
      title: 'Port',
      type: 'number',
      group: 'mail',
      description: 'Leave empty for the usual port of the chosen encryption.',
      hidden: ({document}) => document?.mailProvider !== 'smtp',
      validation: (rule) => rule.integer().min(1).max(65535),
    }),
    defineField({
      name: 'smtpUser',
      title: 'SMTP username',
      type: 'string',
      group: 'mail',
      description:
        'Usually the full e-mail address. Leave empty if the server needs no login. SMTP_USER overrides this.',
      hidden: ({document}) => document?.mailProvider !== 'smtp',
    }),
    defineField({
      name: 'smtpPassword',
      title: 'SMTP password',
      type: 'string',
      group: 'mail',
      description:
        'Fallback only — prefer SMTP_PASSWORD in the app environment. Anything stored here is readable by anyone with the project id.',
      hidden: ({document}) => document?.mailProvider !== 'smtp',
      // A warning, not an error: it must stay possible for local work, but an
      // editor filling it in should see the risk before publishing.
      validation: (rule) =>
        rule
          .custom((field) =>
            field
              ? 'Not safe: this password is readable by anyone who knows the project id. Put it in SMTP_PASSWORD on the hosting (Netlify) instead and leave this empty.'
              : true,
          )
          .warning(),
    }),
    defineField({
      name: 'mailTest',
      title: 'Test mail',
      type: 'string',
      group: 'mail',
      // Not data: a panel with the "Send test mail" button. Nothing is ever
      // written to this field.
      components: {field: MailTest},
    }),
    defineField({
      // Not called `logo`: that field name also exists on siteInformation, and
      // queries that fetch singletons by _id would grow an extra branch.
      name: 'mailLogo',
      title: 'Logo in the mail',
      type: 'image',
      group: 'branding',
      description: 'Sits at the top of every form mail. Leave empty to show only the sender name.',
      validation: (rule) => rule.assetRequired(),
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
