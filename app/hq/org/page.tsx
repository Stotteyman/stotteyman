import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getActor } from '@/lib/hq/auth';
import { ENTITY_FIELDS } from '@/lib/hq/entities';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import OrgClient, { type Entity, type Relationship } from './OrgClient';

export const metadata: Metadata = {
  title: 'Organisation',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function OrgPage() {
  const actor = await getActor();
  if (!actor) redirect('/no-access');
  if (!actor.permissions.has('entities.read')) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24">
        <p className="text-sm text-fg-muted">You do not have permission to view the org tree.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-fg-subtle underline">
          Back to HQ
        </Link>
      </main>
    );
  }

  const admin = createSupabaseServiceClient();
  const [{ data: entities }, { data: relationships }] = await Promise.all([
    admin.from('entities').select(ENTITY_FIELDS).order('sort_order'),
    admin
      .from('entity_relationships')
      .select('id, from_entity_id, to_entity_id, kind, status, note'),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="border-b border-line pb-8">
        <Link
          href="/"
          className="text-label uppercase text-fg-subtle hover:text-fg-muted"
        >
          ← HQ
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-fg">Organisation</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
          The ownership tree, stored in the database and used to drive rollups, the Drive folder
          generator, and every connector. Entities that are not owned by the group — employers,
          clients, partners — sit outside the tree and are linked by relationship instead.
        </p>
      </header>

      <div className="mt-10">
        <OrgClient
          initialEntities={(entities ?? []) as Entity[]}
          initialRelationships={(relationships ?? []) as Relationship[]}
          canWrite={actor.permissions.has('entities.write')}
        />
      </div>
    </main>
  );
}
