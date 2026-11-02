/**
 * Liveness check for uptime monitors and load balancers: 200 while the server
 * answers. Deliberately touches nothing else (no Sanity, no mail), so a CMS
 * outage doesn't get the container restarted.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
