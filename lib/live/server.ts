import 'server-only';

import { createHash, randomBytes } from 'crypto';

import { createSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * Live streaming server helpers.
 *
 * Viewers arriving on an invite link have NO Supabase auth session, so RLS has
 * nothing to key off for them. Every viewer-facing operation therefore runs
 * server-side with the service client, and this module is the only place that
 * decides whether a given visitor is allowed to watch.
 */

export type Privacy = 'public' | 'unlisted' | 'invite_only' | 'off';

export type LiveSettings = {
  privacy: Privacy;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  show_on_site: boolean;
  chat_enabled: boolean;
  is_live: boolean;
  went_live_at: string | null;
};

/** Tokens are only ever stored hashed, so a database leak does not hand out playback. */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** URL-safe, 256 bits of entropy. Long enough that guessing is not a threat model. */
export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * IPs are recorded for abuse handling but never stored raw — a viewer list
 * should not double as a log of people's home addresses. Salted with the
 * service key so the hashes are not reversible via a rainbow table of the
 * IPv4 space, which is small enough to enumerate outright.
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.SUPABASE_SERVICE_KEY ?? 'stotteyman';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export async function getLiveSettings(): Promise<LiveSettings | null> {
  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from('live_settings')
    .select(
      'privacy, title, description, category, thumbnail_url, show_on_site, chat_enabled, is_live, went_live_at'
    )
    .eq('id', true)
    .maybeSingle();
  return (data as LiveSettings) ?? null;
}

export type SessionResult =
  | { ok: true; playbackToken: string; sessionId: string; displayName: string }
  | { ok: false; reason: 'stream_off' | 'invite_required' | 'invite_invalid' | 'invite_expired' | 'invite_exhausted' };

/**
 * Turns a visitor into a playback-authorised viewer session.
 *
 * `inviteToken` is the raw secret from the share link. It is checked, counted
 * against its use cap, and then discarded — the session gets its own token so
 * one viewer can be revoked without invalidating the link for everyone else.
 */
export async function createViewerSession(opts: {
  inviteToken?: string | null;
  userId?: string | null;
  displayName?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<SessionResult> {
  const admin = createSupabaseServiceClient();

  const settings = await getLiveSettings();
  if (!settings || settings.privacy === 'off') return { ok: false, reason: 'stream_off' };

  let inviteId: string | null = null;

  if (settings.privacy === 'invite_only') {
    // A signed-in member with live.manage does not need an invite; everyone else does.
    if (!opts.inviteToken && !opts.userId) return { ok: false, reason: 'invite_required' };

    if (opts.inviteToken) {
      const { data: invite } = await admin
        .from('live_invites')
        .select('id, max_uses, use_count, expires_at, revoked_at')
        .eq('token_hash', hashToken(opts.inviteToken))
        .maybeSingle();

      if (!invite || invite.revoked_at) return { ok: false, reason: 'invite_invalid' };
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return { ok: false, reason: 'invite_expired' };
      }
      if (invite.max_uses !== null && invite.use_count >= invite.max_uses) {
        return { ok: false, reason: 'invite_exhausted' };
      }

      inviteId = invite.id;
      await admin
        .from('live_invites')
        .update({ use_count: invite.use_count + 1 })
        .eq('id', invite.id);
    }
  }

  const playbackToken = generateToken();
  const displayName = (opts.displayName ?? '').trim().slice(0, 32) || 'guest';

  const { data: session, error } = await admin
    .from('live_viewer_sessions')
    .insert({
      invite_id: inviteId,
      user_id: opts.userId ?? null,
      display_name: displayName,
      ip_hash: hashIp(opts.ip ?? null),
      user_agent: (opts.userAgent ?? '').slice(0, 300),
      playback_token_hash: hashToken(playbackToken),
    })
    .select('id')
    .single();

  if (error || !session) return { ok: false, reason: 'invite_invalid' };

  return { ok: true, playbackToken, sessionId: session.id, displayName };
}

/**
 * The decision the MediaMTX auth hook asks for on every connection attempt.
 * Delegated to a SECURITY DEFINER function so the whole check is one round
 * trip — this runs per viewer, per reconnect.
 */
export async function authorizePlayback(
  playbackToken: string | null,
  ip: string | null
): Promise<{ allow: boolean; reason: string; session_id?: string }> {
  const admin = createSupabaseServiceClient();
  const { data, error } = await admin.rpc('authorize_playback', {
    p_token_hash: playbackToken ? hashToken(playbackToken) : null,
    p_ip: ip,
  });
  if (error) return { allow: false, reason: 'error' };
  return data as { allow: boolean; reason: string; session_id?: string };
}

/** First hop in x-forwarded-for is the client; the rest are proxies we control. */
export function clientIp(headers: Headers): string | null {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return headers.get('x-nf-client-connection-ip') ?? null;
}
