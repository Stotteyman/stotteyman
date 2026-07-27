import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const STATUSES = new Set([
  'new',
  'reviewing',
  'accepted',
  'scheduled',
  'declined',
  'completed',
  'no_show',
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requirePermission('consults.manage');
    const { id } = await params;
    const body = (await request.json()) as { status?: string; internal_notes?: string };

    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!STATUSES.has(body.status)) {
        return NextResponse.json({ error: `Unknown status: ${body.status}` }, { status: 400 });
      }
      patch.status = body.status;
      patch.handled_by = actor.userId;
    }
    if (body.internal_notes !== undefined) {
      patch.internal_notes = body.internal_notes.trim() || null;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('consultation_requests')
      .update(patch)
      .eq('id', id)
      .select('id, status, internal_notes')
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });

    await audit(actor.userId, 'consult.updated', 'consultation_request', id, patch);
    return NextResponse.json({ request: data });
  } catch (e) {
    if (e instanceof HqAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('[hq/consults PATCH]', e);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}
