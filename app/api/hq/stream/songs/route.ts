import { NextResponse, type NextRequest } from 'next/server';

import { audit, HqAuthError, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error('[hq/stream/songs]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

const FIELDS =
  'id, video_id, title, requested_by, amount_cents, status, created_at, played_at, donation_id';

export async function GET() {
  try {
    await requirePermission('stream.moderate');
    const admin = createSupabaseServiceClient();

    const [{ data: awaiting }, { data: queue }, { data: playing }, { data: history }] =
      await Promise.all([
        admin
          .from('stream_song_queue')
          .select(FIELDS)
          .eq('status', 'pending')
          .order('created_at'),
        // Highest payer first, then oldest — the ordering the queue is sold on.
        admin
          .from('stream_song_queue')
          .select(FIELDS)
          .eq('status', 'queued')
          .order('amount_cents', { ascending: false })
          .order('created_at'),
        admin.from('stream_song_queue').select(FIELDS).eq('status', 'playing').maybeSingle(),
        admin
          .from('stream_song_queue')
          .select(FIELDS)
          .in('status', ['played', 'skipped'])
          .order('played_at', { ascending: false })
          .limit(20),
      ]);

    return NextResponse.json({
      awaiting: awaiting ?? [],
      queue: queue ?? [],
      playing: playing ?? null,
      history: history ?? [],
    });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.moderate');
    const body = (await request.json()) as { id?: string; action?: string };
    const admin = createSupabaseServiceClient();

    const setStatus = async (id: string, status: string, extra: Record<string, unknown> = {}) => {
      const { error } = await admin
        .from('stream_song_queue')
        .update({ status, ...extra })
        .eq('id', id);
      if (error) throw error;
    };

    switch (body.action) {
      case 'approve':
        if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        await setStatus(body.id, 'queued');
        break;

      case 'skip':
        if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        await setStatus(body.id, 'skipped', { played_at: new Date().toISOString() });
        break;

      case 'play': {
        if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        // Only one song may be `playing` — the overlay renders a single now-playing
        // widget and two rows would make which one it shows arbitrary.
        await admin
          .from('stream_song_queue')
          .update({ status: 'played', played_at: new Date().toISOString() })
          .eq('status', 'playing');
        await setStatus(body.id, 'playing');
        break;
      }

      case 'finish':
        await admin
          .from('stream_song_queue')
          .update({ status: 'played', played_at: new Date().toISOString() })
          .eq('status', 'playing');
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
    }

    await audit(actor.userId, `stream.song.${body.action}`, 'stream_song_queue', body.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
