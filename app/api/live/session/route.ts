import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { clientIp, createViewerSession, getLiveSettings } from '@/lib/live/server';
import { getHqMember } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const WHEP_BASE = process.env.NEXT_PUBLIC_LIVE_WHEP_URL ?? '';

/**
 * Exchanges an invite link (or an HQ session) for a playback-authorised viewer session.
 *
 * The playback token is returned in the body rather than an httpOnly cookie
 * because the WHEP URL must carry it as a query parameter, which requires the
 * browser to read it. It is held in React state only — never localStorage — so
 * it dies with the tab, and it is revocable server-side regardless.
 */
export async function POST(request: Request) {
  const settings = await getLiveSettings();
  if (!settings) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }
  if (settings.privacy === 'off') {
    return NextResponse.json({ ok: false, reason: 'stream_off' }, { status: 403 });
  }

  let payload: { inviteToken?: string; displayName?: string } = {};
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    // Body is optional for public streams.
  }

  // An HQ member with live access never needs an invite for their own stream.
  const member = await getHqMember().catch(() => null);

  const result = await createViewerSession({
    inviteToken: payload.inviteToken ?? null,
    userId: member?.user_id ?? null,
    displayName: payload.displayName ?? member?.display_name ?? null,
    ip: clientIp(request.headers),
    userAgent: request.headers.get('user-agent'),
  });

  if (!result.ok) {
    const status = result.reason === 'stream_off' ? 403 : 401;
    return NextResponse.json({ ok: false, reason: result.reason }, { status });
  }

  // Session id in an httpOnly cookie so chat posts are attributable without
  // the client being able to forge another viewer's identity.
  const jar = await cookies();
  jar.set('live_session', result.sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  const whepUrl = WHEP_BASE
    ? `${WHEP_BASE.replace(/\/$/, '')}/program/whep?token=${encodeURIComponent(result.playbackToken)}`
    : null;

  return NextResponse.json({
    ok: true,
    whepUrl,
    displayName: result.displayName,
    chatEnabled: settings.chat_enabled,
    title: settings.title,
    isLive: settings.is_live,
  });
}
