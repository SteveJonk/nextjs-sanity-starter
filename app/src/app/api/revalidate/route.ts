import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { SANITY_TAG } from '@/sanity/fetch';

export const runtime = 'nodejs';

/**
 * Sanity webhook target: expires the cached Sanity reads after a publish.
 *
 * Set up in sanity.io/manage -> API -> Webhooks: URL `<site>/api/revalidate`,
 * method POST, trigger on create/update/delete, projection `{_type}` and the
 * same secret as SANITY_REVALIDATE_SECRET. Without the secret the route
 * refuses everything, so it can never be called anonymously.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'SANITY_REVALIDATE_SECRET is not set.' }, { status: 500 });
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }

    // 'max' = stale-while-revalidate: the next visitor gets the old page at
    // once while the fresh one is built, so nobody waits on Sanity.
    revalidateTag(SANITY_TAG, 'max');
    return NextResponse.json({ revalidated: SANITY_TAG, type: body?._type ?? null });
  } catch (error) {
    console.error(`Revalidate webhook failed: ${error instanceof Error ? error.message : error}`);
    return NextResponse.json({ message: 'Could not process the webhook.' }, { status: 400 });
  }
}
