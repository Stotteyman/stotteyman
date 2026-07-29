/**
 * Scheduled Studio queue drain.
 *
 * The safety net rather than the fast path: retries with backoff, posts scheduled for a
 * future time, and anything the on-demand background invocation missed because it was
 * unavailable or died mid-run.
 *
 * Delegates to the background function instead of draining inline, because a scheduled
 * function is subject to the same ten-second ceiling as any synchronous one.
 */
import type { Config } from '@netlify/functions';

export default async () => {
  const secret = process.env.STUDIO_WORKER_SECRET;
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? '').replace(/\/$/, '');

  if (!secret || !site) {
    console.error('[studio-worker] STUDIO_WORKER_SECRET or site URL not set; skipping.');
    return new Response('not configured', { status: 500 });
  }

  const res = await fetch(`${site}/.netlify/functions/studio-worker-background`, {
    method: 'POST',
    headers: { 'x-studio-secret': secret },
    body: '{}',
  });

  console.info('[studio-worker] dispatched', res.status);
  return new Response('ok', { status: 200 });
};

export const config: Config = {
  // Every minute. The queue is usually empty, and an empty drain is a single indexed
  // query against a partial index — cheap enough to run at this cadence.
  schedule: '* * * * *',
};
