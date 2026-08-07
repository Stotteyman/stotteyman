import type { Metadata } from 'next';

import ChatOverlayClient from './ChatOverlayClient';

export const metadata: Metadata = {
  title: 'Chat overlay',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Unified chat browser source.
 *
 *   /overlay/chat?key=<overlay key>          visual only
 *   /overlay/chat?key=<overlay key>&tts=1    visual + spoken
 *
 * TTS is opt-in per URL on purpose. The same overlay is loaded twice — once by OBS
 * and once by Moblin on the phone — and if both spoke, every message would be read
 * twice, out of sync. Only the copy whose audio actually reaches the broadcast
 * (OBS) should carry &tts=1.
 */
export default async function ChatOverlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.key;
  const key = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
  const tts = params.tts;
  const ttsRequested = (Array.isArray(tts) ? tts[0] : tts) === '1';

  return <ChatOverlayClient overlayKey={key} ttsRequested={ttsRequested} />;
}
