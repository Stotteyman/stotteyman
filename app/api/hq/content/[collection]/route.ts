import { NextResponse, type NextRequest } from 'next/server';

import { getCollection, sanitize } from '@/lib/hq/collections';
import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error('[hq/content]', e);
  const message = e instanceof Error ? e.message : 'Unexpected error.';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    await requirePermission('content.write');
    const { collection: key } = await params;
    const collection = getCollection(key);
    if (!collection) {
      return NextResponse.json({ error: `Unknown collection: ${key}` }, { status: 404 });
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from(collection.table)
      .select('*')
      .order(collection.orderBy)
      .limit(500);
    if (error) throw error;

    return NextResponse.json({ rows: data ?? [] });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const actor = await requirePermission('content.write');
    const { collection: key } = await params;
    const collection = getCollection(key);
    if (!collection) {
      return NextResponse.json({ error: `Unknown collection: ${key}` }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const patch = sanitize(collection, body);

    const title = String(patch[collection.titleField] ?? '').trim();
    if (!title) {
      return NextResponse.json(
        { error: `${collection.titleField} is required.` },
        { status: 400 }
      );
    }

    // Tables with a slug need a unique one; derive it rather than making the user think.
    if (collection.fields.some((f) => f.name === 'slug') && !patch.slug) {
      const base =
        title
          .toLowerCase()
          .replace(/['’]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || 'entry';
      patch.slug = `${base}-${Date.now().toString(36).slice(-4)}`;
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin.from(collection.table).insert(patch).select('*').single();
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 });
      }
      throw error;
    }

    await audit(actor.userId, 'content.created', collection.key, String(data.id), { title });
    return NextResponse.json({ row: data });
  } catch (e) {
    return fail(e);
  }
}
