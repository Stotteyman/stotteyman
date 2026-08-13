'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Wizard, { Choice, ReviewRow, type WizardStep } from '@/components/wizard/Wizard';

/**
 * On-stream support flow.
 *
 * Two rails behind one flow. Card goes through Stripe Checkout and confirms itself, so
 * the alert fires without anyone touching anything. Cash App and crypto have no webhook
 * at all, so those submissions are a *claim* — recorded as pending and shown on stream
 * only after Stotteyman confirms the money landed. The copy says so plainly rather than
 * implying the alert is instant.
 *
 * Rebuilt as a wizard from a single stacked form. The old form showed the song-request
 * minimum, the card rail and the "I already sent it" rail all at once, so the most
 * common mistake was paying by Cash App and then also clicking Donate by card. Picking
 * the rail is now its own step and the review screen names it before anything happens.
 */

type Options = {
  cardEnabled: boolean;
  songsEnabled: boolean;
  songsMinCents: number;
  alertsMinCents: number;
};

const PRESETS = [5, 10, 25, 50];

type Rail = 'card' | 'cashapp' | 'crypto';

export default function DonateForm() {
  const [options, setOptions] = useState<Options | null>(null);
  const [amount, setAmount] = useState('10');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [songRequest, setSongRequest] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [rail, setRail] = useState<Rail>('card');
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    // Note the trailing slash: `trailingSlash: true` turns a bare /api/... into a 308.
    fetch('/api/donate/options/')
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => setOptions(null));

    // Stripe sends the donor back here with ?thanks=1.
    const params = new URLSearchParams(window.location.search);
    if (params.get('thanks')) setDone('Thank you — your donation is on its way to the stream.');
    if (params.get('cancelled')) {
      setError('Checkout was cancelled. Nothing was charged.');
      setState('error');
    }
  }, []);

  const songMin = (options?.songsMinCents ?? 300) / 100;
  const amountNumber = Number(amount);
  const songsOff = options ? !options.songsEnabled : false;
  const cardOff = options ? !options.cardEnabled : false;

  const RAILS = useMemo(
    () =>
      [
        {
          value: 'card' as const,
          label: cardOff ? 'Card — not switched on' : 'Pay by card',
          hint: cardOff
            ? 'Card donations are off right now. Use one of the options below.'
            : 'Stripe Checkout. Confirms itself, so the alert fires immediately.',
        },
        {
          value: 'cashapp' as const,
          label: 'I already sent Cash App',
          hint: 'Recorded as a claim — it reaches the stream once payment is confirmed.',
        },
        {
          value: 'crypto' as const,
          label: 'I already sent crypto',
          hint: 'Same as above: confirmed by hand before it shows on screen.',
        },
      ] as const,
    [cardOff]
  );

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Amount',
        heading: 'How much?',
        hint: 'Whatever you like — the amount is never shown as a leaderboard.',
        body: (
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`flex-1 rounded-lg border px-4 py-3 font-mono text-body-sm transition-colors duration-fast ${
                    amount === String(preset)
                      ? 'border-accent-line bg-accent-soft text-accent'
                      : 'border-line bg-bg text-fg-subtle hover:border-line-strong'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <label className="grid gap-2">
              <span className="font-mono text-label uppercase text-fg-subtle">
                Or an exact amount (USD)
              </span>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg border border-line bg-bg px-4 py-3 font-mono text-body-sm text-fg outline-none focus:border-accent-line"
              />
            </label>
          </div>
        ),
        validate: () =>
          Number.isFinite(amountNumber) && amountNumber >= 1 ? null : 'Enter $1 or more.',
      },
      {
        title: 'Message',
        heading: 'What should the stream see?',
        hint: 'Your name and message appear on screen live, and the message is read aloud.',
        body: (
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="font-mono text-label uppercase text-fg-subtle">
                Name shown on stream
              </span>
              <input
                type="text"
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous if you leave it blank"
                className="rounded-lg border border-line bg-bg px-4 py-3 text-body-sm text-fg outline-none placeholder:text-fg-faint focus:border-accent-line"
              />
            </label>
            <label className="grid gap-2">
              <span className="font-mono text-label uppercase text-fg-subtle">Message</span>
              <textarea
                maxLength={300}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Read aloud on stream. 300 characters."
                className="resize-none rounded-lg border border-line bg-bg px-4 py-3 text-body-sm text-fg outline-none placeholder:text-fg-faint focus:border-accent-line"
              />
              <span className="text-body-sm text-fg-faint">{message.length} / 300</span>
            </label>
          </div>
        ),
      },
      {
        title: 'Song',
        heading: 'Want a song in the queue?',
        hint: songsOff
          ? undefined
          : `Requests start at $${songMin.toFixed(2)} and play in the order they land.`,
        body: songsOff ? (
          <p className="rounded-lg border border-line bg-bg px-4 py-3 text-body-sm text-fg-muted">
            Song requests are switched off at the moment. Skip this step.
          </p>
        ) : (
          <div className="grid gap-5">
            <Choice
              options={[
                { value: 'no', label: 'No thanks', hint: 'Just the message' },
                {
                  value: 'yes',
                  label: 'Add a song',
                  hint: `$${songMin.toFixed(2)} minimum`,
                },
              ]}
              value={songRequest ? 'yes' : 'no'}
              onChange={(v) => setSongRequest(v === 'yes')}
            />
            {songRequest ? (
              <label className="grid gap-2">
                <span className="font-mono text-label uppercase text-fg-subtle">YouTube link</span>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className="rounded-lg border border-line bg-bg px-4 py-3 font-mono text-body-sm text-fg outline-none placeholder:text-fg-faint focus:border-accent-line"
                />
              </label>
            ) : null}
          </div>
        ),
        validate: () => {
          if (songsOff || !songRequest) return null;
          if (amountNumber < songMin) return `Song requests start at $${songMin.toFixed(2)}.`;
          if (!youtubeUrl.trim()) return 'Paste the YouTube link for your song.';
          return null;
        },
      },
      {
        title: 'Payment',
        heading: 'How are you sending it?',
        body: <Choice options={RAILS} value={rail} onChange={setRail} columns={1} />,
        validate: () =>
          rail === 'card' && cardOff
            ? 'Card donations are off right now — pick Cash App or crypto.'
            : null,
      },
    ],
    [
      RAILS,
      amount,
      amountNumber,
      cardOff,
      message,
      name,
      rail,
      songMin,
      songRequest,
      songsOff,
      youtubeUrl,
    ]
  );

  const submit = useCallback(async () => {
    setError('');
    setState('sending');

    try {
      const endpoint = rail === 'card' ? '/api/donate/checkout/' : '/api/donate/manual/';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNumber,
          name: name.trim(),
          message: message.trim(),
          songRequest: songRequest && !songsOff,
          youtubeUrl: youtubeUrl.trim(),
          method: rail === 'card' ? undefined : rail,
        }),
      });
      const data = (await res.json()) as { error?: string; url?: string; message?: string };

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        setState('error');
        return;
      }
      if (rail === 'card' && data.url) {
        window.location.href = data.url;
        return;
      }
      setDone(data.message ?? 'Recorded — thank you.');
      setState('idle');
    } catch {
      setError('Network error. Try again.');
      setState('error');
    }
  }, [amountNumber, message, name, rail, songRequest, songsOff, youtubeUrl]);

  if (done) {
    return (
      <div className="rounded-xl border border-ok/30 bg-ok/10 p-8 md:p-10">
        <p className="font-mono text-label uppercase text-ok">Thank you</p>
        <h2 className="mt-4 text-display-md font-medium text-fg">{done}</h2>
        {rail !== 'card' ? (
          <p className="mt-4 max-w-prose text-body text-fg-muted">
            Because Cash App and crypto have no automatic confirmation, this shows on stream
            once Stotteyman has checked the payment landed — usually the same session.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Wizard
      steps={steps}
      state={state}
      error={error}
      onSubmit={submit}
      submitLabel={rail === 'card' ? 'Continue to checkout' : 'Send it to the stream'}
      submittingLabel={rail === 'card' ? 'Opening checkout…' : 'Sending…'}
      aside={
        <div className="rounded-lg border border-line bg-bg-raised p-4">
          <p className="font-mono text-label uppercase text-fg-subtle">Your donation</p>
          <p className="mt-3 font-mono text-display-md text-fg">
            ${Number.isFinite(amountNumber) ? amountNumber.toFixed(2) : '—'}
          </p>
          <p className="mt-2 text-body-sm text-fg-subtle">
            {songRequest && !songsOff ? 'With a song request' : 'Message only'}
          </p>
        </div>
      }
      review={
        <dl>
          <ReviewRow
            label="Amount"
            value={`$${Number.isFinite(amountNumber) ? amountNumber.toFixed(2) : '0.00'}`}
          />
          <ReviewRow label="Name on stream" value={name.trim() || 'Anonymous'} />
          <ReviewRow label="Message" value={message.trim()} />
          <ReviewRow
            label="Song request"
            value={songRequest && !songsOff ? youtubeUrl.trim() : 'None'}
          />
          <ReviewRow label="Paying by" value={RAILS.find((r) => r.value === rail)?.label} />
        </dl>
      }
    />
  );
}
