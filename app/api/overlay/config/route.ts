import { NextResponse } from 'next/server';

import { getChatSources, OverlayAuthError, requireOverlayKey } from '@/lib/stream/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Everything an overlay browser source needs to start rendering.
 *
 * Returns only what a page displaying public chat legitimately needs. Note what is
 * NOT here: the overlay key itself is never echoed back, and no Supabase key of any
 * kind is exposed — the overlay reaches the database only through these routes.
 */
export async function GET(request: Request) {
  let settings;
  try {
    settings = await requireOverlayKey(request);
  } catch (err) {
    if (err instanceof OverlayAuthError) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Settings unavailable' }, { status: 500 });
  }

  const sources = await getChatSources();

  return NextResponse.json(
    {
      chat: {
        enabled: settings.chat_enabled,
        maxMessages: settings.chat_max_messages,
        fadeSeconds: settings.chat_fade_seconds,
        fontScale: Number(settings.chat_font_scale),
        showPlatform: settings.chat_show_platform,
        hideCommands: settings.chat_hide_commands,
        blockedUsers: settings.chat_blocked_users.map((u) => u.toLowerCase()),
      },
      tts: {
        enabled: settings.tts_enabled,
        cooldownSeconds: settings.tts_cooldown_seconds,
        volume: Number(settings.tts_volume),
      },
      alerts: {
        enabled: settings.alerts_enabled,
        durationMs: settings.alerts_duration_ms,
        soundUrl: settings.alerts_sound_url,
      },
      songs: {
        enabled: settings.songs_enabled,
        maxDurationSeconds: settings.songs_max_duration_seconds,
      },
      sources: sources
        .filter((s) => s.enabled)
        .map((s) => ({
          platform: s.platform,
          channel: s.channel,
          externalId: s.external_id,
          accent: s.accent,
        })),
      // Lets a long-lived browser source notice a settings change and re-fetch
      // without anyone touching OBS.
      revision: settings.updated_at,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
