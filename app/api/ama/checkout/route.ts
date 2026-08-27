import { NextResponse } from 'next/server';

import { amaPriceCents, createQuestion, hashIp, recentFromIp } from '@/lib/ama/store';
import { stripeConfigured, stripePost } from '@/lib/stream/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_QUESTION = 10;
const MAX_QUESTION = 2000;
/** Questions started from one address per hour. Checkout is free to open; this is not. */
const MAX_PER_HOUR = 6;

/**
 * Opens Stripe Checkout for one question.
 *
 * The question row is written BEFORE the session exists and sits in `pending` until
 * the signed webhook flips it. Same ordering as donations, for the same reason: if the
 * browser dies between paying and redirecting, the money still has a row to attach to
 * and the question is not lost.
 */
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: 'Card payments are not switched on yet. Use the contact page and I will reply free.' },
      { status: 503 }
    );
  }

  let body: {
    question?: string;
    name?: string;
    email?: string;
    website?: string;
    elapsedMs?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  // Honeypot + dwell time. Bots fill every field they can see and submit instantly;
  // a human cannot read the page and type a question in under three seconds.
  if (body.website) return NextResponse.json({ error: 'Rejected.' }, { status: 400 });
  if (Number(body.elapsedMs) < 3000) {
    return NextResponse.json({ error: 'That was too quick — try again.' }, { status: 400 });
  }

  const question = String(body.question ?? '').trim();
  if (question.length < MIN_QUESTION) {
    return NextResponse.json(
      { error: 'Write a bit more — a question needs at least a sentence.' },
      { status: 400 }
    );
  }
  if (question.length > MAX_QUESTION) {
    return NextResponse.json(
      { error: `Keep it under ${MAX_QUESTION} characters.` },
      { status: 400 }
    );
  }

  const email = String(body.email ?? '').trim().slice(0, 200);
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: 'A real email address, please — that is where the answer goes.' },
      { status: 400 }
    );
  }

  const name = String(body.name ?? '').trim().slice(0, 60) || null;

  // Netlify puts the real client address in x-nf-client-connection-ip; x-forwarded-for
  // is a list and its first entry is the one the platform wrote, not the caller's claim.
  const ip =
    request.headers.get('x-nf-client-connection-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    null;
  const ipHash = hashIp(ip);

  if ((await recentFromIp(ipHash)) >= MAX_PER_HOUR) {
    return NextResponse.json(
      { error: 'That is a lot of questions in one hour. Try again shortly.' },
      { status: 429 }
    );
  }

  const amountCents = amaPriceCents();
  const row = await createQuestion({
    question,
    askerName: name,
    askerEmail: email,
    amountCents,
    ipHash,
  });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    const session = await stripePost<{ id: string; url: string }>('/v1/checkout/sessions', {
      mode: 'payment',
      // trailingSlash is on, so a bare path here would land the payer on a 308 first.
      success_url: `${origin}/ama/q/${row.public_token}/?paid=1`,
      cancel_url: `${origin}/ama/?cancelled=1`,
      customer_email: email,
      // The webhook has only this to work with — it never sees the request body.
      metadata: { ama_id: row.id },
      payment_intent_data: {
        metadata: { ama_id: row.id },
        description: 'Ask Me Anything — one question',
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: 'One question, answered personally',
              description: question.slice(0, 300),
            },
          },
        },
      ],
    });

    return NextResponse.json({ url: session.url, token: row.public_token });
  } catch (e) {
    console.error('[ama/checkout]', e);
    return NextResponse.json(
      { error: 'Could not start checkout. Nothing was charged — try again in a moment.' },
      { status: 502 }
    );
  }
}
