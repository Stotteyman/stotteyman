import { NextResponse } from 'next/server';

import { notifyNewQuestion } from '@/lib/ama/notify';
import { markExpired, markNotified, markPaid } from '@/lib/ama/store';
import { verifyStripeSignature } from '@/lib/stream/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook for Ask Me Anything. The only thing that may mark a question paid.
 *
 * Point a Stripe endpoint at https://stotteyman.com/api/ama/webhook/ — WITH the
 * trailing slash. `trailingSlash: true` turns the bare path into a 308, and Stripe
 * records a redirect as a delivery failure rather than following it.
 *
 * Reads the RAW body via `request.text()`: the signature covers the exact bytes Stripe
 * sent, and re-serialising a parsed object changes key order and never matches.
 */
export async function POST(request: Request) {
  const raw = await request.text();

  // Its own signing secret: Stripe issues one per endpoint, and this is the second
  // endpoint on the account. Falls back to the shared one only so a single-endpoint
  // setup still works — it does not fall back to "no secret", which stays a rejection.
  const verdict = verifyStripeSignature(
    raw,
    request.headers.get('stripe-signature'),
    300,
    process.env.AMA_STRIPE_WEBHOOK_SECRET
  );
  if (!verdict.ok) {
    console.warn('[ama/webhook] rejected:', verdict.reason);
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
  const amaId = metadata.ama_id;
  if (!amaId) return NextResponse.json({ received: true });

  switch (event.type) {
    case 'checkout.session.completed': {
      // A completed session paid by an async method is not money yet, and buzzing a
      // phone for it would be a lie.
      if (object.payment_status !== 'paid') break;
      await confirm(amaId, object);
      break;
    }

    case 'checkout.session.async_payment_succeeded': {
      await confirm(amaId, object);
      break;
    }

    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      await markExpired(amaId);
      break;
    }

    default:
      // Acknowledged and ignored. A non-200 would make Stripe retry events we do not
      // subscribe to caring about.
      break;
  }

  return NextResponse.json({ received: true });
}

async function confirm(amaId: string, object: Record<string, unknown>) {
  const details = (object.customer_details ?? {}) as { email?: string };

  // Returns null when the row was already out of `pending` — i.e. this is a Stripe
  // redelivery. Everything below is skipped, so no second notification fires.
  const row = await markPaid(amaId, {
    providerRef: typeof object.id === 'string' ? object.id : null,
    email: details.email ?? null,
  });
  if (!row) return;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stotteyman.com';
  const hq = process.env.NEXT_PUBLIC_HQ_URL ?? 'https://hq.stotteyman.com';

  const result = await notifyNewQuestion({
    question: row.question,
    askerName: row.asker_name,
    askerEmail: row.asker_email,
    amountCents: row.amount_cents,
    answerUrl: `${site}/ama/q/${row.public_token}/`,
    hqUrl: `${hq}/ama`,
  });

  // Only stamp notified_at if something actually got through. A paid row with a null
  // notified_at is the signal HQ uses to flag "this one never pinged you".
  if (result.delivered.length) await markNotified(row.id);
}
