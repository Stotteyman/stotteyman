/**
 * Turning a Discord message into a draft.
 *
 * Nothing is downloaded here. Discord's interaction payload already carries each
 * attachment's filename, content type and size, which is everything the composer needs
 * to render — so this stays a single database insert and comfortably inside Discord's
 * three-second response deadline. The bytes are copied into Storage later, by the worker.
 */
import { studioClient } from '../supabase';
import type { StudioDraft, StudioMedia } from '../types';

export type DiscordAttachment = {
  id: string;
  url: string;
  filename?: string;
  content_type?: string;
  size?: number;
  width?: number;
  height?: number;
  duration_secs?: number;
};

export type PendingMedia = {
  url: string;
  filename: string | null;
  content_type: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
};

export function toPendingMedia(attachments: DiscordAttachment[]): PendingMedia[] {
  return attachments.map((a) => ({
    url: a.url,
    filename: a.filename ?? null,
    content_type: a.content_type ?? null,
    bytes: a.size ?? null,
    width: a.width ?? null,
    height: a.height ?? null,
    duration_seconds: a.duration_secs ?? null,
  }));
}

/**
 * Media shape for the composer, derived from the pending metadata.
 *
 * These are not `draft_media` rows — they do not exist in Storage yet. They carry just
 * enough (kind, size) for the UI to decide which channel buttons make sense.
 */
export function previewMedia(pending: PendingMedia[], draftId: string): StudioMedia[] {
  return pending.map((p, index) => ({
    id: `pending-${index}`,
    draft_id: draftId,
    kind: (p.content_type ?? '').startsWith('video/') ? 'video' : 'image',
    storage_path: '',
    public_url: p.url,
    mime: p.content_type,
    bytes: p.bytes,
    width: p.width,
    height: p.height,
    duration_seconds: p.duration_seconds,
    sort_order: index,
  }));
}

const SUPPORTED = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm))$/;

export function unsupportedAttachments(pending: PendingMedia[]): string[] {
  return pending
    .filter((p) => !SUPPORTED.test(p.content_type ?? ''))
    .map((p) => `${p.filename ?? 'file'} (${p.content_type ?? 'unknown type'}) will be skipped.`);
}

export type ComposeInput = {
  guildId: string | null;
  channelId: string | null;
  messageId: string | null;
  authorLabel: string | null;
  body: string;
  attachments: DiscordAttachment[];
  interactionToken?: string | null;
};

/**
 * Creates or refreshes the draft for a Discord message.
 *
 * Re-running Distribute on the same message updates its draft rather than making a
 * second one — the partial unique index on `discord_message_id` enforces that even under
 * a double-tap.
 */
export async function composeDraft(input: ComposeInput): Promise<{
  draft: StudioDraft;
  pending: PendingMedia[];
  warnings: string[];
}> {
  const supabase = studioClient();
  const pending = toPendingMedia(input.attachments);
  const warnings = unsupportedAttachments(pending);
  const usable = pending.filter((p) => SUPPORTED.test(p.content_type ?? ''));

  const row = {
    source: 'discord' as const,
    author_label: input.authorLabel,
    discord_guild_id: input.guildId,
    discord_channel_id: input.channelId,
    discord_message_id: input.messageId,
    body: input.body ?? '',
    pending_media: usable,
    status: 'draft' as const,
    interaction_token: input.interactionToken ?? null,
    interaction_expires_at: input.interactionToken
      ? new Date(Date.now() + 14 * 60 * 1000).toISOString()
      : null,
  };

  const { data, error } = input.messageId
    ? await supabase
        .from('drafts')
        .upsert(row, { onConflict: 'discord_message_id' })
        .select()
        .single()
    : await supabase.from('drafts').insert(row).select().single();

  if (error) throw new Error(`Could not save the draft: ${error.message}`);

  return { draft: data as StudioDraft, pending: usable, warnings };
}

/**
 * Copies any pending media into Storage. Called by the worker immediately before the
 * first channel publishes, so every adapter sees stable public URLs.
 *
 * Idempotent: once `pending_media` is cleared, repeat calls just return what is stored.
 */
export async function ensureMediaIngested(
  draftId: string
): Promise<{ media: StudioMedia[]; errors: string[] }> {
  const supabase = studioClient();
  const { ingestAll } = await import('../media');

  const { data: draft } = await supabase
    .from('drafts')
    .select('id, pending_media')
    .eq('id', draftId)
    .single();

  const pending = (draft?.pending_media ?? []) as PendingMedia[];

  const { data: existing } = await supabase
    .from('draft_media')
    .select('*')
    .eq('draft_id', draftId)
    .order('sort_order');

  if (!pending.length) {
    return { media: (existing ?? []) as StudioMedia[], errors: [] };
  }

  const { media, errors } = await ingestAll(
    draftId,
    pending.map((p) => ({
      url: p.url,
      filename: p.filename,
      contentType: p.content_type,
      bytes: p.bytes,
      width: p.width,
      height: p.height,
      durationSeconds: p.duration_seconds,
    }))
  );

  // Cleared unconditionally: a Discord URL that failed once has expired and will fail
  // identically forever, so retrying it on the next attempt only wastes time.
  await supabase.from('drafts').update({ pending_media: [] }).eq('id', draftId);

  return { media: [...((existing ?? []) as StudioMedia[]), ...media], errors };
}
