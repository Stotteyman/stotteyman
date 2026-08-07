import { NextResponse, type NextRequest } from 'next/server';

import { audit, HqAuthError, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error('[hq/stream/sources]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

const PLATFORMS = ['kick', 'twitch', 'youtube'];

/**
 * Resolves a Kick slug to its numeric chatroom id.
 *
 * Goes via the Supabase edge function rather than fetching Kick from here: Kick's
 * API answers 403 to Cloudflare-flagged origins, and Supabase's egress is one of
 * the few places the request reliably succeeds.
 */
async function resolveKickChatroom(slug: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  try {
    const res = await fetch(
      `${base}/functions/v1/kick-chatroom?slug=${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(15000), cache: 'no-store' }
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { chatroomId?: string };
    return body.chatroomId ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await requirePermission('stream.manage');
    const admin = createSupabaseServiceClient();
    const { data } = await admin.from('stream_chat_sources').select('*').order('sort_order');
    return NextResponse.json({ sources: data ?? [] });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.manage');
    const body = (await request.json()) as {
      platform?: string;
      channel?: string;
      externalId?: string;
    };

    const platform = String(body.platform ?? '');
    const channel = String(body.channel ?? '').trim().replace(/^[@#]/, '');
    if (!PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
    }
    if (!channel) return NextResponse.json({ error: 'Channel required.' }, { status: 400 });

    let externalId = body.externalId?.trim() || null;
    // Kick simply does not work without the numeric chatroom id, so resolve it now
    // rather than letting the overlay silently show no Kick messages.
    if (platform === 'kick' && !externalId) externalId = await resolveKickChatroom(channel);

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('stream_chat_sources')
      .upsert(
        { platform, channel, external_id: externalId, updated_at: new Date().toISOString() },
        { onConflict: 'platform,channel' }
      )
      .select('*')
      .single();
    if (error) throw error;

    await audit(actor.userId, 'stream.source.saved', 'stream_chat_sources', data.id, {
      platform,
      channel,
    });
    return NextResponse.json({
      source: data,
      warning:
        platform === 'kick' && !externalId
          ? 'Could not resolve the Kick chatroom id — Kick chat will not appear until it is set.'
          : null,
    });
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.manage');
    const body = (await request.json()) as {
      id?: string;
      enabled?: boolean;
      externalId?: string | null;
      action?: string;
    };
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const admin = createSupabaseServiceClient();

    if (body.action === 'resolve') {
      const { data: source } = await admin
        .from('stream_chat_sources')
        .select('id, platform, channel')
        .eq('id', body.id)
        .maybeSingle();
      if (!source) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
      if (source.platform !== 'kick') {
        return NextResponse.json(
          { error: 'Only Kick needs a chatroom id resolved.' },
          { status: 400 }
        );
      }
      const chatroomId = await resolveKickChatroom(source.channel);
      if (!chatroomId) {
        return NextResponse.json({ error: 'Kick did not answer. Try again.' }, { status: 502 });
      }
      const { data, error } = await admin
        .from('stream_chat_sources')
        .update({ external_id: chatroomId, updated_at: new Date().toISOString() })
        .eq('id', body.id)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ source: data });
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled);
    if (body.externalId !== undefined) patch.external_id = body.externalId || null;

    const { data, error } = await admin
      .from('stream_chat_sources')
      .update(patch)
      .eq('id', body.id)
      .select('*')
      .single();
    if (error) throw error;

    await audit(actor.userId, 'stream.source.updated', 'stream_chat_sources', body.id, patch);
    return NextResponse.json({ source: data });
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
    const { error } = await admin.from('stream_chat_sources').delete().eq('id', id);
    if (error) throw error;

    await audit(actor.userId, 'stream.source.removed', 'stream_chat_sources', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
