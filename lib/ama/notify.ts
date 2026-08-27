import 'server-only';

/**
 * "A question just came in" alerts.
 *
 * The requirement was a phone buzz that costs nothing and is reliable. SMS is neither:
 * every route to a real US number goes through a metered carrier gateway, and the free
 * carrier email-to-SMS addresses need a working SMTP sender, need the carrier known in
 * advance, and are being switched off one network at a time. Discord is free forever
 * and its mobile app pushes a mention like a text message, which is the same outcome.
 *
 * Two Discord transports, in preference order:
 *
 *  1. **Webhook** (`AMA_DISCORD_WEBHOOK_URL`) — the narrow credential. A webhook URL can
 *     only post to the one channel it was made for, so a leak costs nothing else.
 *     Preferred whenever it exists.
 *  2. **Bot token** (`AMA_DISCORD_BOT_TOKEN` + `AMA_DISCORD_CHANNEL_ID`) — used because
 *     the Stotteyman bot holds MANAGE_CHANNELS but *not* MANAGE_WEBHOOKS, so it can
 *     create the channel and post in it but cannot mint a webhook for it. Tick "Manage
 *     Webhooks" on the bot's role and the webhook path takes over on its own.
 *
 * `AMA_DISCORD_MENTION_ID` is what makes it an actual ping rather than a message in a
 * channel nobody opens. `allowed_mentions` is set explicitly so exactly that one user
 * is pinged and nothing in a question's text can ever trigger an @everyone.
 *
 * Nothing here throws. A failed notification must never roll back a payment that has
 * already happened, so failures are logged and surface as an un-notified row in HQ.
 */

const TIMEOUT_MS = 8000;
// Discord sits behind Cloudflare, which answers a missing User-Agent with a bodyless
// 403 that reads exactly like a permissions error.
const UA = 'DiscordBot (https://stotteyman.com, 1.0)';

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

/** The message body, shared by both Discord transports. */
function discordMessage(p: NotifyPayload) {
  const mention = process.env.AMA_DISCORD_MENTION_ID;
  const price = `$${(p.amountCents / 100).toFixed(2)}`;

  return {
    content: mention
      ? `<@${mention}> new ${price} question — the clock is running.`
      : `New ${price} question — the clock is running.`,
    // Ping only the one configured user. Without this, a question containing "@everyone"
    // would ping the whole guild, since the text is written by a stranger.
    allowed_mentions: mention ? { parse: [], users: [mention] } : { parse: [] },
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
          { name: 'Paid', value: price, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Answer in HQ → /hq/ama' },
      },
    ],
  };
}

async function postJson(url: string, body: unknown, authHeader?: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': UA,
  };
  if (authHeader) headers.Authorization = authHeader;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

/** Fires whichever Discord transport is configured. Never throws. */
export async function notifyNewQuestion(p: NotifyPayload): Promise<NotifyResult> {
  const jobs: { name: string; run: () => Promise<void> }[] = [];

  const webhook = process.env.AMA_DISCORD_WEBHOOK_URL;
  const botToken = process.env.AMA_DISCORD_BOT_TOKEN;
  const channelId = process.env.AMA_DISCORD_CHANNEL_ID;

  if (webhook) {
    jobs.push({ name: 'discord-webhook', run: () => postJson(webhook, discordMessage(p)) });
  } else if (botToken && channelId) {
    jobs.push({
      name: 'discord-bot',
      run: () =>
        postJson(
          `https://discord.com/api/v10/channels/${channelId}/messages`,
          discordMessage(p),
          `Bot ${botToken}`
        ),
    });
  }

  // Anything else that accepts a JSON POST — Slack, Make, a phone automation.
  const generic = process.env.AMA_NOTIFY_WEBHOOK_URL;
  if (generic) {
    jobs.push({ name: 'webhook', run: () => postJson(generic, { event: 'ama.paid', ...p }) });
  }

  if (jobs.length === 0) {
    console.warn(
      '[ama/notify] no channel configured — set AMA_DISCORD_WEBHOOK_URL, or ' +
        'AMA_DISCORD_BOT_TOKEN + AMA_DISCORD_CHANNEL_ID. The question is recorded and ' +
        'visible in HQ, but nothing was pushed.'
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

/** True when at least one alert transport is wired up. Surfaced in HQ only. */
export function notifyConfigured(): boolean {
  return Boolean(
    process.env.AMA_DISCORD_WEBHOOK_URL ||
      (process.env.AMA_DISCORD_BOT_TOKEN && process.env.AMA_DISCORD_CHANNEL_ID) ||
      process.env.AMA_NOTIFY_WEBHOOK_URL
  );
}
