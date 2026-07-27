import { NextResponse, type NextRequest } from 'next/server';

import { audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import { ENTITY_FIELDS } from '@/lib/hq/entities';

import { fail } from '../route';

export const dynamic = 'force-dynamic';

/** Only these may be edited from the UI. Connector wiring is deliberately included. */
const EDITABLE = new Set([
  'name',
  'kind',
  'status',
  'tagline',
  'description',
  'domain',
  'stripe_account_id',
  'supabase_schema',
  'netlify_site_id',
  'drive_folder_id',
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requirePermission('entities.write');
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (!EDITABLE.has(k)) continue;
      // Empty string means "clear it", except for name which must stay populated.
      patch[k] = typeof v === 'string' && v.trim() === '' && k !== 'name' ? null : v;
    }

    if (typeof patch.name === 'string' && patch.name.trim() === '') {
      return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('entities')
      .update(patch)
      .eq('id', id)
      .select(ENTITY_FIELDS)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Entity not found.' }, { status: 404 });

    await audit(actor.userId, 'entity.updated', 'entity', id, { fields: Object.keys(patch) });
    return NextResponse.json({ entity: data });
  } catch (e) {
    return fail(e, '[hq/entities PATCH]');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requirePermission('entities.write');
    const { id } = await params;
    const admin = createSupabaseServiceClient();

    const { data: target } = await admin
      .from('entities')
      .select('id, name, parent_id')
      .eq('id', id)
      .maybeSingle();
    if (!target) return NextResponse.json({ error: 'Entity not found.' }, { status: 404 });

    // Lift children to the deleted node's parent rather than orphaning them to the
    // root, which is what the FK's ON DELETE SET NULL would otherwise do.
    const { error: liftError } = await admin
      .from('entities')
      .update({ parent_id: target.parent_id })
      .eq('parent_id', id);
    if (liftError) throw liftError;

    const { error } = await admin.from('entities').delete().eq('id', id);
    if (error) throw error;

    await audit(actor.userId, 'entity.deleted', 'entity', id, { name: target.name });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e, '[hq/entities DELETE]');
  }
}
