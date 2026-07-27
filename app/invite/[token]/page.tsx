import type { Metadata } from 'next';
import { createHash } from 'node:crypto';

import { createSupabaseServiceClient } from '@/lib/supabase/server';

import InviteClient from './InviteClient';

export const metadata: Metadata = {
  title: 'Your invitation',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const admin = createSupabaseServiceClient();
  const { data: invite } = await admin
    .from('invites')
    .select('email, role_slug, note, expires_at, accepted_at, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  let state: 'valid' | 'accepted' | 'revoked' | 'expired' | 'unknown' = 'unknown';
  if (invite) {
    if (invite.revoked_at) state = 'revoked';
    else if (invite.accepted_at) state = 'accepted';
    else if (new Date(invite.expires_at) < new Date()) state = 'expired';
    else state = 'valid';
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07070a] px-6 py-24">
      <InviteClient
        state={state}
        email={invite?.email ?? null}
        role={invite?.role_slug ?? null}
        note={invite?.note ?? null}
      />
    </main>
  );
}
