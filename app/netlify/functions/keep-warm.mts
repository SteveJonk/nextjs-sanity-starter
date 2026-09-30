/**
 * Pings the site every 10 minutes so the Next.js server function stays warm
 * and the first visitor after a quiet spell does not wait for a cold start.
 *
 * The throwaway query string gives each ping its own CDN cache key, so the
 * request reaches the Next.js function instead of being answered from the edge.
 * Scheduled functions only run on the published production deploy. Only used
 * when the site is hosted on Netlify; other hosts ignore this folder.
 */
const keepWarm = async () => {
  const origin = process.env.URL;
  if (!origin) return;

  const started = Date.now();
  const response = await fetch(`${origin}/?warm=${started}`, {
    headers: { 'user-agent': 'netlify-keep-warm' },
  });
  console.log(`keep-warm ${response.status} in ${Date.now() - started}ms`);
};

export default keepWarm;

export const config = { schedule: '*/10 * * * *' };
