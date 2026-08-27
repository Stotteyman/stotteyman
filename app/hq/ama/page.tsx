import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { notifyConfigured } from '@/lib/ama/notify';
import { AMA_TABLE } from '@/lib/ama/store';
import { getActor } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import AmaClient, { type AmaRowView } from './AmaClient';

export const metadata: Metadata = {
  title: 'Questions',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function HqAmaPage() {
  const actor = await getActor();
  if (!actor) redirect('/no-access');
  if (!actor.permissions.has('ama.manage')) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24">
        <p className="text-sm text-fg-muted">You do not have permission to answer questions.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-fg-subtle underline">
          Back to HQ
        </Link>
      </main>
    );
  }

  const admin = createSupabaseServiceClient();
  // Paid-and-unanswered first, then everything else newest-first. Postgres sorts NULLs
  // last by default on DESC, which is exactly right here: an unpaid row has no paid_at
  // and belongs at the bottom.
  const { data } = await admin
    .from(AMA_TABLE)
    .select(
      'id, public_token, question, asker_name, asker_email, status, amount_cents, answer, answered_at, internal_notes, notified_at, paid_at, created_at'
    )
    .order('paid_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(300);

  const rows = (data ?? []) as unknown as AmaRowView[];
  const waiting = rows.filter((r) => r.status === 'paid').length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="border-b border-line pb-8">
        <Link href="/" className="text-label uppercase text-fg-subtle hover:text-fg-muted">
          ← HQ
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-fg">Questions</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
          Paid questions from <span className="text-fg">/ama</span>. The promise on that page
          is five to ten minutes, and inside the hour during business hours — publishing an
          answer here puts it on the asker&apos;s page instantly.
          {waiting > 0 ? (
            <>
              {' '}
              <span className="text-accent">
                {waiting} {waiting === 1 ? 'person is' : 'people are'} waiting.
              </span>
            </>
          ) : null}
        </p>
      </header>

      <div className="mt-10">
        <AmaClient
          initial={rows}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stotteyman.com'}
          notifyConfigured={notifyConfigured()}
        />
      </div>
    </main>
  );
}
