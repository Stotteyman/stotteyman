import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PRIVACY = ['public', 'unlisted', 'invite_only', 'off'] as const;

function fail(e: unknown) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error('[hq/live]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

/** Current stream settings plus live viewer and ingest state. */
export async function GET() {
  try {
    await requirePermission('live.manage');
    const admin = createSupabaseServiceClient();

    const { data: settings } = await admin
      .from('live_settings')
      .select('*')
      .eq('id', true)
      .maybeSingle();

    const { data: viewers } = await admin
      .from('live_viewer_sessions')
      .select('id, display_name, user_id, started_at, last_seen_at, invite_id')
      .is('ended_at', null)
      .is('revoked_at', null)
      // Anything not seen in 30s has almost certainly closed the tab; the
      // auth hook refreshes last_seen_at on every playback check.
      .gte('last_seen_at', new Date(Date.now() - 30_000).toISOString())
      .order('last_seen_at', { ascending: false })
      .limit(200);

    const { data: commands } = await admin
      .from('live_commands')
      .select('id, command, status, result, created_at, completed_at')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      settings: settings ?? null,
      viewers: viewers ?? [],
      commands: commands ?? [],
    });
  } catch (e) {
    return fail(e);
  }
}

/** Update privacy and stream metadata. */
export async function PATCH(request: NextRequest) {
  try {
    const actor = await requirePermission('live.manage');
    const body = (await request.json()) as {
      privacy?: string;
      title?: string;
      description?: string | null;
      category?: string | null;
      thumbnail_url?: string | null;
      show_on_site?: boolean;
      chat_enabled?: boolean;
    };

    const patch: Record<string, unknown> = { updated_by: actor.userId };

    if (body.privacy !== undefined) {
      if (!PRIVACY.includes(body.privacy as (typeof PRIVACY)[number])) {
        return NextResponse.json({ error: `Unknown privacy: ${body.privacy}` }, { status: 400 });
      }
      patch.privacy = body.privacy;
    }
    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) return NextResponse.json({ error: 'Title cannot be empty.' }, { status: 400 });
      patch.title = title.slice(0, 200);
    }
    if (body.description !== undefined) patch.description = body.description?.slice(0, 2000) ?? null;
    if (body.category !== undefined) patch.category = body.category?.slice(0, 100) ?? null;
    if (body.thumbnail_url !== undefined) patch.thumbnail_url = body.thumbnail_url ?? null;
    if (body.show_on_site !== undefined) patch.show_on_site = Boolean(body.show_on_site);
    if (body.chat_enabled !== undefined) patch.chat_enabled = Boolean(body.chat_enabled);

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('live_settings')
      .update(patch)
      .eq('id', true)
      .select('*')
      .single();
    if (error) throw error;

    // Tightening privacy must take effect immediately for people ALREADY
    // watching, not just for new joins - otherwise "make it private" would
    // leave the current audience connected.
    if (patch.privacy === 'off' || patch.privacy === 'invite_only') {
      await admin
        .from('live_viewer_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .is('ended_at', null)
        .is('revoked_at', null)
        .is('invite_id', null);
    }

    await audit(actor.userId, 'live.settings.updated', 'live_settings', undefined, patch);
    return NextResponse.json({ settings: data });
  } catch (e) {
    return fail(e);
  }
}
