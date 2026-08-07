import { createHash, randomBytes } from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error('[hq/live/invites]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

export async function GET() {
  try {
    await requirePermission('live.manage');
    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('live_invites')
      .select('id, label, max_uses, use_count, expires_at, revoked_at, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return NextResponse.json({ invites: data ?? [] });
  } catch (e) {
    return fail(e);
  }
}

/**
 * Mint a viewer invite link.
 *
 * As with HQ invites, the raw token is shown exactly once and only its hash is
 * stored — it cannot be recovered later, only reissued.
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('live.manage');
    const body = (await request.json()) as {
      label?: string;
      maxUses?: number | null;
      expiresInHours?: number | null;
    };

    const maxUses =
      body.maxUses === null || body.maxUses === undefined
        ? null
        : Math.max(1, Math.floor(body.maxUses));

    const expiresAt =
      body.expiresInHours === null || body.expiresInHours === undefined
        ? null
        : new Date(Date.now() + Math.max(1, body.expiresInHours) * 3_600_000).toISOString();

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('live_invites')
      .insert({
        token_hash: tokenHash,
        label: body.label?.trim().slice(0, 120) || null,
        max_uses: maxUses,
        expires_at: expiresAt,
        created_by: actor.userId,
      })
      .select('id, label, max_uses, use_count, expires_at, created_at')
      .single();
    if (error) throw error;

    await audit(actor.userId, 'live.invite.created', 'live_invite', data.id, {
      label: data.label,
      maxUses,
      expiresAt,
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? request.nextUrl.origin;

    return NextResponse.json({
      invite: data,
      // Fragment, not query string: fragments are not sent to the server in the
      // request line, so the token stays out of access logs and out of the
      // Referer header when the viewer navigates away.
      inviteUrl: `${origin}/live#invite=${token}`,
    });
  } catch (e) {
    return fail(e);
  }
}

/** Revoke an invite and cut off everyone currently watching through it. */
export async function PATCH(request: NextRequest) {
  try {
    const actor = await requirePermission('live.manage');
    const { id } = (await request.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });

    const admin = createSupabaseServiceClient();
    const now = new Date().toISOString();

    const { error } = await admin
      .from('live_invites')
      .update({ revoked_at: now })
      .eq('id', id)
      .is('revoked_at', null);
    if (error) throw error;

    // Revoking the link alone would leave existing viewers streaming, since
    // their session token is independent of the invite.
    await admin
      .from('live_viewer_sessions')
      .update({ revoked_at: now })
      .eq('invite_id', id)
      .is('revoked_at', null);

    await audit(actor.userId, 'live.invite.revoked', 'live_invite', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
