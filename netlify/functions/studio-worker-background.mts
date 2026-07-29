/**
 * On-demand Studio queue drain.
 *
 * A *background* function on purpose: Netlify's synchronous limit is ten seconds, while
 * an Instagram video container can take minutes to process and a YouTube upload runs as
 * long as the file needs. Background functions get fifteen.
 *
 * Invoked by the Discord Publish button so a post starts immediately. If background
 * functions are unavailable on the current plan this returns 404 and nothing breaks —
 * `studio-worker` picks the same rows up on its next scheduled tick.
 */
import { drainQueue } from '../../lib/studio/queue';

export default async (request: Request) => {
  const secret = process.env.STUDIO_WORKER_SECRET;
  if (!secret || request.headers.get('x-studio-secret') !== secret) {
    return new Response('forbidden', { status: 403 });
  }

  try {
    // Loops so that a draft whose channels exceed one batch still finishes in this run,
    // rather than waiting a full cron interval per batch.
    const all = [];
    for (let round = 0; round < 6; round += 1) {
      const outcomes = await drainQueue(5);
      all.push(...outcomes);
      if (!outcomes.length) break;
    }

    console.info('[studio-worker-background]', JSON.stringify(all));
    return new Response(JSON.stringify({ processed: all.length, outcomes: all }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[studio-worker-background]', err);
    return new Response(String(err), { status: 500 });
  }
};
