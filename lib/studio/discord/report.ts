/**
 * Reporting results back into Discord.
 *
 * Preferred route is editing the original ephemeral reply, so the status appears exactly
 * where the user tapped Publish. Interaction tokens expire after 15 minutes, though, and
 * a large YouTube upload can outlive that — so a long job falls back to a normal message
 * in the source channel rather than silently reporting nothing.
 */
import { studioClient } from '../supabase';
import type { StudioDistribution } from '../types';
import { discordRequest } from '../adapters/discord';

const ICON: Record<string, string> = {
  succeeded: '✅',
  failed: '❌',
  pending: '⏳',
  processing: '⏳',
  skipped: '⏭️',
  cancelled: '🚫',
};

const LABEL: Record<string, string> = {
  blog: 'Website',
  discord: 'Discord',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

export function formatReport(rows: StudioDistribution[]): string {
  const lines = rows
    .slice()
    .sort((a, b) => a.channel.localeCompare(b.channel))
    .map((row) => {
      const icon = ICON[row.status] ?? '•';
      const name = LABEL[row.channel] ?? row.channel;

      if (row.status === 'succeeded') {
        const link = row.remote_url ? ` — <${row.remote_url}>` : '';
        // `error` doubles as the success note field, e.g. YouTube's forced-private warning.
        const note = row.error ? `\n   ↳ ${row.error}` : '';
        return `${icon} **${name}**${link}${note}`;
      }

      if (row.status === 'failed') {
        return `${icon} **${name}** — ${row.error ?? 'failed'}`;
      }

      const attempt = row.attempts > 0 ? ` (attempt ${row.attempts}/${row.max_attempts})` : '';
      return `${icon} **${name}** — in progress${attempt}`;
    });

  const done = rows.filter((r) => r.status === 'succeeded').length;
  const header = `**Published to ${done}/${rows.length}**`;
  return [header, ...lines].join('\n');
}

export async function reportToDiscord(draftId: string, rows: StudioDistribution[]): Promise<void> {
  if (!rows.length) return;

  const supabase = studioClient();
  const { data: draft } = await supabase
    .from('drafts')
    .select('interaction_token, interaction_expires_at, discord_channel_id')
    .eq('id', draftId)
    .single();

  if (!draft) return;

  const content = formatReport(rows);
  const appId = process.env.DISCORD_APPLICATION_ID;
  const tokenLive =
    draft.interaction_token &&
    draft.interaction_expires_at &&
    new Date(draft.interaction_expires_at) > new Date();

  if (appId && tokenLive) {
    try {
      const res = await fetch(
        `https://discord.com/api/v10/webhooks/${appId}/${draft.interaction_token}/messages/@original`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, components: [] }),
        }
      );
      if (res.ok) return;
      console.warn('[studio:report] interaction edit failed', res.status, await res.text());
    } catch (err) {
      console.warn('[studio:report] interaction edit threw', err);
    }
  }

  // Fallback: a plain message where the draft came from.
  if (!draft.discord_channel_id) return;
  try {
    await discordRequest(`/channels/${draft.discord_channel_id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
  } catch (err) {
    console.warn('[studio:report] channel fallback failed', err);
  }
}
