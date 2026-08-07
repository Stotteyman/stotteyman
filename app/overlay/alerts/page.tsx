import type { Metadata } from 'next';

import AlertsOverlayClient from './AlertsOverlayClient';

export const metadata: Metadata = {
  title: 'Alerts overlay',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Donation alert browser source: /overlay/alerts?key=<overlay key>
 *
 * Unlike the chat overlay this one always produces audio when it has any, so add
 * it to OBS only — the phone copy would fire the same alert a second time.
 */
export default async function AlertsOverlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.key;
  const key = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');

  return <AlertsOverlayClient overlayKey={key} />;
}
