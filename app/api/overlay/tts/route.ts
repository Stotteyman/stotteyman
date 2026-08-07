import { NextResponse } from 'next/server';

import { synthesise } from '@/lib/stream/edge-tts';
import {
  buildSpokenText,
  decideTts,
  getTtsAccounts,
  OverlayAuthError,
  requireOverlayKey,
  type ChatAuthor,
} from '@/lib/stream/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLATFORMS = new Set(['kick', 'twitch', 'youtube']);

/**
 * Speak one chat message.
 *
 * The eligibility decision is made here rather than in the overlay: the page is
 * reachable by anyone holding the URL, so a client-side rule would be advisory
 * only. Returns 204 when a message is not eligible — the overlay treats that as
 * "carry on", not as an error.
 */
export async function POST(request: Request) {
  let settings;
  try {
    settings = await requireOverlayKey(request);
  } catch (err) {
    if (err instanceof OverlayAuthError) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Settings unavailable' }, { status: 500 });
  }

  let body: {
    platform?: string;
    username?: string;
    badges?: string[];
    text?: string;
    kind?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const text = String(body.text ?? '').slice(0, 500);
  if (!text.trim()) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  let spoken: string;

  if (body.kind === 'alert') {
    // A donation message is read because it was paid for, so it does not go
    // through the chat allow/deny rules at all — those gate who may use the
    // stream's voice for free. The blocked-word list still applies: paying does
    // not buy the right to put anything through the speakers.
    if (!settings.alerts_enabled || !settings.alerts_read_message) {
      return new NextResponse(null, { status: 204, headers: { 'X-Tts-Skipped': 'alerts muted' } });
    }
    const lower = text.toLowerCase();
    if (settings.tts_blocked_words.some((w) => w && lower.includes(w.toLowerCase()))) {
      return new NextResponse(null, { status: 204, headers: { 'X-Tts-Skipped': 'blocked word' } });
    }
    spoken = text.replace(/https?:\/\/\S+/gi, ' link ').slice(0, settings.tts_max_chars);
  } else {
    const platform = String(body.platform ?? '');
    const username = String(body.username ?? '').slice(0, 80);
    if (!PLATFORMS.has(platform) || !username) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const author: ChatAuthor = {
      platform: platform as ChatAuthor['platform'],
      username,
      badges: Array.isArray(body.badges) ? body.badges.map(String).slice(0, 20) : [],
    };

    const accounts = await getTtsAccounts();
    const decision = decideTts(settings, author, text, accounts);
    if (!decision.allowed) {
      // 204 carries the reason in a header for debugging without a body the overlay
      // would have to parse on the happy-path-adjacent case.
      return new NextResponse(null, { status: 204, headers: { 'X-Tts-Skipped': decision.reason } });
    }
    spoken = buildSpokenText(settings, username, text);
  }

  try {
    const audio = await synthesise(spoken, {
      voice: settings.tts_voice,
      rate: Number(settings.tts_rate),
      volume: Number(settings.tts_volume),
    });

    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    // 502 rather than 500: the overlay falls back to the browser voice on this,
    // and it must be able to tell "synthesis failed" from "you may not speak".
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Synthesis failed' },
      { status: 502 }
    );
  }
}
