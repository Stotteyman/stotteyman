import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getActor } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import LiveControlClient from './LiveControlClient';

export const metadata: Metadata = { title: 'Live', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function LiveControlPage() {
  const actor = await getActor();
  if (!actor) redirect('/no-access');
  if (!actor.permissions.has('live.manage')) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24">
        <p className="text-sm text-white/60">You do not have permission to manage the stream.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-white/40 underline">
          Back to HQ
        </Link>
      </main>
    );
  }

  const admin = createSupabaseServiceClient();
  const { data: settings } = await admin
    .from('live_settings')
    .select('*')
    .eq('id', true)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="border-b border-white/10 pb-8">
        <Link href="/" className="text-xs uppercase tracking-[0.3em] text-white/40 hover:text-white/70">
          ← HQ
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-white">Live</h1>
        <p className="mt-3 text-sm text-white/60">
          Privacy, invite links, and OBS control for stotteyman.com/live.
        </p>
      </header>

      <div className="mt-12">
        <LiveControlClient initialSettings={settings ?? null} />
      </div>
    </main>
  );
}
