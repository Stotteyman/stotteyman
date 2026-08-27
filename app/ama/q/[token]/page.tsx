import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import SiteShell from '@/components/SiteShell';
import { instantAnswerEnabled } from '@/lib/ama/instant';
import { findByToken } from '@/lib/ama/store';

import AnswerClient, { type PublicQuestion } from './AnswerClient';

/**
 * The private page for one question, addressed by its token.
 *
 * `noindex, nofollow` is not decoration. The token lands in the Stripe success URL and
 * from there into browser history, referrers and anything else that reads a URL — the
 * one thing that must not happen is a search engine indexing somebody's question and
 * the answer to it.
 */
export const metadata: Metadata = {
  title: 'Your question',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default async function AmaAnswerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const row = await findByToken(token);
  if (!row) notFound();

  const initial: PublicQuestion = {
    question: row.question,
    status: row.status,
    askerName: row.asker_name,
    amountCents: row.amount_cents,
    answer: row.answer,
    answeredAt: row.answered_at,
    instantAnswer: row.instant_answer,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };

  const answered = row.status === 'answered';

  return (
    <SiteShell
      eyebrow="Ask me anything"
      title={answered ? 'Here is your answer.' : 'Your question is in.'}
      intro={
        answered
          ? 'Keep this link — it stays live, so you can come back to the answer whenever you need it.'
          : 'This page is yours. It updates itself the moment I answer, so you can leave it open or come back to it later.'
      }
      action={
        <Link
          href="/ama/"
          className="rounded-full border border-line bg-surface px-5 py-2 font-mono text-label uppercase text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          Ask another
        </Link>
      }
    >
      <AnswerClient token={token} initial={initial} instantEnabled={instantAnswerEnabled()} />
    </SiteShell>
  );
}
