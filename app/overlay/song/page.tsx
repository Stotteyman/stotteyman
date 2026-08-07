import type { Metadata } from 'next';

import SongOverlayClient from './SongOverlayClient';

export const metadata: Metadata = {
  title: 'Song overlay',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** "Now playing" browser source: /overlay/song?key=<overlay key> — silent, safe anywhere. */
export default async function SongOverlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.key;
  const key = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');

  return <SongOverlayClient overlayKey={key} />;
}
