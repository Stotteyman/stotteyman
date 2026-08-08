'use client';

import { useEffect, useState } from 'react';

/**
 * On-stream donation form.
 *
 * Two rails behind one form. Card goes through Stripe Checkout and confirms
 * itself, so the alert fires without anyone touching anything. CashApp and crypto
 * have no webhook at all, so those submissions are a *claim* — recorded as pending
 * and shown on stream only after Stotteyman confirms the money landed. The copy
 * says so plainly rather than implying the alert is instant.
 */

type Options = {
  cardEnabled: boolean;
  songsEnabled: boolean;
  songsMinCents: number;
  alertsMinCents: number;
};

const PRESETS = [5, 10, 25, 50];

export default function DonateForm() {
  const [options, setOptions] = useState<Options | null>(null);
  const [amount, setAmount] = useState('10');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [songRequest, setSongRequest] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [busy, setBusy] = useState<'card' | 'manual' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/donate/options/')
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => setOptions(null));

    // Stripe sends the donor back here with ?thanks=1.
    const params = new URLSearchParams(window.location.search);
    if (params.get('thanks')) setDone('Thank you — your donation is on its way to the stream.');
    if (params.get('cancelled')) setError('Checkout was cancelled. Nothing was charged.');
  }, []);

  const songMin = (options?.songsMinCents ?? 300) / 100;
  const amountNumber = Number(amount);
  const songTooCheap = songRequest && amountNumber < songMin;

  const submit = async (rail: 'card' | 'manual', method?: 'cashapp' | 'crypto') => {
    setError(null);
    setDone(null);

    if (!Number.isFinite(amountNumber) || amountNumber < 1) {
      setError('Enter an amount of $1 or more.');
      return;
    }
    if (songTooCheap) {
      setError(`Song requests start at $${songMin.toFixed(2)}.`);
      return;
    }
    if (songRequest && !youtubeUrl.trim()) {
      setError('Paste the YouTube link for your song.');
      return;
    }

    setBusy(rail);
    try {
      const endpoint = rail === 'card' ? '/api/donate/checkout/' : '/api/donate/manual/';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNumber,
          name: name.trim(),
          message: message.trim(),
          songRequest,
          youtubeUrl: youtubeUrl.trim(),
          method,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      if (rail === 'card' && data.url) {
        window.location.href = data.url;
        return;
      }
      setDone(data.message ?? 'Recorded — thank you.');
      setMessage('');
      setYoutubeUrl('');
      setSongRequest(false);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setBusy(null);
    }
  };

  const field =
    'w-full rounded-lg border border-line bg-bg-raised px-4 py-3 font-mono text-sm text-fg placeholder:text-fg-subtle focus:border-accent-line focus:outline-none';

  return (
    <div
      className="animate-fade-up w-full rounded-lg border border-line bg-surface] p-6 text-left sm:p-8"
      style={{ animationDelay: '0.15s' }}
    >
      <h2 className="text-center font-sans text-lg font-bold tracking-wider text-fg">
        SEND A MESSAGE TO THE STREAM
      </h2>
      <p className="mt-2 text-center font-mono text-[11px] leading-relaxed text-fg-subtle">
        Your name and message appear on screen live.
      </p>

      {/* amount */}
      <div className="mt-6 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(String(preset))}
            className={`flex-1 rounded-lg border px-3 py-2 font-mono text-sm transition-colors ${
              amount === String(preset)
                ? 'border-accent-line bg-accent-soft text-accent'
                : 'border-line bg-bg-raised text-fg-subtle hover:border-line-strong'
            }`}
          >
            ${preset}
          </button>
        ))}
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Amount in US dollars</span>
        <input
          type="number"
          min="1"
          step="1"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={field}
          placeholder="Amount (USD)"
        />
      </label>

      <label className="mt-3 block">
        <span className="sr-only">Your name</span>
        <input
          type="text"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
          placeholder="Your name (shown on stream)"
        />
      </label>

      <label className="mt-3 block">
        <span className="sr-only">Message</span>
        <textarea
          maxLength={300}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${field} resize-none`}
          placeholder="Message (read aloud on stream)"
        />
      </label>

      {/* song request */}
      {options?.songsEnabled && (
        <div className="mt-4 rounded-lg border border-line bg-bg-raised p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={songRequest}
              onChange={(e) => setSongRequest(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#ff4444]"
            />
            <span>
              <span className="font-sans text-sm font-semibold text-fg">
                Add my song to the request queue
              </span>
              <span className="mt-1 block font-mono text-[11px] text-fg-subtle">
                ${songMin.toFixed(2)} minimum · paste a YouTube link below
              </span>
            </span>
          </label>

          {songRequest && (
            <div className="mt-3">
              <label className="block">
                <span className="sr-only">YouTube link</span>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className={field}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
              {songTooCheap && (
                <p className="mt-2 font-mono text-[11px] text-[#ff8c00]">
                  Raise your amount to ${songMin.toFixed(2)} to request a song.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-[12px] text-red-300">
          {error}
        </p>
      )}
      {done && (
        <p className="mt-4 rounded-lg border border-[#53fc18]/30 bg-[#53fc18]/10 px-4 py-3 font-mono text-[12px] text-[#53fc18]">
          {done}
        </p>
      )}

      {/* rails */}
      {options?.cardEnabled ? (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => submit('card')}
          className="mt-5 w-full rounded-lg border border-accent-line bg-accent-soft px-5 py-3.5 font-sans text-sm font-bold tracking-wider text-accent transition-colors hover:bg-accent-soft disabled:opacity-50"
        >
          {busy === 'card' ? 'OPENING CHECKOUT…' : 'DONATE BY CARD →'}
        </button>
      ) : (
        <p className="mt-5 rounded-lg border border-line bg-bg-raised px-4 py-3 text-center font-mono text-[11px] text-fg-subtle">
          Card donations are not switched on yet — use Cash App or crypto below.
        </p>
      )}

      <div className="mt-5 border-t border-line pt-4">
        <p className="text-center font-mono text-label uppercase text-fg-subtle">
          Already sent by Cash App or crypto?
        </p>
        <p className="mt-2 text-center font-mono text-[11px] leading-relaxed text-fg-subtle">
          Tell us here so your message reaches the stream. It shows once Stotteyman
          confirms the payment landed.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => submit('manual', 'cashapp')}
            className="flex-1 rounded-lg border border-[#00D632]/40 bg-[#00D632]/10 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-[#00D632] transition-colors hover:bg-[#00D632]/20 disabled:opacity-50"
          >
            {busy === 'manual' ? 'SENDING…' : 'I sent Cash App'}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => submit('manual', 'crypto')}
            className="flex-1 rounded-lg border border-[#F7931A]/40 bg-[#F7931A]/10 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-[#F7931A] transition-colors hover:bg-[#F7931A]/20 disabled:opacity-50"
          >
            {busy === 'manual' ? 'SENDING…' : 'I sent crypto'}
          </button>
        </div>
      </div>
    </div>
  );
}
