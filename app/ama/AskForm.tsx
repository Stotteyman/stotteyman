'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Wizard, { ReviewRow, TextArea, TextField, type WizardStep } from '@/components/wizard/Wizard';

/**
 * Ask a question, pay for it, get sent to your own answer page.
 *
 * Three steps rather than one form, for the same reason the other flows are wizards:
 * the question is the thing worth thinking about, and putting an email field and a
 * price next to it while someone is composing is how you get one-line questions.
 *
 * Nothing is charged here. This posts to /api/ama/checkout, which records the question
 * as `pending` and hands back a Stripe Checkout URL; the money and the question only
 * become real when the signed webhook says so.
 */

export default function AskForm({ priceCents, cardEnabled }: { priceCents: number; cardEnabled: boolean }) {
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Honeypot + render timestamp. Bots fill hidden fields and submit immediately.
  const honeypot = useRef('');
  const renderedAt = useRef(Date.now());

  const price = `$${(priceCents / 100).toFixed(2)}`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cancelled')) {
      setNotice('Checkout was cancelled. Nothing was charged and nothing was sent.');
    }
  }, []);

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Question',
        heading: 'What do you want to ask?',
        hint: 'Anything. Business, game servers, code, streaming, money, life — no categories, no vetting.',
        body: (
          <div className="grid gap-5">
            <TextArea
              label="Your question"
              value={question}
              onChange={setQuestion}
              rows={7}
              minLength={10}
              placeholder="Ask it the way you would ask a person. Context helps — the more I know about your situation, the more useful the answer."
            />
            <p className="rounded-lg border border-line bg-bg px-4 py-3 text-body-sm text-fg-subtle">
              One question per {price}. Follow-ups on the same thread are on me — if my
              answer raises an obvious next question, just reply.
            </p>
          </div>
        ),
        validate: () =>
          question.trim().length >= 10 ? null : 'Write at least a sentence so I can answer it properly.',
      },
      {
        title: 'You',
        heading: 'Where does the answer go?',
        hint: 'You get a private link the moment you pay. The email is a backup, and a receipt.',
        body: (
          <div className="grid gap-5">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
            <TextField
              label="Name"
              value={name}
              onChange={setName}
              autoComplete="name"
              placeholder="Optional — how you want to be addressed"
            />
            {/* Honeypot. Hidden from people, irresistible to bots. */}
            <div aria-hidden className="hidden">
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  onChange={(e) => {
                    honeypot.current = e.target.value;
                  }}
                />
              </label>
            </div>
          </div>
        ),
        validate: () =>
          /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.trim())
            ? null
            : 'A real email address — that is where the answer goes.',
      },
    ],
    [email, name, price, question]
  );

  const submit = useCallback(async () => {
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/ama/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          name,
          email,
          website: honeypot.current,
          elapsedMs: Date.now() - renderedAt.current,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) {
        setError(json.error ?? 'Could not start checkout. Nothing was charged.');
        setState('error');
        return;
      }
      // Straight to Stripe. Deliberately not a new tab: a popup blocker eating this
      // looks exactly like the button doing nothing.
      window.location.href = json.url as string;
    } catch {
      setError('Network error. Nothing was charged — try again.');
      setState('error');
    }
  }, [email, name, question]);

  return (
    <div className="grid gap-6">
      {notice ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-3 text-body-sm text-fg-muted">
          {notice}
        </p>
      ) : null}

      {!cardEnabled ? (
        <p className="rounded-lg border border-accent-line bg-accent-soft px-4 py-3 text-body-sm text-fg">
          Card payments are not switched on yet, so this cannot take your money right now.
          Use the contact page and ask for free in the meantime.
        </p>
      ) : null}

      <Wizard
        steps={steps}
        submitLabel={`Ask — ${price}`}
        submittingLabel="Opening checkout…"
        onSubmit={submit}
        state={state}
        error={error}
        review={
          <dl className="grid">
            <ReviewRow label="Your question" value={<span className="whitespace-pre-wrap">{question.trim()}</span>} />
            <ReviewRow label="Answer goes to" value={email.trim()} />
            <ReviewRow label="Name" value={name.trim()} />
            <ReviewRow label="Price" value={`${price} — one payment, no subscription`} />
            <ReviewRow
              label="Turnaround"
              value="Usually 5–10 minutes. Within the hour during business hours."
            />
          </dl>
        }
        aside={
          <div className="grid gap-3 rounded-lg border border-line bg-surface p-5">
            <p className="font-mono text-label uppercase text-fg-subtle">What happens next</p>
            <ol className="grid gap-2 text-body-sm leading-relaxed text-fg-muted">
              <li>
                <span className="text-fg">1.</span> Stripe takes the {price}.
              </li>
              <li>
                <span className="text-fg">2.</span> You land on a private page for this
                question. Bookmark it.
              </li>
              <li>
                <span className="text-fg">3.</span> My phone goes off. I write the answer
                and it appears on that page.
              </li>
            </ol>
            <p className="text-body-sm text-fg-faint">
              Nothing is charged until you complete Stripe Checkout, and the question is
              not in my queue until it is paid.
            </p>
          </div>
        }
      />
    </div>
  );
}
