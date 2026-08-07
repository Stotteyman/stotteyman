import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getLiveSettings } from '@/lib/live/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const MAX_MESSAGES = 100;

/**
 * Chat for stream viewers, including anonymous invite-link ones.
 *
 * Identity comes from the httpOnly `live_session` cookie set when the viewer
 * was authorised — never from the request body — so a viewer cannot post under
 * someone else's name, and a revoked session loses chat at the same moment it
 * loses video.
 */
async function activeSession() {
  const jar = await cookies();
  const sessionId = jar.get('live_session')?.value;
  if (!sessionId) return null;

  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from('live_viewer_sessions')
    .select('id, display_name, user_id, revoked_at, ended_at')
    .eq('id', sessionId)
    .maybeSingle();

  if (!data || data.revoked_at || data.ended_at) return null;
  return data;
}

export async function GET() {
  const settings = await getLiveSettings();
  if (!settings?.chat_enabled) {
    return NextResponse.json({ messages: [] });
  }
  if (!(await activeSession())) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from('live_chat')
    .select('id, display_name, body, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(MAX_MESSAGES);

  // Query descending so the index serves the newest rows, then flip for display.
  return NextResponse.json({ messages: (data ?? []).reverse() });
}

export async function POST(request: Request) {
  const settings = await getLiveSettings();
  if (!settings?.chat_enabled) {
    return NextResponse.json({ error: 'chat_disabled' }, { status: 403 });
  }

  const session = await activeSession();
  if (!session) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  let body: string;
  try {
    const payload = (await request.json()) as { body?: string };
    body = (payload.body ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (!body || body.length > 500) {
    return NextResponse.json({ error: 'invalid_message' }, { status: 400 });
  }

  const admin = createSupabaseServiceClient();

  // Simple flood guard: at most 5 messages in the last 10 seconds per session.
  const since = new Date(Date.now() - 10_000).toISOString();
  const { count } = await admin
    .from('live_chat')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id)
    .gte('created_at', since);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  await admin.from('live_chat').insert({
    session_id: session.id,
    user_id: session.user_id,
    display_name: session.display_name,
    body,
  });

  return NextResponse.json({ ok: true });
}
