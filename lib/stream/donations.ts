import 'server-only';

import { createSupabaseServiceClient } from '@/lib/supabase/server';

import { getStreamSettings } from './server';

/**
 * The single place a donation becomes "real".
 *
 * Both entry points funnel through `confirmDonation`: the Stripe webhook (signed,
 * automatic) and a human tapping approve on a CashApp or crypto donation in HQ.
 * Keeping one implementation means the alert, the song queue and the audit trail
 * cannot drift between the automatic and the manual path.
 */

export type DonationInput = {
  source: 'stripe' | 'cashapp' | 'crypto' | 'manual';
  amountCents: number;
  currency?: string;
  donorName?: string | null;
  donorEmail?: string | null;
  message?: string | null;
  isSongRequest?: boolean;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  youtubeTitle?: string | null;
  providerRef?: string | null;
  status?: 'pending' | 'confirmed';
};

export async function createDonation(input: DonationInput) {
  const admin = createSupabaseServiceClient();
  const { data, error } = await admin
    .from('stream_donations')
    .insert({
      source: input.source,
      status: input.status ?? 'pending',
      amount_cents: Math.max(0, Math.round(input.amountCents)),
      currency: (input.currency ?? 'usd').toLowerCase(),
      donor_name: input.donorName?.slice(0, 60) ?? null,
      donor_email: input.donorEmail?.slice(0, 200) ?? null,
      message: input.message?.slice(0, 300) ?? null,
      is_song_request: Boolean(input.isSongRequest),
      youtube_url: input.youtubeUrl ?? null,
      youtube_video_id: input.youtubeVideoId ?? null,
      youtube_title: input.youtubeTitle ?? null,
      provider_ref: input.providerRef ?? null,
    })
    .select('*')
    .single();

  if (error) throw new Error(`could not record donation: ${error.message}`);
  return data;
}

export type DonationRow = {
  id: string;
  source: string;
  status: string;
  amount_cents: number;
  currency: string;
  donor_name: string | null;
  message: string | null;
  is_song_request: boolean;
  youtube_video_id: string | null;
  youtube_title: string | null;
};

/**
 * Marks a donation confirmed and fans out to the alert bus and song queue.
 *
 * Idempotent by design: it only acts on a row still in `pending`, so a Stripe
 * webhook redelivery — which is routine, not exceptional — cannot fire a second
 * alert or queue the same song twice.
 */
export async function confirmDonation(
  donationId: string,
  reviewedBy: string | null = null
): Promise<{ confirmed: boolean; alerted: boolean; queuedSong: boolean }> {
  const admin = createSupabaseServiceClient();
  const settings = await getStreamSettings();

  // The `.eq('status','pending')` filter is the idempotency guard: a second call
  // updates zero rows and returns nothing, so everything below is skipped.
  const { data: donation } = await admin
    .from('stream_donations')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      reviewed_at: reviewedBy ? new Date().toISOString() : null,
    })
    .eq('id', donationId)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();

  if (!donation) return { confirmed: false, alerted: false, queuedSong: false };

  const row = donation as DonationRow;
  let alerted = false;
  let queuedSong = false;

  if (settings.alerts_enabled && row.amount_cents >= settings.alerts_min_cents) {
    await admin.from('stream_alerts').insert({
      kind: row.is_song_request ? 'song' : 'donation',
      donation_id: row.id,
      donor_name: row.donor_name,
      amount_cents: row.amount_cents,
      currency: row.currency,
      message: row.message,
      speak: settings.alerts_read_message && Boolean(row.message),
    });
    alerted = true;
  }

  if (
    settings.songs_enabled &&
    row.is_song_request &&
    row.youtube_video_id &&
    row.amount_cents >= settings.songs_min_cents
  ) {
    await admin.from('stream_song_queue').insert({
      donation_id: row.id,
      video_id: row.youtube_video_id,
      title: row.youtube_title,
      requested_by: row.donor_name,
      amount_cents: row.amount_cents,
      // Auto-approve is off by default: a stranger's link going straight to the
      // stream's speakers is a moderation problem waiting to happen.
      status: settings.songs_auto_approve ? 'queued' : 'pending',
    });
    queuedSong = true;
  }

  return { confirmed: true, alerted, queuedSong };
}
