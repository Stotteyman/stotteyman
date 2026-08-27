import { NextResponse } from 'next/server';

import { instantAnswerEnabled, lookupInstantAnswer } from '@/lib/ama/instant';
import { findByToken, saveInstantAnswer } from '@/lib/ama/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The free "while you wait" answer.
 *
 * Gated on a paid row, not just a valid token: a pending row means checkout was never
 * completed, and running outbound searches for someone who has not paid turns this
 * endpoint into an open search proxy anyone can point at anything.
 *
 * Cached on the row after the first call, so refreshing the page — or a second tab —
 * costs nothing and shows the same text rather than a different one.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  // Dark until the matching is good enough — see instantAnswerEnabled(). Enforced here
  // and not only in the UI, so the endpoint cannot be driven by hand while it is off.
  if (!instantAnswerEnabled()) {
    return NextResponse.json({ error: 'Instant answers are not switched on yet.' }, { status: 503 });
  }

  const { token } = await params;
  const row = await findByToken(token);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (row.status !== 'paid' && row.status !== 'answered') {
    return NextResponse.json(
      { error: 'This question has not been paid for yet.' },
      { status: 402 }
    );
  }

  if (row.instant_answer) {
    return NextResponse.json({ instantAnswer: row.instant_answer, cached: true });
  }

  const answer = await lookupInstantAnswer(row.question);
  if (!answer) {
    // A real outcome, not an error: plenty of good questions have no encyclopedia
    // entry, and the paid answer is still coming.
    return NextResponse.json({ instantAnswer: null, cached: false });
  }

  await saveInstantAnswer(row.id, answer);
  return NextResponse.json({ instantAnswer: answer, cached: false });
}
