'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { InstantAnswer } from '@/lib/ama/store';

/**
 * The asker's private page for one question.
 *
 * Two jobs: show the answer the moment it lands without anyone refreshing, and offer
 * the free machine lookup for people who do not want to wait at all.
 *
 * Polling, not a realtime subscription, on purpose. Supabase realtime would mean
 * shipping a channel subscription and an RLS policy that lets a stranger read this
 * table — see the migration comment. A ten-second poll against a route handler that
 * already checks the token is both simpler and strictly safer.
 */

export type PublicQuestion = {
  question: string;
  status: 'pending' | 'paid' | 'answered' | 'refunded' | 'expired';
  askerName: string | null;
  amountCents: number;
  answer: string | null;
  answeredAt: string | null;
  instantAnswer: InstantAnswer | null;
  paidAt: string | null;
  createdAt: string;
};

const POLL_MS = 10_000;

export default function AnswerClient({
  token,
  initial,
  instantEnabled,
}: {
  token: string;
  initial: PublicQuestion;
  /** False while the instant lookup is still being built. Shows a teaser, not a button. */
  instantEnabled: boolean;
}) {
  const [data, setData] = useState<PublicQuestion>(initial);
  const [instantState, setInstantState] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const stop = useRef(false);

  // Poll until answered. Refunded and expired are terminal too — nothing more is coming.
  useEffect(() => {
    if (['answered', 'refunded', 'expired'].includes(data.status)) {
      stop.current = true;
      return;
    }
    const id = setInterval(async () => {
      if (stop.current) return;
      try {
        const res = await fetch(`/api/ama/status/${token}/`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as PublicQuestion;
        setData(json);
      } catch {
        // A dropped poll is not worth telling anyone about; the next one will do.
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [data.status, token]);

  // "Waiting 4 minutes" is a far better wait than a spinner with no scale on it.
  useEffect(() => {
    if (!data.paidAt || data.status === 'answered') return;
    const started = new Date(data.paidAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.paidAt, data.status]);

  const pullInstant = useCallback(async () => {
    setInstantState('loading');
    try {
      const res = await fetch(`/api/ama/instant/${token}/`, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInstantState('error');
        return;
      }
      if (!json.instantAnswer) {
        setInstantState('empty');
        return;
      }
      setData((d) => ({ ...d, instantAnswer: json.instantAnswer as InstantAnswer }));
      setInstantState('idle');
    } catch {
      setInstantState('error');
    }
  }, [token]);

  const waited =
    elapsed < 60
      ? `${elapsed}s`
      : `${Math.floor(elapsed / 60)}m ${String(elapsed % 60).padStart(2, '0')}s`;

  return (
    <div className="grid gap-8">
      {/* ── The question ──────────────────────────────────────────────────── */}
      <section className="rounded-lg border border-line bg-surface p-6">
        <p className="font-mono text-label uppercase text-fg-subtle">You asked</p>
        <p className="mt-3 whitespace-pre-wrap text-body-lg leading-relaxed text-fg">
          {data.question}
        </p>
      </section>

      {/* ── Status ────────────────────────────────────────────────────────── */}
      {data.status === 'pending' ? (
        <section className="rounded-lg border border-accent-line bg-accent-soft p-6">
          <h2 className="text-sm font-semibold text-fg">Payment not completed</h2>
          <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
            This question was written but checkout was never finished, so nothing was
            charged and it is not in my queue. Ask it again from{' '}
            <a href="/ama/" className="text-accent underline">
              the ask page
            </a>
            .
          </p>
        </section>
      ) : null}

      {data.status === 'expired' ? (
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold text-fg">Checkout expired</h2>
          <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
            Stripe closed this checkout session before it was paid. Nothing was charged.
          </p>
        </section>
      ) : null}

      {data.status === 'refunded' ? (
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold text-fg">Refunded</h2>
          <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
            Your ${(data.amountCents / 100).toFixed(2)} went back to your card. It can take
            a few days to show on a statement.
          </p>
        </section>
      ) : null}

      {data.status === 'paid' ? (
        <section className="rounded-lg border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <h2 className="text-sm font-semibold text-fg">I am on it</h2>
            <span className="ml-auto font-mono text-label uppercase text-fg-subtle">
              waiting {waited}
            </span>
          </div>
          <p className="mt-4 text-body-sm leading-relaxed text-fg-muted">
            Paid, and my phone has already gone off. Usually five to ten minutes; within
            the hour during business hours. This page updates itself — leave it open, or
            come back to it later. The link works for good.
          </p>
        </section>
      ) : null}

      {/* ── The answer ────────────────────────────────────────────────────── */}
      {data.status === 'answered' && data.answer ? (
        <section className="rounded-lg border border-accent-line bg-accent-soft p-6 md:p-8">
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="font-mono text-label uppercase text-accent">My answer</p>
            {data.answeredAt ? (
              <span className="font-mono text-label uppercase text-fg-subtle">
                {new Date(data.answeredAt).toLocaleString()}
              </span>
            ) : null}
          </div>
          <div className="mt-4 whitespace-pre-wrap text-body-lg leading-relaxed text-fg">
            {data.answer}
          </div>
          <p className="mt-6 border-t border-accent-line pt-4 text-body-sm text-fg-muted">
            Follow-up on this same question? Reply to your Stripe receipt or use{' '}
            <a href="/contact/" className="text-accent underline">
              contact
            </a>{' '}
            — no charge for a follow-up on something I have already answered.
          </p>
        </section>
      ) : null}

      {/* ── Instant answer ────────────────────────────────────────────────── */}
      {data.status === 'paid' || data.status === 'answered' ? (
        <section className="rounded-lg border border-dashed border-line p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-semibold text-fg">Instant answer</h2>
            {!instantEnabled ? (
              <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-fg-faint">
                Coming soon
              </span>
            ) : null}
          </div>

          {!instantEnabled ? (
            <p className="mt-3 text-body-sm leading-relaxed text-fg-subtle">
              Soon you will be able to tap once here and get an immediate answer read out
              in my voice while the real one is being written. It is not switched on yet —
              I would rather ship it when it is actually good than have it confidently tell
              you something wrong. Your paid answer is on its way as normal.
            </p>
          ) : null}

          {instantEnabled && !data.instantAnswer && instantState !== 'loading' ? (
            <>
              <p className="mt-3 text-body-sm leading-relaxed text-fg-subtle">
                Do not want to wait? This searches the open web and shows you what is
                already out there, right now, for free. It is a machine answer — not mine —
                and it does not replace the one I am writing.
              </p>
              <button
                type="button"
                onClick={pullInstant}
                className="mt-5 rounded-full border border-line bg-surface px-5 py-2 font-mono text-label uppercase text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                Get an instant answer
              </button>
              {instantState === 'empty' ? (
                <p className="mt-4 text-body-sm text-fg-faint">
                  The web had nothing solid on this one — which is usually a sign it is a
                  question worth paying a person for. Mine is still coming.
                </p>
              ) : null}
              {instantState === 'error' ? (
                <p className="mt-4 text-body-sm text-fg-faint">
                  The lookup failed. It costs you nothing to try again.
                </p>
              ) : null}
            </>
          ) : null}

          {instantState === 'loading' ? (
            <div className="mt-5 grid gap-3" role="status" aria-live="polite">
              <div className="flex items-center gap-3 text-body-sm text-fg-muted">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
                Searching the web…
              </div>
              {/* Skeleton lines, so the wait has a shape rather than being a blank box. */}
              <div className="grid gap-2">
                {['w-full', 'w-11/12', 'w-4/5'].map((w) => (
                  <div key={w} className={`h-3 animate-pulse rounded bg-surface-hover ${w}`} />
                ))}
              </div>
            </div>
          ) : null}

          {instantEnabled && data.instantAnswer ? (
            <div className="mt-4 grid gap-4">
              {data.instantAnswer.summary ? (
                <p className="whitespace-pre-wrap text-body-sm leading-relaxed text-fg-muted">
                  {data.instantAnswer.summary}
                </p>
              ) : (
                <p className="text-body-sm leading-relaxed text-fg-subtle">
                  No single summary for this one — here is what the web points at:
                </p>
              )}

              {data.instantAnswer.links.length ? (
                <ul className="grid gap-2">
                  {data.instantAnswer.links.map((l) => (
                    <li key={l.url}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-body-sm text-fg-muted underline decoration-line underline-offset-4 hover:text-fg"
                      >
                        {l.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="border-t border-line pt-4 font-mono text-label uppercase text-fg-faint">
                Automated · {data.instantAnswer.source}
                {data.instantAnswer.sourceUrl ? (
                  <>
                    {' · '}
                    <a
                      href={data.instantAnswer.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="underline"
                    >
                      source
                    </a>
                  </>
                ) : null}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
