/**
 * Discord adapter — posts to the public announcements channel with the bot token.
 *
 * Media is re-uploaded as real attachments rather than posted as Supabase links, because
 * a bare .mp4 URL renders inconsistently in Discord while a true attachment always plays
 * inline. Files over the guild's upload ceiling fall back to a link, which is the only
 * thing that can work.
 */
import type { ChannelAdapter, PublishContext, PublishResult } from '../types';
import { PublishError } from '../types';

const API = 'https://discord.com/api/v10';

/** Free-tier guild upload ceiling. Staying under it avoids a 40005 on every send. */
const ATTACHMENT_LIMIT_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;

export async function discordRequest(
  path: string,
  init: RequestInit & { botToken?: string } = {}
): Promise<Response> {
  const token = init.botToken ?? process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new PublishError('DISCORD_BOT_TOKEN is not set.', false);

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bot ${token}`);

  const res = await fetch(`${API}${path}`, { ...init, headers });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('retry-after') ?? '5');
    throw new PublishError(`Discord rate limited; retry in ${retryAfter}s.`, true);
  }
  return res;
}

export const discordAdapter: ChannelAdapter = {
  channel: 'discord',
  label: 'Discord',
  acceptsVideo: true,
  acceptsImages: true,
  acceptsTextOnly: true,

  preflight() {
    if (!process.env.DISCORD_BOT_TOKEN) return 'DISCORD_BOT_TOKEN is not set.';
    if (!process.env.DISCORD_ANNOUNCE_CHANNEL_ID) {
      return 'DISCORD_ANNOUNCE_CHANNEL_ID is not set — nowhere to post.';
    }
    return null;
  },

  validate(ctx) {
    if (!ctx.caption.trim() && !ctx.media.length) return 'Nothing to post.';
    if (ctx.caption.length > 2000) return 'Discord messages cap at 2000 characters.';
    return null;
  },

  async publish(ctx: PublishContext): Promise<PublishResult> {
    const channelId =
      (ctx.options.channelId as string | undefined) ?? process.env.DISCORD_ANNOUNCE_CHANNEL_ID!;

    const attachable = ctx.media
      .filter((m) => (m.bytes ?? 0) <= ATTACHMENT_LIMIT_BYTES)
      .slice(0, MAX_ATTACHMENTS);
    const linkOnly = ctx.media.filter((m) => !attachable.some((a) => a.id === m.id));

    let content = ctx.caption.trim();
    if (linkOnly.length) {
      content = `${content}\n${linkOnly.map((m) => m.public_url).join('\n')}`.trim();
    }
    if (content.length > 2000) content = `${content.slice(0, 1997)}…`;

    const form = new FormData();
    form.append(
      'payload_json',
      JSON.stringify({
        content,
        allowed_mentions: { parse: ['users', 'roles'] },
      })
    );

    for (const [index, item] of attachable.entries()) {
      const res = await fetch(item.public_url);
      if (!res.ok) {
        throw new PublishError(`Could not re-read media from storage (${res.status}).`, true);
      }
      const blob = await res.blob();
      const name = item.storage_path.split('/').pop() ?? `media-${index}`;
      form.append(`files[${index}]`, blob, name);
    }

    const res = await discordRequest(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      // 4xx other than rate limiting means the payload or permissions are wrong; the same
      // request will fail identically next time.
      throw new PublishError(
        `Discord rejected the post (${res.status}): ${text.slice(0, 300)}`,
        res.status >= 500
      );
    }

    const message = (await res.json()) as { id: string; channel_id: string };
    const guildId = process.env.DISCORD_GUILD_ID ?? ctx.draft.discord_guild_id ?? '@me';

    ctx.log('posted to discord', { messageId: message.id });

    return {
      remoteId: message.id,
      remoteUrl: `https://discord.com/channels/${guildId}/${message.channel_id}/${message.id}`,
    };
  },
};
