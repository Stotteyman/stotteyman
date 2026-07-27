import { createHash, randomBytes } from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error('[hq/invites]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

/** List invites. Token hashes are never returned. */
export async function GET() {
  try {
    await requirePermission('members.invite');
    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('invites')
      .select('id, email, role_slug, note, expires_at, accepted_at, revoked_at, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return NextResponse.json({ invites: data ?? [] });
  } catch (e) {
    return fail(e);
  }
}

/**
 * Create an invite.
 *
 * The raw token is returned exactly once, in this response, and only its SHA-256 hash
 * is stored. There is no way to recover it later — reissue instead.
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('members.invite');
    const body = (await request.json()) as {
      email?: string;
      role?: string;
      note?: string;
    };

    const email = (body.email ?? '').trim().toLowerCase();
    const role = (body.role ?? 'viewer').trim();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();

    const { data: roleRow } = await admin
      .from('roles')
      .select('slug')
      .eq('slug', role)
      .maybeSingle();
    if (!roleRow) {
      return NextResponse.json({ error: `Unknown role: ${role}` }, { status: 400 });
    }

    // Only an owner may mint another owner.
    if (role === 'owner' && !actor.roles.includes('owner')) {
      return NextResponse.json(
        { error: 'Only an owner can invite another owner.' },
        { status: 403 }
      );
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const { data, error } = await admin
      .from('invites')
      .insert({
        email,
        role_slug: role,
        token_hash: tokenHash,
        note: body.note?.trim() || null,
        invited_by: actor.userId,
      })
      .select('id, email, role_slug, expires_at')
      .single();

    if (error) {
      // Partial unique index: one pending invite per email.
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'There is already a pending invite for that address.' },
          { status: 409 }
        );
      }
      throw error;
    }

    await audit(actor.userId, 'invite.created', 'invite', data.id, { email, role });

    // Must be the canonical site URL, not request origin: on a deploy preview the
    // origin is an ephemeral hostname, and an invite link pointing at a throwaway
    // deploy would be dead by the time anyone clicked it.
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? request.nextUrl.origin;

    return NextResponse.json({
      invite: data,
      // Shown once. Email delivery is not wired yet (needs Zoho SMTP + DKIM),
      // so this link is the delivery mechanism for now.
      inviteUrl: `${origin}/invite/${token}`,
    });
  } catch (e) {
    return fail(e);
  }
}
