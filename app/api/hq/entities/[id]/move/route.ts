import { NextResponse, type NextRequest } from 'next/server';

import { audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import { fail } from '../../route';

export const dynamic = 'force-dynamic';

/**
 * Reparent and/or reorder one entity.
 *
 * The client sends a target parent and an index among that parent's children; the
 * server recomputes every sibling's sort_order. Letting the client send raw
 * sort_order values would drift out of sync the moment two edits overlap.
 *
 * Cycles are rejected by a database trigger, so a bad drop fails safely even if the
 * UI's own guard is wrong.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requirePermission('entities.write');
    const { id } = await params;
    const body = (await request.json()) as { parentId?: string | null; index?: number };
    const parentId = body.parentId ?? null;
    const index = Number.isFinite(body.index) ? Math.max(0, Number(body.index)) : 0;

    const admin = createSupabaseServiceClient();

    const { data: moving } = await admin
      .from('entities')
      .select('id, name, parent_id')
      .eq('id', id)
      .maybeSingle();
    if (!moving) return NextResponse.json({ error: 'Entity not found.' }, { status: 404 });

    const { error: moveError } = await admin
      .from('entities')
      .update({ parent_id: parentId })
      .eq('id', id);

    if (moveError) {
      // 22023 is what the cycle guard raises.
      if (moveError.code === '22023' || /cycle/i.test(moveError.message)) {
        return NextResponse.json({ error: moveError.message }, { status: 400 });
      }
      throw moveError;
    }

    const siblingQuery = admin.from('entities').select('id, sort_order').order('sort_order');
    const { data: siblings } = parentId
      ? await siblingQuery.eq('parent_id', parentId)
      : await siblingQuery.is('parent_id', null);

    const ordered = (siblings ?? []).map((s: { id: string }) => s.id).filter((s) => s !== id);
    ordered.splice(Math.min(index, ordered.length), 0, id);

    await Promise.all(
      ordered.map((entityId, i) =>
        admin
          .from('entities')
          .update({ sort_order: (i + 1) * 10 })
          .eq('id', entityId)
      )
    );

    await audit(actor.userId, 'entity.moved', 'entity', id, {
      name: moving.name,
      from_parent: moving.parent_id,
      to_parent: parentId,
      index,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e, '[hq/entities move]');
  }
}
