import { NextResponse } from 'next/server';

import { findByToken } from '@/lib/ama/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The asker's view of their own question, polled by the answer page.
 *
 * The token is the credential, so the response is projected by hand rather than
 * returned whole — `internal_notes`, `ip_hash` and `provider_ref` are on the row and
 * none of them are the asker's business.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const row = await findByToken(token);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(
    {
      question: row.question,
      status: row.status,
      askerName: row.asker_name,
      amountCents: row.amount_cents,
      answer: row.answer,
      answeredAt: row.answered_at,
      instantAnswer: row.instant_answer,
      paidAt: row.paid_at,
      createdAt: row.created_at,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
