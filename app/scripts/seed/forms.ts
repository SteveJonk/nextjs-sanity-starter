/**
 * Seeds the shared form settings and one working contact form.
 *
 * The form is a document with a fixed `_id`, so the block that references it
 * (see `about.ts`) can point at it without looking anything up, and re-running
 * the seed updates it in place.
 *
 * The mail credentials are deliberately NOT seeded: they belong in `app/.env`
 * as MAILJET_API_KEY / MAILJET_API_SECRET, which the submit route prefers over
 * anything stored in the dataset.
 */
import {CONTACT_FORM_FIELDS} from '../../src/lib/demo-content'
import {SITE_DEFAULTS} from '../../src/lib/site'
import {client, key} from './shared'

export const CONTACT_FORM_ID = 'form-contact'

async function upsertFormSettings() {
  await client.createOrReplace({
    _id: 'formGeneralSettings',
    _type: 'formGeneralSettings' as const,
    adminEmail: SITE_DEFAULTS.email,
    fromName: SITE_DEFAULTS.name,
    confirmationSubject: 'New message from the website',
    confirmationMessage: 'A new message came in through the website.',
    primaryColor: '#0f172a',
    textColor: '#0f172a',
    recaptchaEnabled: false,
  })

  console.log('✓ form settings singleton upserted')
}

async function upsertContactForm() {
  await client.createOrReplace({
    _id: CONTACT_FORM_ID,
    _type: 'form' as const,
    title: 'Contact',
    showTitle: false,
    mode: 'simple',
    fields: CONTACT_FORM_FIELDS.map((field) => ({
      ...field,
      _type: 'formField' as const,
      _key: key(field.name),
    })),
    submitButtonText: 'Send message',
    successTitle: 'Thank you — we have it',
    successBody:
      'We read every message ourselves and answer within two working days. Check your spam folder if you do not hear from us.',
    redirectAfterSubmit: false,
    sendCopyToSubmitter: false,
  })

  console.log('✓ contact form upserted')
}

export async function seedForms() {
  console.log('Forms')
  await upsertFormSettings()
  await upsertContactForm()
}
