import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';

import { CANONICAL_PUBLIC_HOSTS, hqBaseFromHost } from '@/lib/hq/paths';

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

  // Production sends people to the HQ subdomain; localhost and previews must stay put,
  // or signing in locally would bounce to the live site.
  const host = (await headers()).get('host') ?? '';
  const bare = host.split(':')[0].toLowerCase();
  const hqCallback = CANONICAL_PUBLIC_HOSTS.has(bare)
    ? `${process.env.NEXT_PUBLIC_HQ_URL ?? 'https://hq.stotteyman.com'}/auth/callback`
    : `${host.startsWith('localhost') ? 'http' : 'https'}://${host}${hqBaseFromHost(host)}/auth/callback`;

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
        hqCallback={hqCallback}
      />
    </main>
  );
}
