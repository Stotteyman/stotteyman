import { NextResponse } from 'next/server';

import { createDonation } from '@/lib/stream/donations';
import { getStreamSettings } from '@/lib/stream/server';
import { stripeConfigured, stripePost } from '@/lib/stream/stripe';
import { lookupYouTubeVideo, parseYouTubeId } from '@/lib/stream/youtube';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_CENTS = 100;
const MAX_CENTS = 500_000; // $5,000 — a sane ceiling for a card donation

/**
 * Starts a Stripe Checkout session for a stream donation.
 *
 * The donation row is written BEFORE the session exists, in `pending`, and the
 * webhook later flips it to `confirmed`. Doing it in that order means a payment
 * that succeeds while the browser closes still has a row for the webhook to find —
 * the reverse order loses the donor's message and song request entirely.
 */
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: 'Card donations are not switched on yet. Use CashApp or crypto below.' },
      { status: 503 }
    );
  }

  let body: {
    amount?: number;
    name?: string;
    message?: string;
    songRequest?: boolean;
    youtubeUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const settings = await getStreamSettings();

  const amountCents = Math.round(Number(body.amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
    return NextResponse.json(
      { error: `Enter an amount between $${MIN_CENTS / 100} and $${MAX_CENTS / 100}.` },
      { status: 400 }
    );
  }

  const donorName = String(body.name ?? '').trim().slice(0, 60) || 'Anonymous';
  const message = String(body.message ?? '').trim().slice(0, 300);

  // ── song request validation ──────────────────────────────────────────────
  const wantsSong = Boolean(body.songRequest);
  let videoId: string | null = null;
  let videoTitle: string | null = null;

  if (wantsSong) {
    if (!settings.songs_enabled) {
      return NextResponse.json({ error: 'Song requests are closed right now.' }, { status: 400 });
    }
    if (amountCents < settings.songs_min_cents) {
      return NextResponse.json(
        {
          error: `Song requests start at $${(settings.songs_min_cents / 100).toFixed(2)}.`,
        },
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

  const donation = await createDonation({
    source: 'stripe',
    status: 'pending',
    amountCents,
    donorName,
    message: message || null,
    isSongRequest: wantsSong,
    youtubeUrl: wantsSong ? String(body.youtubeUrl ?? '') : null,
    youtubeVideoId: videoId,
    youtubeTitle: videoTitle,
  });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    const session = await stripePost<{ id: string; url: string }>('/v1/checkout/sessions', {
      mode: 'payment',
      success_url: `${origin}/donate?thanks=1`,
      cancel_url: `${origin}/donate?cancelled=1`,
      // The donor's email is needed for a receipt but never shown on stream.
      billing_address_collection: 'auto',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: wantsSong ? 'Song request' : 'Stream donation',
              description: wantsSong && videoTitle ? videoTitle.slice(0, 300) : undefined,
            },
          },
        },
      ],
      // The webhook trusts this and nothing else to identify the donation.
      metadata: { donation_id: donation.id },
      payment_intent_data: { metadata: { donation_id: donation.id } },
    });

    const admin = createSupabaseServiceClient();
    await admin
      .from('stream_donations')
      .update({ provider_ref: session.id })
      .eq('id', donation.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Leave the pending row: it is the only record that someone tried, and HQ
    // shows pending donations so a failed checkout is visible rather than silent.
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not start checkout' },
      { status: 502 }
    );
  }
}
