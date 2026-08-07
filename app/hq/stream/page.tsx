import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getActor } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import StreamControlClient from './StreamControlClient';

export const metadata: Metadata = {
  title: 'Stream',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function StreamControlPage() {
  const actor = await getActor();
  if (!actor) redirect('/no-access');
  // Belt and braces: middleware gates /hq, but a page rendering overlay keys must
  // never rely solely on an upstream check.
  if (!actor.permissions.has('stream.manage') && !actor.permissions.has('stream.moderate')) {
    redirect('/no-access');
  }

  const admin = createSupabaseServiceClient();
  const [{ data: settings }, { data: sources }] = await Promise.all([
    admin.from('stream_settings').select('*').eq('id', true).maybeSingle(),
    admin.from('stream_chat_sources').select('*').order('sort_order'),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stotteyman.com';

  return (
    <StreamControlClient
      initialSettings={settings}
      initialSources={sources ?? []}
      siteUrl={siteUrl}
      canManage={actor.permissions.has('stream.manage')}
    />
  );
}
