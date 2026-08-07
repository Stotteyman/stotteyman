import { NextResponse, type NextRequest } from 'next/server';

import { audit, HqAuthError, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error('[hq/stream/tts-accounts]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

const PLATFORMS = ['any', 'kick', 'twitch', 'youtube'];

/** Who may and may not use the stream's voice. */
export async function GET() {
  try {
    await requirePermission('stream.manage');
    const admin = createSupabaseServiceClient();
    const { data } = await admin
      .from('stream_tts_accounts')
      .select('id, platform, username, access, note, created_at')
      .order('access')
      .order('username');
    return NextResponse.json({ accounts: data ?? [] });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.manage');
    const body = (await request.json()) as {
      platform?: string;
      username?: string;
      access?: string;
      note?: string;
    };

    const platform = body.platform ?? 'any';
    const username = String(body.username ?? '').trim().replace(/^@/, '');
    const access = body.access === 'deny' ? 'deny' : 'allow';

    if (!username) return NextResponse.json({ error: 'Username required.' }, { status: 400 });
    if (!PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();
    // Upsert on the (platform, lowercased username) pair so flipping someone from
    // allow to deny is the same action as adding them, not a duplicate-key error.
    const { data: existing } = await admin
      .from('stream_tts_accounts')
      .select('id')
      .eq('platform', platform)
      .eq('username_lower', username.toLowerCase())
      .maybeSingle();

    const row = {
      platform,
      username: username.slice(0, 80),
      access,
      note: body.note?.slice(0, 200) ?? null,
      added_by: actor.userId,
    };

    const { data, error } = existing
      ? await admin.from('stream_tts_accounts').update(row).eq('id', existing.id).select('*').single()
      : await admin.from('stream_tts_accounts').insert(row).select('*').single();
    if (error) throw error;

    await audit(actor.userId, `stream.tts.${access}`, 'stream_tts_accounts', data.id, {
      platform,
      username,
    });
    return NextResponse.json({ account: data });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.manage');
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const admin = createSupabaseServiceClient();
    const { error } = await admin.from('stream_tts_accounts').delete().eq('id', id);
    if (error) throw error;

    await audit(actor.userId, 'stream.tts.removed', 'stream_tts_accounts', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
