import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getActor } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import PeopleClient from './PeopleClient';

export const metadata: Metadata = { title: 'People', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PeoplePage() {
  const actor = await getActor();
  if (!actor) redirect('/no-access');
  if (!actor.permissions.has('members.invite')) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24">
        <p className="text-sm text-fg-muted">
          You do not have permission to manage people.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-fg-subtle underline">
          Back to HQ
        </Link>
      </main>
    );
  }

  const admin = createSupabaseServiceClient();
  const { data: memberRows } = await admin
    .from('members')
    .select('user_id, email, display_name, status')
    .order('created_at');
  const { data: roleRows } = await admin.from('user_roles').select('user_id, role_slug');

  const members = (memberRows ?? []).map(
    (m: { user_id: string; email: string | null; display_name: string | null; status: string }) => ({
      ...m,
      roles: (roleRows ?? [])
        .filter((r: { user_id: string }) => r.user_id === m.user_id)
        .map((r: { role_slug: string }) => r.role_slug),
    })
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="border-b border-line pb-8">
        <Link href="/" className="text-label uppercase text-fg-subtle hover:text-fg-muted">
          ← HQ
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-fg">People</h1>
        <p className="mt-3 text-sm text-fg-muted">
          Access is invite-only. Nobody can self-register.
        </p>
      </header>

      <div className="mt-12">
        <PeopleClient members={members} />
      </div>
    </main>
  );
}
