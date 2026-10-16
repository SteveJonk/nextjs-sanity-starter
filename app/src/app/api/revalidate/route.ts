import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { matchesSecret } from '@/lib/secret';
import { SANITY_TAG } from '@/sanity/fetch';

export const runtime = 'nodejs';

/**
 * Expires the cached Sanity reads. Two callers:
 *
 * - The Sanity webhook, after a publish. Set up in sanity.io/manage -> API ->
 *   Webhooks: URL `<site>/api/revalidate`, method POST, trigger on
 *   create/update/delete, projection `{_type}` and the same secret as
 *   SANITY_REVALIDATE_SECRET.
 * - The "Refresh website" panel in the studio, which sends that secret as
 *   `x-revalidate-secret`. The studio runs on another origin, hence CORS.
 *
 * Without the secret the route refuses everything, so it can never be called
 * anonymously.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'x-revalidate-secret, content-type',
  'Access-Control-Max-Age': '86400',
};

function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Expire now, not 'max' (stale-while-revalidate): on Netlify the stale page
// served right after the purge is cached at the edge again for the rest of
// REVALIDATE, so a publish would not show up for up to a day.
function expire(type: string | null) {
  revalidateTag(SANITY_TAG, { expire: 0 });
  return reply({ ok: true, revalidated: SANITY_TAG, type });
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return reply({ ok: false, message: 'SANITY_REVALIDATE_SECRET is not set.' }, 500);
  }

  const given = request.headers.get('x-revalidate-secret');
  if (given !== null) {
    if (!given || !matchesSecret(given, secret)) {
      return reply({ ok: false, message: 'Invalid cache secret.' }, 401);
    }
    return expire('studio');
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
    if (!isValidSignature) {
      return reply({ ok: false, message: 'Invalid signature.' }, 401);
    }
    return expire(body?._type ?? null);
  } catch (error) {
    console.error(`Revalidate webhook failed: ${error instanceof Error ? error.message : error}`);
    return reply({ ok: false, message: 'Could not process the webhook.' }, 400);
  }
}
