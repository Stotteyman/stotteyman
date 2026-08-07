import 'server-only';

import crypto from 'node:crypto';

import { createSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * Server-side model for the stream overlays, TTS access control and donations.
 *
 * The overlay pages are unauthenticated browser sources: OBS and Moblin load a URL
 * and cannot send an Authorization header or hold a session. So they authenticate
 * with the random `overlay_key`, and every table stays operator-only behind RLS —
 * the overlay never talks to PostgREST directly, only to these routes.
 */

export type StreamSettings = {
  overlay_key: string;
  chat_enabled: boolean;
  chat_max_messages: number;
  chat_fade_seconds: number;
  chat_font_scale: number;
  chat_show_platform: boolean;
  chat_hide_commands: boolean;
  chat_blocked_users: string[];
  tts_enabled: boolean;
  tts_mode: 'everyone' | 'subscribers' | 'allowlist';
  tts_voice: string;
  tts_rate: number;
  tts_volume: number;
  tts_read_name: boolean;
  tts_min_chars: number;
  tts_max_chars: number;
  tts_cooldown_seconds: number;
  tts_skip_links: boolean;
  tts_blocked_words: string[];
  alerts_enabled: boolean;
  alerts_min_cents: number;
  alerts_duration_ms: number;
  alerts_sound_url: string | null;
  alerts_read_message: boolean;
  songs_enabled: boolean;
  songs_min_cents: number;
  songs_max_duration_seconds: number;
  songs_auto_approve: boolean;
  updated_at: string;
};

export type ChatSource = {
  id: string;
  platform: 'kick' | 'twitch' | 'youtube';
  enabled: boolean;
  channel: string;
  external_id: string | null;
  accent: string | null;
  sort_order: number;
};

export async function getStreamSettings(): Promise<StreamSettings> {
  const admin = createSupabaseServiceClient();
  const { data, error } = await admin.from('stream_settings').select('*').eq('id', true).single();
  if (error || !data) throw new Error(`stream_settings unavailable: ${error?.message ?? 'no row'}`);
  return data as StreamSettings;
}

export async function getChatSources(): Promise<ChatSource[]> {
  const admin = createSupabaseServiceClient();
  const { data } = await admin.from('stream_chat_sources').select('*').order('sort_order');
  return (data ?? []) as ChatSource[];
}

/**
 * Constant-time comparison of the overlay key.
 *
 * `===` on a secret leaks its length and prefix through timing. The cost of doing
 * this properly is one function call.
 */
export function overlayKeyMatches(supplied: string | null, actual: string): boolean {
  if (!supplied) return false;
  const a = Buffer.from(supplied);
  const b = Buffer.from(actual);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export class OverlayAuthError extends Error {}

/** Loads settings and throws unless `?key=` matches. Every overlay route starts here. */
export async function requireOverlayKey(request: Request): Promise<StreamSettings> {
  const settings = await getStreamSettings();
  const key = new URL(request.url).searchParams.get('key');
  if (!overlayKeyMatches(key, settings.overlay_key)) {
    throw new OverlayAuthError('Bad or missing overlay key');
  }
  return settings;
}

// ── TTS access control ───────────────────────────────────────────────────────

export type ChatAuthor = {
  platform: 'kick' | 'twitch' | 'youtube';
  username: string;
  badges: string[];
};

/** Badges that count as "subscriber or above" on each platform. */
const PRIVILEGED_BADGES = new Set([
  'subscriber',
  'sub_gifter',
  'founder',
  'moderator',
  'broadcaster',
  'owner',
  'vip',
  'staff',
  'member',
  'verified',
]);

export type TtsDecision = { allowed: true } | { allowed: false; reason: string };

/**
 * Decides whether one message may be spoken.
 *
 * Deliberately evaluated on the SERVER even though the overlay could do it: the
 * synthesis endpoint costs a network round trip per message, and a rule enforced
 * only in a page anyone can open with the URL is not a rule. `deny` always beats
 * everything else, so a blocked account stays silent even in `everyone` mode.
 */
export function decideTts(
  settings: StreamSettings,
  author: ChatAuthor,
  text: string,
  accounts: { platform: string; username_lower: string; access: 'allow' | 'deny' }[]
): TtsDecision {
  if (!settings.tts_enabled) return { allowed: false, reason: 'TTS is off' };

  const name = author.username.toLowerCase();
  const matching = accounts.filter(
    (a) => a.username_lower === name && (a.platform === 'any' || a.platform === author.platform)
  );

  // Deny first, unconditionally — before mode, before badges, before anything.
  if (matching.some((a) => a.access === 'deny')) {
    return { allowed: false, reason: 'account denied' };
  }
  const explicitlyAllowed = matching.some((a) => a.access === 'allow');

  if (settings.tts_mode === 'allowlist' && !explicitlyAllowed) {
    return { allowed: false, reason: 'not on the allowlist' };
  }
  if (settings.tts_mode === 'subscribers' && !explicitlyAllowed) {
    const privileged = author.badges.some((b) => PRIVILEGED_BADGES.has(b.toLowerCase()));
    if (!privileged) return { allowed: false, reason: 'not a subscriber' };
  }

  const trimmed = text.trim();
  if (trimmed.length < settings.tts_min_chars) return { allowed: false, reason: 'too short' };
  if (settings.chat_hide_commands && trimmed.startsWith('!')) {
    return { allowed: false, reason: 'command' };
  }
  if (settings.tts_skip_links && /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|gg|tv|io)\b/i.test(trimmed)) {
    return { allowed: false, reason: 'contains a link' };
  }

  const lower = trimmed.toLowerCase();
  if (settings.tts_blocked_words.some((w) => w && lower.includes(w.toLowerCase()))) {
    return { allowed: false, reason: 'blocked word' };
  }

  return { allowed: true };
}

export async function getTtsAccounts() {
  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from('stream_tts_accounts')
    .select('id, platform, username, username_lower, access, note, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []) as {
    id: string;
    platform: string;
    username: string;
    username_lower: string;
    access: 'allow' | 'deny';
    note: string | null;
    created_at: string;
  }[];
}

/**
 * Strips the parts of a message that should never be read aloud, and prefixes the
 * speaker's name when configured.
 */
export function buildSpokenText(settings: StreamSettings, author: string, text: string): string {
  let spoken = text
    .replace(/https?:\/\/\S+/gi, ' link ')
    // Collapse emote spam: "LUL LUL LUL LUL" reads as a stutter otherwise.
    .replace(/(\b\w+\b)(\s+\1){2,}/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, settings.tts_max_chars);

  if (settings.tts_read_name) spoken = `${author} says ${spoken}`;
  return spoken;
}
