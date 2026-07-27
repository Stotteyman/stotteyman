import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Revoke a pending invite. Revoking is a soft delete so the trail survives. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requirePermission('members.invite');
    const { id } = await params;

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('invites')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .select('id, email')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: 'No pending invite with that id (already accepted or revoked).' },
        { status: 404 }
      );
    }

    await audit(actor.userId, 'invite.revoked', 'invite', id, { email: data.email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof HqAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('[hq/invites/:id]', e);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
