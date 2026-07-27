import { NextResponse, type NextRequest } from 'next/server';

import { getCollection, sanitize } from '@/lib/hq/collections';
import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error('[hq/content/:id]', e);
  const message = e instanceof Error ? e.message : 'Unexpected error.';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const actor = await requirePermission('content.write');
    const { collection: key, id } = await params;
    const collection = getCollection(key);
    if (!collection) {
      return NextResponse.json({ error: `Unknown collection: ${key}` }, { status: 404 });
    }

    const patch = sanitize(collection, (await request.json()) as Record<string, unknown>);
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from(collection.table)
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 });
      }
      throw error;
    }
    if (!data) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    await audit(actor.userId, 'content.updated', collection.key, id, {
      fields: Object.keys(patch),
    });
    return NextResponse.json({ row: data });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const actor = await requirePermission('content.write');
    const { collection: key, id } = await params;
    const collection = getCollection(key);
    if (!collection) {
      return NextResponse.json({ error: `Unknown collection: ${key}` }, { status: 404 });
    }

    const admin = createSupabaseServiceClient();
    const { error } = await admin.from(collection.table).delete().eq('id', id);
    if (error) throw error;

    await audit(actor.userId, 'content.deleted', collection.key, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
