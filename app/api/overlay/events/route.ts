import { NextResponse } from 'next/server';

import { OverlayAuthError, requireOverlayKey } from '@/lib/stream/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function auth(request: Request) {
  try {
    return { settings: await requireOverlayKey(request), error: null as null };
  } catch (err) {
    return {
      settings: null,
      error:
        err instanceof OverlayAuthError
          ? NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
          : NextResponse.json({ error: 'Settings unavailable' }, { status: 500 }),
    };
  }
}

/**
 * The alert bus the alerts overlay polls.
 *
 * Polling rather than Realtime, for the same reason the /live chat polls: an OBS
 * browser source holds no Supabase session, and the tables are operator-only under
 * RLS, so there is no anon identity for Realtime to authorise.
 */
export async function GET(request: Request) {
  const { settings, error } = await auth(request);
  if (error) return error;

  const admin = createSupabaseServiceClient();

  const [{ data: alerts }, { data: playing }, { count: queued }] = await Promise.all([
    admin
      .from('stream_alerts')
      .select('id, kind, donor_name, amount_cents, currency, message, speak, created_at')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(5),
    admin
      .from('stream_song_queue')
      .select('id, video_id, title, requested_by, amount_cents, status')
      .eq('status', 'playing')
      .maybeSingle(),
    admin
      .from('stream_song_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'queued'),
  ]);

  return NextResponse.json(
    {
      alerts: settings!.alerts_enabled ? (alerts ?? []) : [],
      nowPlaying: settings!.songs_enabled ? (playing ?? null) : null,
      queuedSongs: queued ?? 0,
      alertsDurationMs: settings!.alerts_duration_ms,
      alertsSoundUrl: settings!.alerts_sound_url,
      alertsReadMessage: settings!.alerts_read_message,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

/**
 * Acknowledge an alert once it has finished showing.
 *
 * The overlay marks played AFTER the animation, not on receipt, so a browser source
 * that reloads mid-alert replays it instead of swallowing a real donation.
 */
export async function POST(request: Request) {
  const { error } = await auth(request);
  if (error) return error;

  let body: { alertId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }
  if (!body.alertId) return NextResponse.json({ error: 'alertId required' }, { status: 400 });

  const admin = createSupabaseServiceClient();
  await admin
    .from('stream_alerts')
    .update({ status: 'played', played_at: new Date().toISOString() })
    .eq('id', body.alertId)
    .eq('status', 'queued');

  return NextResponse.json({ ok: true });
}
