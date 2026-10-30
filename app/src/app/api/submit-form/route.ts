import { NextResponse } from 'next/server';
import { verifyCaptcha } from '@/lib/captcha';
import { fillTokens, resolveFormText } from '@/lib/form-fields';
import { renderFormMail } from '@/lib/form-mail';
import { missingMailMessage, resolveMailSettings, sendMail } from '@/lib/mail';
import { client } from '@/sanity/client';
import { imageSrc } from '@/sanity/image';
import { FORM_QUERY, FORM_SETTINGS_QUERY } from '@/sanity/queries';

export const runtime = 'nodejs';

/** Bigger uploads are rejected rather than silently dropped from the mail. */
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

/** "a@x.com, b@x.com" -> ["a@x.com", "b@x.com"]. Semicolons separate too. */
function splitEmails(value?: string | null) {
  return (value ?? '')
    .split(/[,;]/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return fail('Could not read the request.', 400);
  }

  const formId = String(body.get('formId') ?? '');
  if (!formId) return fail('No form specified.', 400);

  // The form definition is the allow-list: a key the document does not declare
  // never reaches the mail, whatever the browser posted.
  const [form, settings] = await Promise.all([
    client.fetch(FORM_QUERY, { formId }, { cache: 'no-store' }),
    client.fetch(FORM_SETTINGS_QUERY, {}, { cache: 'no-store' }),
  ]);
  if (!form) return fail('Unknown form.', 404);
  // Visitor-facing messages; the config and request errors stay in code.
  const copy = resolveFormText(settings?.formText);

  // Spam gate before any real work. The secret belongs in the environment: a
  // Sanity dataset is world-readable, so the studio value is only a fallback.
  const captcha = settings?.captchaProvider;
  let unverified = false;
  if (captcha === 'recaptcha' || captcha === 'turnstile') {
    const secret =
      captcha === 'turnstile'
        ? process.env.TURNSTILE_SECRET_KEY || settings?.turnstileSecretKey
        : process.env.RECAPTCHA_SECRET_KEY || settings?.recaptchaSecretKey;
    if (!secret) {
      console.error(`submit-form: ${captcha} is the spam check but no secret key is set`);
      return fail('This form is not fully configured yet.', 500);
    }
    const verdict = await verifyCaptcha(captcha, String(body.get('captchaToken') ?? ''), secret);
    if (verdict === 'failed') return fail(copy.recaptchaFailed, 400);
    unverified = verdict === 'unavailable';
  }

  const answers: { label: string; value: string }[] = [];
  const attachments: { filename: string; content: Buffer }[] = [];
  /** First answer to an e-mail field — the address the copy mail goes to. */
  let submitterEmail = '';

  for (const field of form.fields ?? []) {
    if (!field?.name) continue;

    const values = body.getAll(field.name);
    const label = field.label || field.name;

    if (field.type === 'file') {
      const file = values.find(
        (value): value is File => value instanceof File && value.size > 0,
      );
      if (file) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          return fail(fillTokens(copy.fileTooLarge, { file: file.name }), 413);
        }
        attachments.push({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
        });
        answers.push({ label, value: file.name });
      } else if (field.isRequired) {
        return fail(fillTokens(copy.requiredField, { label }), 400);
      }
      continue;
    }

    const text = values
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean)
      .join(', ');

    if (!text) {
      if (field.isRequired) return fail(fillTokens(copy.requiredField, { label }), 400);
      continue;
    }
    if (field.type === 'email' && !submitterEmail) submitterEmail = text;
    answers.push({ label, value: text });
  }

  if (answers.length === 0) return fail(copy.emptyForm, 400);

  // Env wins over the studio settings: a dataset is readable by anyone with the
  // project id, so credentials belong in the environment.
  const { provider, transport, adminEmail, fromEmail, fromName, missing } = resolveMailSettings(settings);

  // Per-form recipients win over the shared admin address; both are valid.
  const recipients = splitEmails(form.mailRecipients);
  if (recipients.length === 0 && adminEmail) recipients.push(adminEmail);
  if (recipients.length === 0) missing.push('CONTACT_ADMIN_EMAIL (or recipients on the form)');

  if (missing.length || !fromEmail || !transport) {
    const message = missingMailMessage(provider, missing);
    console.error(`submit-form: ${message}`);
    return fail(message, 500);
  }

  // Logo and colours come from Form settings, so the template itself stays
  // generic — there is no brand name or fixed colour in form-mail.ts.
  const branding = {
    logoUrl: imageSrc(settings?.mailLogo, 300),
    logoAlt: fromName,
    primaryColor: settings?.primaryColor,
    textColor: settings?.textColor,
    footer: `Sent through the "${form.title ?? 'website'}" form on ${fromName}.`,
  };

  const subject =
    form.mailSubject ||
    settings?.confirmationSubject ||
    `New message from ${form.title ?? 'the website'}`;
  // The provider was down: the mail still goes out, tagged so it can be
  // filtered. The sender's copy below keeps the plain subject.
  const adminSubject = unverified ? `[Unverified] ${subject}` : subject;
  const mail = renderFormMail({
    title: adminSubject,
    intro:
      form.mailMessage ||
      settings?.confirmationMessage ||
      'A new message came in through the website.',
    answers,
    branding,
  });
  const replyTo = submitterEmail || answers.find(({ label }) => /mail/i.test(label))?.value;

  try {
    await sendMail(transport, {
      fromEmail,
      fromName,
      to: recipients,
      replyTo,
      subject: adminSubject,
      html: mail.html,
      text: mail.text,
      attachments,
    });
  } catch (error) {
    // The server's own words ("Invalid login: 535 …", "Connection timeout")
    // say what to fix; they carry no credentials.
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`submit-form: sending via ${provider} failed: ${reason}`);
    return fail(`Sending via ${provider} failed: ${reason}`, 502);
  }

  // The sender's copy is a courtesy: the submission already succeeded above, so
  // a failure here is logged, not reported back as a failed submission.
  if (form.sendCopyToSubmitter && submitterEmail) {
    try {
      await sendMail(transport, {
        fromEmail,
        fromName,
        to: [submitterEmail],
        subject: form.copySubject || subject,
        ...renderFormMail({
          title: form.copySubject || subject,
          intro: form.copyMessage || '',
          answers,
          branding,
        }),
        attachments: [],
      });
    } catch (error) {
      console.error('submit-form: copy to submitter failed', error);
    }
  }

  return NextResponse.json({ success: true });
}
