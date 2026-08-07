import { NextResponse } from 'next/server';

import { confirmDonation } from '@/lib/stream/donations';
import { verifyStripeSignature } from '@/lib/stream/stripe';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook: the only thing that may confirm a card donation.
 *
 * Reads the RAW body — `request.text()`, never `request.json()` — because the
 * signature is computed over the exact bytes Stripe sent. Re-serialising the
 * parsed object changes key order and whitespace and the signature never matches.
 */
export async function POST(request: Request) {
  const raw = await request.text();

  const verdict = verifyStripeSignature(raw, request.headers.get('stripe-signature'));
  if (!verdict.ok) {
    // 400, and log nothing back to the caller beyond the reason: an unsigned
    // request must never reach the donation logic, configured or not.
    console.warn('[donate/webhook] rejected:', verdict.reason);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const object = event.data?.object ?? {};
  const metadata = (object.metadata ?? {}) as Record<string, string>;
  const donationId = metadata.donation_id;

  switch (event.type) {
    case 'checkout.session.completed': {
      // `payment_status` matters: a completed session with an async payment method
      // is not money yet, and firing an alert for it would be a lie on stream.
      if (object.payment_status !== 'paid') break;
      if (donationId) await confirmDonation(donationId);
      break;
    }

    case 'checkout.session.async_payment_succeeded': {
      if (donationId) await confirmDonation(donationId);
      break;
    }

    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      if (donationId) {
        const admin = createSupabaseServiceClient();
        await admin
          .from('stream_donations')
          .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
          .eq('id', donationId)
          .eq('status', 'pending');
      }
      break;
    }

    default:
      // Every other event type is acknowledged and ignored. Returning non-200
      // would make Stripe retry events we simply do not care about.
      break;
  }

  return NextResponse.json({ received: true });
}
