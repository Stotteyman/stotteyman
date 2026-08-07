import { NextResponse } from 'next/server';

import { createDonation } from '@/lib/stream/donations';
import { getStreamSettings } from '@/lib/stream/server';
import { lookupYouTubeVideo, parseYouTubeId } from '@/lib/stream/youtube';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Records a CashApp or crypto donation the donor says they have sent.
 *
 * Neither rail has a webhook, so nothing here proves a payment happened. The row
 * lands in `pending` and NOTHING reaches the stream until a human approves it in
 * HQ — this endpoint is a claim, not a confirmation, and is treated as such.
 */
export async function POST(request: Request) {
  let body: {
    amount?: number;
    name?: string;
    message?: string;
    songRequest?: boolean;
    youtubeUrl?: string;
    method?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const method = body.method === 'crypto' ? 'crypto' : 'cashapp';
  const amountCents = Math.round(Number(body.amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > 500_000) {
    return NextResponse.json({ error: 'Enter the amount you sent.' }, { status: 400 });
  }

  const admin = createSupabaseServiceClient();

  // Anyone can post here, so cap the unreviewed backlog. Without this a bored
  // visitor can bury real donations under a thousand fake ones.
  const { count } = await admin
    .from('stream_donations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .in('source', ['cashapp', 'crypto'])
    .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

  if ((count ?? 0) >= 20) {
    return NextResponse.json(
      { error: 'Too many unconfirmed claims right now. Try again shortly.' },
      { status: 429 }
    );
  }

  const settings = await getStreamSettings();
  const wantsSong = Boolean(body.songRequest);
  let videoId: string | null = null;
  let videoTitle: string | null = null;

  if (wantsSong) {
    if (!settings.songs_enabled) {
      return NextResponse.json({ error: 'Song requests are closed right now.' }, { status: 400 });
    }
    if (amountCents < settings.songs_min_cents) {
      return NextResponse.json(
        { error: `Song requests start at $${(settings.songs_min_cents / 100).toFixed(2)}.` },
        { status: 400 }
      );
    }
    videoId = parseYouTubeId(String(body.youtubeUrl ?? ''));
    if (!videoId) {
      return NextResponse.json({ error: 'That does not look like a YouTube link.' }, { status: 400 });
    }
    const video = await lookupYouTubeVideo(videoId);
    if (!video) {
      return NextResponse.json(
        { error: 'That video is private, deleted, or not playable. Try another link.' },
        { status: 400 }
      );
    }
    videoTitle = video.title;
  }

  await createDonation({
    source: method,
    status: 'pending',
    amountCents,
    donorName: String(body.name ?? '').trim().slice(0, 60) || 'Anonymous',
    message: String(body.message ?? '').trim().slice(0, 300) || null,
    isSongRequest: wantsSong,
    youtubeUrl: wantsSong ? String(body.youtubeUrl ?? '') : null,
    youtubeVideoId: videoId,
    youtubeTitle: videoTitle,
  });

  return NextResponse.json({
    ok: true,
    pending: true,
    message: 'Thanks — it will show on stream once Stotteyman confirms it landed.',
  });
}
