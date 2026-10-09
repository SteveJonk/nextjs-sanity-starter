import { NextResponse } from 'next/server';
import { renderFormMail } from '@/lib/form-mail';
import { resolveMailSettings, sendMail } from '@/lib/mail';
import { matchesSecret } from '@/lib/secret';
import { client } from '@/sanity/client';
import { imageSrc } from '@/sanity/image';
import { FORM_SETTINGS_QUERY } from '@/sanity/queries';

export const runtime = 'nodejs';

/**
 * Sends one test mail with the published Form settings — the "Send test mail"
 * button in the studio.
 *
 *   POST /api/test-mail             { "to": "optional@address" }
 *   x-mail-test-secret: <MAIL_TEST_SECRET>
 *
 * The secret keeps this from being an open mail relay; without it set the
 * route refuses everything. The studio runs on another origin, hence CORS.
 * The provider's error goes back verbatim: it is what the editor needs to fix
 * the settings ("Invalid login", "Sender not validated", …).
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'x-mail-test-secret, content-type',
  'Access-Control-Max-Age': '86400',
};

function reply(body: { ok: boolean; message: string }, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  const secret = process.env.MAIL_TEST_SECRET;
  if (!secret) return reply({ ok: false, message: 'MAIL_TEST_SECRET is not set on the website.' }, 500);

  const given = request.headers.get('x-mail-test-secret') ?? '';
  if (!given || !matchesSecret(given, secret)) {
    return reply({ ok: false, message: 'Wrong test-mail secret.' }, 401);
  }

  const body = (await request.json().catch(() => ({}))) as { to?: unknown };
  const settings = await client.fetch(FORM_SETTINGS_QUERY, {}, { cache: 'no-store' });
  const { provider, transport, adminEmail, fromEmail, fromName } = resolveMailSettings(settings);

  const to = typeof body.to === 'string' && body.to.trim() ? body.to.trim() : adminEmail;
  if (!to || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(to)) {
    return reply({ ok: false, message: 'No valid recipient address.' }, 400);
  }
  if (!fromEmail || !transport) {
    return reply({ ok: false, message: `The ${provider} settings are incomplete.` }, 400);
  }

  const subject = `Test mail (${provider})`;
  const mail = renderFormMail({
    title: subject,
    intro: 'If you can read this, the website can send mail with these settings.',
    answers: [
      { label: 'Provider', value: provider },
      ...(transport.provider === 'smtp'
        ? [{ label: 'Server', value: `${transport.host} (${transport.security})` }]
        : []),
      { label: 'Sender', value: fromName ? `${fromName} <${fromEmail}>` : fromEmail },
      { label: 'Sent at', value: new Date().toISOString() },
    ],
    branding: {
      logoUrl: imageSrc(settings?.mailLogo, 300),
      logoAlt: fromName,
      primaryColor: settings?.primaryColor,
      textColor: settings?.textColor,
      footer: fromName,
    },
  });

  try {
    await sendMail(transport, { fromEmail, fromName, to: [to], subject, ...mail, attachments: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`test-mail: sending via ${provider} failed: ${message}`);
    return reply({ ok: false, message: `Sending via ${provider} failed: ${message}` }, 502);
  }

  return reply({ ok: true, message: `Test mail sent to ${to} via ${provider}.` });
}
