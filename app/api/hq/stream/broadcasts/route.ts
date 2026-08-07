import { NextResponse, type NextRequest } from 'next/server';

import { audit, HqAuthError, requirePermission } from '@/lib/hq/auth';
import { drainQueue, queueDraft } from '@/lib/studio/queue';
import { isChannel, type Channel } from '@/lib/studio/types';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error('[hq/stream/broadcasts]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

const KICK_URL = 'https://kick.com/stotteyman';

export async function GET() {
  try {
    await requirePermission('stream.manage');
    const admin = createSupabaseServiceClient();
    const { data } = await admin
      .from('stream_broadcasts')
      .select('*')
      .order('scheduled_for', { ascending: false, nullsFirst: false })
      .limit(50);
    return NextResponse.json({ broadcasts: data ?? [] });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.manage');
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      category?: string;
      scheduledFor?: string | null;
      platforms?: string[];
    };

    const title = String(body.title ?? '').trim();
    if (!title) return NextResponse.json({ error: 'Title required.' }, { status: 400 });

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('stream_broadcasts')
      .insert({
        title: title.slice(0, 200),
        description: body.description?.slice(0, 2000) ?? null,
        category: body.category?.slice(0, 100) ?? null,
        scheduled_for: body.scheduledFor || null,
        platforms: Array.isArray(body.platforms) ? body.platforms.map(String).slice(0, 10) : [],
        created_by: actor.userId,
      })
      .select('*')
      .single();
    if (error) throw error;

    await audit(actor.userId, 'stream.broadcast.created', 'stream_broadcasts', data.id, { title });
    return NextResponse.json({ broadcast: data });
  } catch (e) {
    return fail(e);
  }
}

/**
 * Broadcast lifecycle and promotion.
 *
 * `announce` deliberately reuses Studio rather than posting to Discord directly:
 * Studio already owns every channel adapter, the retry/backoff behaviour and the
 * per-channel audit trail. A second, stream-only announcement path would be one
 * more thing to keep in sync with tokens that rotate.
 */
export async function PATCH(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.manage');
    const body = (await request.json()) as {
      id?: string;
      action?: string;
      channels?: string[];
      title?: string;
      description?: string;
      category?: string;
      scheduledFor?: string | null;
      status?: string;
    };
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const admin = createSupabaseServiceClient();
    const { data: broadcast } = await admin
      .from('stream_broadcasts')
      .select('*')
      .eq('id', body.id)
      .maybeSingle();
    if (!broadcast) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    switch (body.action) {
      case 'announce': {
        const channels = (body.channels ?? ['discord']).filter(isChannel) as Channel[];
        if (!channels.length) {
          return NextResponse.json({ error: 'Pick at least one channel.' }, { status: 400 });
        }

        const when = broadcast.scheduled_for
          ? new Date(broadcast.scheduled_for).toUTCString()
          : null;

        const lines = [
          broadcast.description?.trim(),
          when ? `Going live ${when}.` : 'Going live now.',
          KICK_URL,
        ].filter(Boolean);

        const { data: draft, error: draftError } = await admin
          .from('drafts')
          .insert({
            source: 'hq',
            author_label: actor.displayName ?? actor.email ?? 'HQ',
            title: broadcast.title,
            body: lines.join('\n\n'),
            tags: ['livestream', broadcast.category].filter(Boolean),
            link_url: KICK_URL,
            status: 'draft',
          })
          .select('id')
          .single();
        if (draftError) throw draftError;

        const queued = await queueDraft(draft.id, channels);
        // Drain inline so the panel can report what actually posted. Studio's
        // background worker would also pick these up, but a promotion the operator
        // cannot see the result of is a promotion they will re-send.
        const outcomes = await drainQueue(channels.length);

        await admin
          .from('stream_broadcasts')
          .update({
            status: 'announced',
            announced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.id);

        await audit(actor.userId, 'stream.broadcast.announced', 'stream_broadcasts', body.id, {
          channels,
          queued,
        });
        return NextResponse.json({ ok: true, queued, outcomes });
      }

      case 'live':
        await admin
          .from('stream_broadcasts')
          .update({
            status: 'live',
            went_live_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.id);
        break;

      case 'end':
        await admin
          .from('stream_broadcasts')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.id);
        break;

      case 'cancel':
        await admin
          .from('stream_broadcasts')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', body.id);
        break;

      case 'update': {
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (body.title !== undefined) patch.title = String(body.title).slice(0, 200);
        if (body.description !== undefined) patch.description = body.description?.slice(0, 2000) ?? null;
        if (body.category !== undefined) patch.category = body.category?.slice(0, 100) ?? null;
        if (body.scheduledFor !== undefined) patch.scheduled_for = body.scheduledFor || null;
        await admin.from('stream_broadcasts').update(patch).eq('id', body.id);
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
    }

    await audit(actor.userId, `stream.broadcast.${body.action}`, 'stream_broadcasts', body.id);
    const { data: updated } = await admin
      .from('stream_broadcasts')
      .select('*')
      .eq('id', body.id)
      .single();
    return NextResponse.json({ broadcast: updated });
  } catch (e) {
    return fail(e);
  }
}
