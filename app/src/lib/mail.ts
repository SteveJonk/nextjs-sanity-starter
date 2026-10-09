import nodemailer from 'nodemailer';
import { SITE_DEFAULTS } from '@/lib/site';
import type { FORM_SETTINGS_QUERY_RESULT } from '@/sanity/sanity.types';

/**
 * Mail sending for `/api/submit-form` and `/api/test-mail`: Mailjet's HTTP API
 * or the client's own SMTP server, picked by Form settings → Mail provider.
 *
 * Env wins over the studio settings throughout: a dataset is readable by
 * anyone with the project id, so credentials belong in the environment.
 */

export type MailMessage = {
  fromEmail: string;
  fromName: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  attachments: { filename: string; content: Buffer }[];
};

export type SmtpSecurity = 'ssl' | 'starttls' | 'none';

export type MailTransport =
  | { provider: 'mailjet'; apiKey: string; apiSecret: string }
  | {
      provider: 'smtp';
      host: string;
      port?: number;
      security: SmtpSecurity;
      user?: string;
      password?: string;
    };

/** Sends via Mailjet's HTTP API (v3.1). Throws on a non-2xx response. */
async function sendViaMailjet(
  { apiKey, apiSecret }: { apiKey: string; apiSecret: string },
  message: MailMessage,
) {
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: message.fromEmail, Name: message.fromName },
          To: message.to.map((email) => ({ Email: email })),
          ...(message.replyTo ? { ReplyTo: { Email: message.replyTo } } : {}),
          Subject: message.subject,
          HTMLPart: message.html,
          TextPart: message.text,
          Attachments: message.attachments.map((attachment) => ({
            ContentType: 'application/octet-stream',
            Filename: attachment.filename,
            Base64Content: attachment.content.toString('base64'),
          })),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Mailjet responded ${response.status}: ${body}`);
  }
}

/** Default port per encryption, used when the studio leaves Port empty. */
const SMTP_PORTS: Record<SmtpSecurity, number> = { ssl: 465, starttls: 587, none: 25 };

/**
 * Sends via the client's own SMTP server. Throws when the server refuses.
 *
 * `starttls` insists on the upgrade (requireTLS) rather than silently falling
 * back to plain text when the server does not offer it.
 */
async function sendViaSmtp(
  smtp: Extract<MailTransport, { provider: 'smtp' }>,
  message: MailMessage,
) {
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port || SMTP_PORTS[smtp.security],
    secure: smtp.security === 'ssl',
    requireTLS: smtp.security === 'starttls',
    ignoreTLS: smtp.security === 'none',
    auth: smtp.user ? { user: smtp.user, pass: smtp.password ?? '' } : undefined,
    // Fail inside the serverless function's time limit, not after it.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });

  await transporter.sendMail({
    from: { name: message.fromName, address: message.fromEmail },
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments: message.attachments,
  });
}

/** The one place that knows which providers exist. */
export function sendMail(transport: MailTransport, message: MailMessage) {
  return transport.provider === 'smtp'
    ? sendViaSmtp(transport, message)
    : sendViaMailjet(transport, message);
}

/** Provider, credentials and sender from env + Form settings. `transport` is null when incomplete. */
export function resolveMailSettings(settings: FORM_SETTINGS_QUERY_RESULT | null) {
  const provider = process.env.MAIL_PROVIDER || settings?.mailProvider || 'mailjet';
  let transport: MailTransport | null = null;
  if (provider === 'smtp') {
    const host = process.env.SMTP_HOST || settings?.smtpHost;
    const security = (process.env.SMTP_SECURITY || settings?.smtpSecurity || 'starttls') as SmtpSecurity;
    if (host && security in SMTP_PORTS) {
      transport = {
        provider,
        host,
        port: Number(process.env.SMTP_PORT) || settings?.smtpPort || undefined,
        security,
        user: process.env.SMTP_USER || settings?.smtpUser || undefined,
        password: process.env.SMTP_PASSWORD || settings?.smtpPassword || undefined,
      };
    }
  } else {
    const apiKey = process.env.MAILJET_API_KEY || settings?.mailjetApiKey;
    const apiSecret = process.env.MAILJET_API_SECRET || settings?.mailjetApiSecret;
    if (apiKey && apiSecret) transport = { provider: 'mailjet', apiKey, apiSecret };
  }

  const adminEmail = process.env.CONTACT_ADMIN_EMAIL || settings?.adminEmail;
  // Mailjet and most SMTP servers only accept a sender they know; fall back to
  // the recipient, which is the one address known to belong to this account.
  const fromEmail =
    process.env.MAIL_FROM_EMAIL ||
    process.env.MAILJET_FROM_EMAIL ||
    settings?.fromEmail ||
    adminEmail;
  const fromName = settings?.fromName || SITE_DEFAULTS.name;

  return { provider, transport, adminEmail, fromEmail, fromName };
}
