import 'server-only';

/**
 * "A question just came in" alerts.
 *
 * The requirement was a phone buzz that costs nothing and is reliable. SMS is neither:
 * every route to a real US number goes through a paid carrier gateway (Twilio and
 * friends), and the free carrier email-to-SMS addresses need a working SMTP sender,
 * need the carrier to be known in advance, and are being switched off one network at a
 * time. So the two channels here are the ones that genuinely are free *and* land as a
 * push notification on a phone:
 *
 *  1. **Discord webhook** — posts into a private channel. Free forever, no account
 *     beyond the one that already exists, and the Discord mobile app pushes it.
 *  2. **ntfy.sh topic** — free, no signup, no key. Install ntfy, subscribe to the
 *     topic, and it behaves exactly like a text message.
 *
 * Both are configured by env and both are optional; a third generic webhook is there
 * for anything else (Slack, Make, a phone automation). Nothing here is allowed to
 * throw — a failed notification must never roll back a payment that already happened,
 * so failures are logged and surfaced as an un-notified row in the HQ queue instead.
 */

const TIMEOUT_MS = 8000;
const UA = 'stotteyman.com AMA notifier (+https://stotteyman.com)';

export type NotifyPayload = {
  question: string;
  askerName: string | null;
  askerEmail: string | null;
  amountCents: number;
  answerUrl: string;
  hqUrl: string;
};

export type NotifyResult = { delivered: string[]; failed: string[] };

function truncate(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

async function postDiscord(url: string, p: NotifyPayload): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Discord sits behind Cloudflare, which answers a missing User-Agent with a
      // bodyless 403 that reads exactly like a permissions error. Always send one.
      'User-Agent': UA,
    },
    body: JSON.stringify({
      content: '**New paid question** — the clock is running.',
      embeds: [
        {
          title: truncate(p.question, 250),
          url: p.hqUrl,
          color: 0xe8291a,
          description: truncate(p.question, 1800),
          fields: [
            {
              name: 'From',
              value: `${p.askerName || 'Anonymous'}${p.askerEmail ? ` · ${p.askerEmail}` : ''}`,
              inline: true,
            },
            {
              name: 'Paid',
              value: `$${(p.amountCents / 100).toFixed(2)}`,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'Answer in HQ → /hq/ama' },
        },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`discord ${res.status}`);
}

async function postNtfy(topic: string, p: NotifyPayload): Promise<void> {
  const server = (process.env.AMA_NTFY_SERVER ?? 'https://ntfy.sh').replace(/\/$/, '');
  const res = await fetch(`${server}/${encodeURIComponent(topic)}`, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      // ntfy reads its options out of headers, and they must be latin-1 clean —
      // a smart quote in a question title throws before the request is even sent.
      Title: 'New $' + (p.amountCents / 100).toFixed(2) + ' question',
      Priority: 'high',
      Tags: 'question',
      Click: p.hqUrl,
    },
    body: truncate(p.question, 900).replace(/[^\x20-\x7E\n]/g, ''),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`ntfy ${res.status}`);
}

async function postGeneric(url: string, p: NotifyPayload): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ event: 'ama.paid', ...p }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
}

/** Fires every configured channel in parallel. Never throws. */
export async function notifyNewQuestion(p: NotifyPayload): Promise<NotifyResult> {
  const jobs: { name: string; run: () => Promise<void> }[] = [];

  const discord = process.env.AMA_DISCORD_WEBHOOK_URL;
  if (discord) jobs.push({ name: 'discord', run: () => postDiscord(discord, p) });

  const ntfy = process.env.AMA_NTFY_TOPIC;
  if (ntfy) jobs.push({ name: 'ntfy', run: () => postNtfy(ntfy, p) });

  const generic = process.env.AMA_NOTIFY_WEBHOOK_URL;
  if (generic) jobs.push({ name: 'webhook', run: () => postGeneric(generic, p) });

  if (jobs.length === 0) {
    console.warn(
      '[ama/notify] no channel configured — set AMA_DISCORD_WEBHOOK_URL or AMA_NTFY_TOPIC. ' +
        'The question is recorded and visible in HQ, but nothing was pushed.'
    );
    return { delivered: [], failed: [] };
  }

  const settled = await Promise.allSettled(jobs.map((j) => j.run()));
  const delivered: string[] = [];
  const failed: string[] = [];
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      delivered.push(jobs[i].name);
    } else {
      failed.push(jobs[i].name);
      console.error(`[ama/notify] ${jobs[i].name} failed:`, r.reason);
    }
  });

  return { delivered, failed };
}

/** True when at least one push channel is wired up. Surfaced in HQ, never to the public. */
export function notifyConfigured(): boolean {
  return Boolean(
    process.env.AMA_DISCORD_WEBHOOK_URL ||
      process.env.AMA_NTFY_TOPIC ||
      process.env.AMA_NOTIFY_WEBHOOK_URL
  );
}
