import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getActor } from '@/lib/hq/auth';
import { COLLECTIONS } from '@/lib/hq/collections';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import ContentClient from './ContentClient';

export const metadata: Metadata = { title: 'Content', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const actor = await getActor();
  if (!actor) redirect('/no-access');
  if (!actor.permissions.has('content.write')) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24">
        <p className="text-sm text-fg-muted">You do not have permission to edit content.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-fg-subtle underline">
          Back to HQ
        </Link>
      </main>
    );
  }

  const admin = createSupabaseServiceClient();
  const { data: copy } = await admin
    .from('site_copy')
    .select('key, value, label, section, multiline, sort_order')
    .order('section')
    .order('sort_order');

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="border-b border-line pb-8">
        <Link
          href="/"
          className="text-label uppercase text-fg-subtle hover:text-fg-muted"
        >
          ← HQ
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-fg">Content</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
          Everything written on the public site — headlines, body copy, projects, services,
          writing, events, and links. Edits go live without a deploy.
        </p>
      </header>

      <div className="mt-10">
        <ContentClient
          collections={COLLECTIONS}
          copy={
            (copy ?? []) as unknown as {
              key: string;
              value: string;
              label: string;
              section: string;
              multiline: boolean;
              sort_order: number;
            }[]
          }
        />
      </div>
    </main>
  );
}
