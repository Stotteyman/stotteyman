/**
 * Media ingest.
 *
 * Everything that gets distributed is first copied into Supabase Storage. Two reasons,
 * both hard requirements rather than tidiness:
 *
 *  1. Discord attachment URLs are signed and expire (~24h). A scheduled post referencing
 *     one would 404 by the time it ran.
 *  2. Meta, TikTok and (for remote fetch) most platforms pull media server-side from a
 *     public HTTPS URL. They will not accept uploaded bytes from us on those endpoints.
 */
import { MEDIA_BUCKET, publicMediaUrl, storageClient, studioClient } from './supabase';
import type { StudioMedia } from './types';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

/** Netlify's function memory is the real ceiling; refuse politely rather than OOM. */
const MAX_BYTES = 512 * 1024 * 1024;

export type IngestSource = {
  url: string;
  filename?: string | null;
  contentType?: string | null;
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
};

function extensionFor(mime: string, filename?: string | null): string {
  const fromName = filename?.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName) return fromName;
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
  };
  return map[mime] ?? 'bin';
}

function classify(mime: string): 'image' | 'video' | null {
  if (IMAGE_TYPES.has(mime)) return 'image';
  if (VIDEO_TYPES.has(mime)) return 'video';
  return null;
}

/**
 * Downloads one source and stores it under `<draftId>/<index>-<name>`.
 *
 * Returns the created row. Throws with a user-facing message — ingest failures are shown
 * back in Discord, so they must read like sentences, not stack traces.
 */
export async function ingestOne(
  draftId: string,
  source: IngestSource,
  sortOrder: number
): Promise<StudioMedia> {
  const res = await fetch(source.url);
  if (!res.ok) {
    throw new Error(`Could not download media (${res.status}). Discord links expire — try again.`);
  }

  const mime = (source.contentType ?? res.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();

  const kind = classify(mime);
  if (!kind) {
    throw new Error(
      `Unsupported file type "${mime || 'unknown'}". Images: jpg/png/webp/gif. Video: mp4/mov/webm.`
    );
  }

  const declared = Number(res.headers.get('content-length') ?? source.bytes ?? 0);
  if (declared > MAX_BYTES) {
    throw new Error(`That file is ${(declared / 1024 / 1024).toFixed(0)} MB; the limit is 512 MB.`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`That file is too large (${(buffer.byteLength / 1024 / 1024).toFixed(0)} MB).`);
  }

  const safeName = (source.filename ?? 'media')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(-60);
  const path = `${draftId}/${String(sortOrder).padStart(2, '0')}-${safeName}`.replace(
    /(\.[a-z0-9]+)?$/i,
    (ext) => ext || `.${extensionFor(mime, source.filename)}`
  );

  const storage = storageClient();
  const { error: uploadError } = await storage.storage.from(MEDIA_BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: true,
  });
  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const supabase = studioClient();
  const { data, error } = await supabase
    .from('draft_media')
    .insert({
      draft_id: draftId,
      kind,
      storage_path: path,
      public_url: publicMediaUrl(path),
      mime,
      bytes: buffer.byteLength,
      width: source.width ?? null,
      height: source.height ?? null,
      duration_seconds: source.durationSeconds ?? null,
      source_url: source.url.split('?')[0],
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) throw new Error(`Could not record media: ${error.message}`);
  return data as StudioMedia;
}

/**
 * Ingests every source, keeping going when one fails.
 *
 * A single bad attachment should not cost the user the other three — they get the
 * successes plus a note about what dropped out.
 */
export async function ingestAll(
  draftId: string,
  sources: IngestSource[]
): Promise<{ media: StudioMedia[]; errors: string[] }> {
  const media: StudioMedia[] = [];
  const errors: string[] = [];

  for (const [index, source] of sources.entries()) {
    try {
      media.push(await ingestOne(draftId, source, index));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return { media, errors };
}
