import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error('[hq/live/viewers]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

/**
 * Kick a single viewer.
 *
 * Revoking here is enough to stop playback: the MediaMTX auth hook re-checks
 * the session on every connection attempt, so the viewer's video cuts rather
 * than merely losing access on a future visit.
 */
export async function PATCH(request: NextRequest) {
  try {
    const actor = await requirePermission('live.manage');
    const { id, all } = (await request.json()) as { id?: string; all?: boolean };

    const admin = createSupabaseServiceClient();
    const now = new Date().toISOString();

    if (all) {
      const { error } = await admin
        .from('live_viewer_sessions')
        .update({ revoked_at: now })
        .is('ended_at', null)
        .is('revoked_at', null);
      if (error) throw error;
      await audit(actor.userId, 'live.viewers.revoked_all', 'live_viewer_sessions');
      return NextResponse.json({ ok: true });
    }

    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });

    const { error } = await admin
      .from('live_viewer_sessions')
      .update({ revoked_at: now })
      .eq('id', id);
    if (error) throw error;

    await audit(actor.userId, 'live.viewer.revoked', 'live_viewer_session', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
