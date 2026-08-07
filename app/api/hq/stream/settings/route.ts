import crypto from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

import { audit, HqAuthError, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error('[hq/stream/settings]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

/** Fields the panel may write, with their coercion. Anything absent is ignored. */
const BOOLEANS = [
  'chat_enabled',
  'chat_show_platform',
  'chat_hide_commands',
  'tts_enabled',
  'tts_read_name',
  'tts_skip_links',
  'alerts_enabled',
  'alerts_read_message',
  'songs_enabled',
  'songs_auto_approve',
] as const;

const INTEGERS = [
  'chat_max_messages',
  'chat_fade_seconds',
  'tts_min_chars',
  'tts_max_chars',
  'tts_cooldown_seconds',
  'alerts_min_cents',
  'alerts_duration_ms',
  'songs_min_cents',
  'songs_max_duration_seconds',
] as const;

const NUMERICS = ['chat_font_scale', 'tts_rate', 'tts_volume'] as const;
const TEXTS = ['tts_voice', 'alerts_sound_url'] as const;
const ARRAYS = ['chat_blocked_users', 'tts_blocked_words'] as const;

const TTS_MODES = ['everyone', 'subscribers', 'allowlist'];

export async function GET() {
  try {
    await requirePermission('stream.manage');
    const admin = createSupabaseServiceClient();

    const [{ data: settings }, { data: sources }] = await Promise.all([
      admin.from('stream_settings').select('*').eq('id', true).maybeSingle(),
      admin.from('stream_chat_sources').select('*').order('sort_order'),
    ]);

    return NextResponse.json({ settings: settings ?? null, sources: sources ?? [] });
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.manage');
    const body = (await request.json()) as Record<string, unknown>;

    const patch: Record<string, unknown> = { updated_by: actor.userId, updated_at: new Date().toISOString() };

    for (const key of BOOLEANS) if (key in body) patch[key] = Boolean(body[key]);
    for (const key of INTEGERS) {
      if (key in body) {
        const n = Number(body[key]);
        if (!Number.isFinite(n)) {
          return NextResponse.json({ error: `${key} must be a number.` }, { status: 400 });
        }
        patch[key] = Math.round(n);
      }
    }
    for (const key of NUMERICS) {
      if (key in body) {
        const n = Number(body[key]);
        if (!Number.isFinite(n)) {
          return NextResponse.json({ error: `${key} must be a number.` }, { status: 400 });
        }
        patch[key] = n;
      }
    }
    for (const key of TEXTS) {
      if (key in body) {
        const v = body[key];
        patch[key] = v === null || v === '' ? null : String(v).slice(0, 500);
      }
    }
    for (const key of ARRAYS) {
      if (key in body) {
        const raw = body[key];
        const list = Array.isArray(raw)
          ? raw
          : String(raw ?? '')
              .split(/[,\n]/)
              .map((s) => s.trim());
        patch[key] = list.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 200);
      }
    }
    if ('tts_mode' in body) {
      const mode = String(body.tts_mode);
      if (!TTS_MODES.includes(mode)) {
        return NextResponse.json({ error: `Unknown TTS mode: ${mode}` }, { status: 400 });
      }
      patch.tts_mode = mode;
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('stream_settings')
      .update(patch)
      .eq('id', true)
      .select('*')
      .single();
    if (error) throw error;

    await audit(actor.userId, 'stream.settings.updated', 'stream_settings', undefined, patch);
    return NextResponse.json({ settings: data });
  } catch (e) {
    return fail(e);
  }
}

/**
 * Rotates the overlay key.
 *
 * This is the ONLY revocation mechanism a URL-authenticated browser source has, so
 * it is deliberately a one-click action — but it invalidates every overlay
 * instantly, including the ones currently on stream. The panel warns before calling.
 */
export async function POST() {
  try {
    const actor = await requirePermission('stream.manage');
    const admin = createSupabaseServiceClient();

    const overlayKey = crypto.randomBytes(24).toString('hex');
    const { data, error } = await admin
      .from('stream_settings')
      .update({ overlay_key: overlayKey, updated_by: actor.userId, updated_at: new Date().toISOString() })
      .eq('id', true)
      .select('overlay_key')
      .single();
    if (error) throw error;

    await audit(actor.userId, 'stream.overlay_key.rotated', 'stream_settings');
    return NextResponse.json({ overlayKey: data.overlay_key });
  } catch (e) {
    return fail(e);
  }
}
