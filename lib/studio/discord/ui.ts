/**
 * The Discord composer UI.
 *
 * Channel selection is held in the message's own buttons — a green button is selected,
 * grey is not — rather than in a session store. The interaction payload always carries
 * the current components, so the state travels with the message and survives cold
 * starts, redeploys, and concurrent editors with no server-side state at all.
 */
import { channelStatuses, suitsDraft, type ChannelStatus } from '../adapters';
import type { Channel, StudioMedia } from '../types';

export const CUSTOM_ID = {
  toggle: (draftId: string, channel: Channel) => `studio:tgl:${draftId}:${channel}`,
  send: (draftId: string) => `studio:send:${draftId}`,
  cancel: (draftId: string) => `studio:cancel:${draftId}`,
} as const;

export const BUTTON_STYLE = { primary: 1, secondary: 2, success: 3, danger: 4 } as const;

export const MESSAGE_FLAGS = { ephemeral: 64 } as const;

export type DiscordComponent = {
  type: number;
  style?: number;
  label?: string;
  custom_id?: string;
  disabled?: boolean;
  emoji?: { name: string };
  components?: DiscordComponent[];
};

const CHANNEL_EMOJI: Record<string, string> = {
  blog: '🌐',
  discord: '💬',
  instagram: '📸',
  facebook: '📘',
  youtube: '▶️',
};

/** Reads the selected set back out of an existing message's components. */
export function selectedFromComponents(components: DiscordComponent[] | undefined): Channel[] {
  const selected: Channel[] = [];
  for (const row of components ?? []) {
    for (const button of row.components ?? []) {
      const id = button.custom_id ?? '';
      if (!id.startsWith('studio:tgl:')) continue;
      if (button.style === BUTTON_STYLE.success) {
        selected.push(id.split(':')[3] as Channel);
      }
    }
  }
  return selected;
}

function mediaCounts(media: StudioMedia[]) {
  return {
    images: media.filter((m) => m.kind === 'image').length,
    videos: media.filter((m) => m.kind === 'video').length,
  };
}

/**
 * Default selection for a fresh draft: every configured channel that suits the media.
 *
 * Opting out is one tap; remembering to opt in is a post that silently never happened.
 */
export function defaultSelection(media: StudioMedia[], statuses: ChannelStatus[]): Channel[] {
  const counts = mediaCounts(media);
  return statuses
    .filter((s) => s.ready && suitsDraft(s, counts))
    .filter((s) => s.channel !== 'youtube' || counts.videos > 0)
    .map((s) => s.channel);
}

export function buildComposer(
  draftId: string,
  media: StudioMedia[],
  selected: Channel[],
  statuses: ChannelStatus[] = channelStatuses()
): DiscordComponent[] {
  const counts = mediaCounts(media);

  const channelButtons: DiscordComponent[] = statuses.map((status) => {
    const usable = status.ready && suitsDraft(status, counts);
    const on = selected.includes(status.channel);
    return {
      type: 2,
      style: on ? BUTTON_STYLE.success : BUTTON_STYLE.secondary,
      label: status.label,
      emoji: { name: CHANNEL_EMOJI[status.channel] ?? '•' },
      custom_id: CUSTOM_ID.toggle(draftId, status.channel),
      disabled: !usable,
    };
  });

  const rows: DiscordComponent[] = [];
  for (let i = 0; i < channelButtons.length; i += 5) {
    rows.push({ type: 1, components: channelButtons.slice(i, i + 5) });
  }

  rows.push({
    type: 1,
    components: [
      {
        type: 2,
        style: BUTTON_STYLE.primary,
        label: selected.length ? `Publish to ${selected.length}` : 'Publish',
        emoji: { name: '🚀' },
        custom_id: CUSTOM_ID.send(draftId),
        disabled: selected.length === 0,
      },
      {
        type: 2,
        style: BUTTON_STYLE.danger,
        label: 'Cancel',
        custom_id: CUSTOM_ID.cancel(draftId),
      },
    ],
  });

  return rows;
}

/** The summary line above the buttons. */
export function composerSummary(
  media: StudioMedia[],
  body: string,
  statuses: ChannelStatus[],
  ingestErrors: string[] = []
): string {
  const counts = mediaCounts(media);
  const bits: string[] = [];

  const preview = body.trim().split('\n')[0]?.slice(0, 120);
  bits.push(preview ? `**${preview}**` : '_No caption_');

  const parts: string[] = [];
  if (counts.images) parts.push(`${counts.images} image${counts.images > 1 ? 's' : ''}`);
  if (counts.videos) parts.push(`${counts.videos} video${counts.videos > 1 ? 's' : ''}`);
  bits.push(parts.length ? `📎 ${parts.join(' · ')}` : '📎 No media');

  const blocked = statuses.filter((s) => !s.ready);
  if (blocked.length) {
    bits.push(`⚙️ Not configured: ${blocked.map((s) => s.label).join(', ')}`);
  }

  if (ingestErrors.length) {
    bits.push(`⚠️ ${ingestErrors.join('\n⚠️ ')}`);
  }

  bits.push('_Pick channels, then Publish._');
  return bits.join('\n');
}
