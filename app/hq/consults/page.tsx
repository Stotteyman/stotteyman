import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getActor } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import ConsultsClient, { type ConsultRow } from './ConsultsClient';

export const metadata: Metadata = { title: 'Requests', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function ConsultsPage() {
  const actor = await getActor();
  if (!actor) redirect('/no-access');
  if (!actor.permissions.has('consults.manage')) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24">
        <p className="text-sm text-fg-muted">You do not have permission to manage requests.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-fg-subtle underline">
          Back to HQ
        </Link>
      </main>
    );
  }

  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from('consultation_requests')
    .select(
      'id, name, email, company, request_type, topic, details, budget_band, preferred_times, timezone, status, internal_notes, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(300);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="border-b border-line pb-8">
        <Link
          href="/"
          className="text-label uppercase text-fg-subtle hover:text-fg-muted"
        >
          ← HQ
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-fg">Requests</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
          Consultations, meetings, help, and collaboration pitches from the public site. Email
          notifications are not wired yet — check here, or watch this page until Zoho is
          connected.
        </p>
      </header>

      <div className="mt-10">
        <ConsultsClient initial={(data ?? []) as unknown as ConsultRow[]} />
      </div>
    </main>
  );
}
