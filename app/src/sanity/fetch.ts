/**
 * Every Sanity read that feeds a page carries this one tag. A publish in the
 * studio fires a webhook to `/api/revalidate`, which expires the tag, so the
 * change is live within seconds without a rebuild. One tag instead of one per
 * document type: the queries join navigation, labels and referenced documents,
 * so a per-type tag would miss pages that show the changed content indirectly.
 */
export const SANITY_TAG = 'sanity';

/**
 * Safety net only. If the webhook is misconfigured or a delivery is lost, the
 * cache still refreshes within an hour instead of staying stale.
 */
export const REVALIDATE = 3600;

/** Fetch options shared by every cached Sanity read. */
export const sanityCache = { next: { revalidate: REVALIDATE, tags: [SANITY_TAG] } };
