import { getLiveSettings } from '@/lib/live/server';

import LiveClient from './LiveClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getLiveSettings();
  // An invite-only or hidden stream should not advertise itself to crawlers or
  // link previews — that would leak the fact and title of a private broadcast.
  const isDiscoverable = settings?.privacy === 'public' && settings?.show_on_site;

  return {
    title: isDiscoverable ? settings?.title ?? 'Live' : 'Live',
    description: isDiscoverable ? settings?.description ?? undefined : undefined,
    robots: isDiscoverable ? undefined : { index: false, follow: false },
  };
}

export default async function LivePage() {
  const settings = await getLiveSettings();

  return (
    <LiveClient
      initialTitle={settings?.title ?? 'Live'}
      initialDescription={settings?.description ?? null}
      privacy={settings?.privacy ?? 'off'}
      isLive={settings?.is_live ?? false}
      chatEnabled={settings?.chat_enabled ?? false}
    />
  );
}
