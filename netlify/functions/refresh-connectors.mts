import type { Config } from '@netlify/functions';

/**
 * Scheduled connector refresh.
 *
 * Calls the app's own refresh endpoint with a shared secret rather than duplicating
 * connector logic here — one implementation, one place to fix.
 */
export default async () => {
  const secret = process.env.CONNECTOR_CRON_SECRET;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL;

  if (!secret || !site) {
    console.error('[refresh-connectors] CONNECTOR_CRON_SECRET or site URL not set; skipping.');
    return new Response('not configured', { status: 500 });
  }

  const res = await fetch(`${site.replace(/\/$/, '')}/api/hq/connectors/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
    body: JSON.stringify({}),
  });

  const text = await res.text();
  console.info('[refresh-connectors]', res.status, text.slice(0, 500));
  return new Response(text, { status: res.status });
};

export const config: Config = {
  // Hourly. The underlying data (deploys, domain expiry, user counts) does not move
  // faster than that, and every run costs four external API calls.
  schedule: '@hourly',
};
