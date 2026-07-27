import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { ENTITY_FIELDS } from '@/lib/hq/entities';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export function fail(e: unknown, tag: string) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error(tag, e);
  const message = e instanceof Error ? e.message : 'Unexpected error.';
  return NextResponse.json({ error: message }, { status: 500 });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function GET() {
  try {
    await requirePermission('entities.read');
    const admin = createSupabaseServiceClient();

    const [{ data: entities, error: e1 }, { data: relationships, error: e2 }] =
      await Promise.all([
        admin.from('entities').select(ENTITY_FIELDS).order('sort_order'),
        admin
          .from('entity_relationships')
          .select('id, from_entity_id, to_entity_id, kind, status, note'),
      ]);

    if (e1) throw e1;
    if (e2) throw e2;

    return NextResponse.json({
      entities: entities ?? [],
      relationships: relationships ?? [],
    });
  } catch (e) {
    return fail(e, '[hq/entities GET]');
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('entities.write');
    const body = (await request.json()) as {
      name?: string;
      parentId?: string | null;
      kind?: string;
    };

    const name = (body.name ?? '').trim();
    if (!name) {
      return NextResponse.json({ error: 'A name is required.' }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();

    // Slugs are unique; append a counter rather than failing the user's create.
    const base = slugify(name) || 'entity';
    let slug = base;
    for (let n = 2; n < 50; n += 1) {
      const { data: clash } = await admin
        .from('entities')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!clash) break;
      slug = `${base}-${n}`;
    }

    // Place it last among its new siblings.
    const siblings = admin.from('entities').select('sort_order');
    const { data: sibRows } = body.parentId
      ? await siblings.eq('parent_id', body.parentId)
      : await siblings.is('parent_id', null);
    const nextSort =
      Math.max(0, ...(sibRows ?? []).map((r: { sort_order: number }) => r.sort_order)) + 10;

    const { data, error } = await admin
      .from('entities')
      .insert({
        name,
        slug,
        parent_id: body.parentId ?? null,
        kind: body.kind ?? 'business',
        sort_order: nextSort,
      })
      .select(ENTITY_FIELDS)
      .single();

    if (error) throw error;

    await audit(actor.userId, 'entity.created', 'entity', data.id, { name, slug });
    return NextResponse.json({ entity: data });
  } catch (e) {
    return fail(e, '[hq/entities POST]');
  }
}
