import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getActor } from '@/lib/hq/auth';
import { buildRenewals, listDocuments } from '@/lib/hq/documents.server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import LegalClient, { type EntityOption } from './LegalClient';

export const metadata: Metadata = {
  title: 'Legal & compliance',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function LegalPage() {
  const actor = await getActor();
  if (!actor) redirect('/no-access');

  if (!actor.permissions.has('documents.read')) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24">
        <p className="text-body-sm text-fg-muted">
          You do not have permission to view the document register.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-body-sm text-fg-subtle underline underline-offset-4"
        >
          Back to HQ
        </Link>
      </main>
    );
  }

  const admin = createSupabaseServiceClient();
  const [documents, { data: entityRows }] = await Promise.all([
    listDocuments(),
    admin.from('entities').select('id, slug, name, parent_id, kind').order('sort_order'),
  ]);

  const renewals = await buildRenewals(documents);
  const entities = (entityRows ?? []) as unknown as EntityOption[];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-10">
      <header className="border-b border-line pb-8">
        <Link
          href="/"
          className="font-mono text-label uppercase text-fg-subtle transition-colors hover:text-fg"
        >
          ← HQ
        </Link>
        <h1 className="mt-3 text-display-md font-medium text-fg">Legal &amp; compliance</h1>
        <p className="mt-3 max-w-prose text-body-sm text-fg-muted">
          Every filing for the group in one register — formation documents, licences,
          insurance, trademarks and contracts — with the renewal deadlines they carry.
          Domain expiries are pulled in automatically from the GoDaddy connector, so this is
          the only place you need to look.
        </p>
      </header>

      <div className="mt-10">
        <LegalClient
          initialDocuments={documents}
          initialRenewals={renewals}
          entities={entities}
          canWrite={actor.permissions.has('documents.write')}
        />
      </div>
    </main>
  );
}
