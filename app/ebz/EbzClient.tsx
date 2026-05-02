'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Signature = {
  id: string;
  name: string;
  kick_username: string;
  message: string | null;
  created_at: string;
};

type KickState = 'idle' | 'pending' | 'verified';
type FormState = 'ready' | 'submitting' | 'done' | 'error' | 'already_signed';

const KICK_LOGIN = 'https://kick.com/login';

export default function EbzClient() {
  // Kick login flow
  const [kickState, setKickState] = useState<KickState>('idle');
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Form
  const [name, setName] = useState('');
  const [kickUsername, setKickUsername] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('ready');
  const [errorMsg, setErrorMsg] = useState('');

  // Signatures list
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [sigCount, setSigCount] = useState(0);
  const [loadingSigs, setLoadingSigs] = useState(true);

  // Supabase user id (anon session)
  const [userId, setUserId] = useState<string | null>(null);

  // Video modal
  const [videoOpen, setVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const openVideo = useCallback(() => setVideoOpen(true), []);
  const closeVideo = useCallback(() => {
    videoRef.current?.pause();
    setVideoOpen(false);
  }, []);

  // AC7ionman video modal
  const [acVideoOpen, setAcVideoOpen] = useState(false);
  const acVideoRef = useRef<HTMLVideoElement>(null);

  const openAcVideo = useCallback(() => setAcVideoOpen(true), []);
  const closeAcVideo = useCallback(() => {
    acVideoRef.current?.pause();
    setAcVideoOpen(false);
  }, []);

  // ── Supabase anon session ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
      } else {
        const { data: signInData } = await supabase.auth.signInAnonymously();
        if (signInData.user) setUserId(signInData.user.id);
      }
    });
  }, []);

  // ── Load signatures ───────────────────────────────────────────────
  const loadSignatures = useCallback(async () => {
    setLoadingSigs(true);
    const { data, count } = await supabase
      .from('ebz_signatures')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setSignatures(data as Signature[]);
    if (count != null) setSigCount(count);
    setLoadingSigs(false);
  }, []);

  useEffect(() => {
    loadSignatures();
  }, [loadSignatures]);

  // ── Kick popup flow ───────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleKickLogin = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    const w = 480, h = 700;
    const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - h) / 2);

    const popup = window.open(
      KICK_LOGIN,
      'kick-login',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      window.open(KICK_LOGIN, '_blank', 'noreferrer');
      return;
    }

    popupRef.current = popup;
    setKickState('pending');

    pollRef.current = setInterval(() => {
      if (popup.closed) {
        stopPolling();
        setKickState('verified');
      }
    }, 500);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Submit signature ──────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (formState !== 'ready') return;

      const trimName = name.trim();
      const trimKick = kickUsername.trim().replace(/^@/, '');
      const trimMsg = message.trim();

      if (!trimName || !trimKick) return;

      setFormState('submitting');
      setErrorMsg('');

      const payload: Record<string, string | null> = {
        name: trimName,
        kick_username: trimKick,
        message: trimMsg || null,
        user_id: userId,
      };

      const { error } = await supabase.from('ebz_signatures').insert(payload);

      if (!error) {
        setFormState('done');
        await loadSignatures();
      } else if (error.code === '23505') {
        // Unique violation — already signed
        setFormState('already_signed');
      } else {
        setFormState('error');
        setErrorMsg(error.message);
      }
    },
    [formState, name, kickUsername, message, userId, loadSignatures]
  );

  const formatted = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center gap-4 border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-gray-500 transition-colors hover:text-white"
        >
          ← Home
        </Link>
        <span className="h-3 w-px bg-white/10" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#53FC18]">#FreeEBZ</span>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">

        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full border border-[#53FC18]/30 bg-[#53FC18]/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-[#53FC18]">
            Open Petition
          </div>
          <h1 className="mb-4 font-sans text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Reinstate EBZ on Kick
          </h1>
          <p className="mx-auto max-w-xl font-mono text-sm leading-relaxed text-gray-400">
            EBZ has been falsely accused and banned from Kick. Sign this petition to demand his reinstatement and the removal of the slander from his name.
          </p>
        </div>

        {/* Signature count banner */}
        <div className="mb-10 flex items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-center">
            <p className="font-sans text-5xl font-black tabular-nums text-white">
              {loadingSigs ? '—' : sigCount.toLocaleString()}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500">
              Signatures
            </p>
          </div>
          <div className="h-16 w-px bg-white/10" />
          <div className="max-w-xs text-left">
            <p className="font-mono text-xs leading-relaxed text-gray-400">
              Every name here is a voice demanding justice. Share this page and make it impossible to ignore.
            </p>
          </div>
        </div>

        {/* The case */}
        <section className="mb-12 space-y-6 rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-white">
            Why This Matters
          </h2>

          <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-400">
            <p>
              <span className="text-white">EBZ</span> — a content creator who built a loyal community on Kick — has been banned from the platform following <span className="text-red-400">false accusations of being a paedophile</span>. These accusations are unsubstantiated, yet they have spread across social media unchecked, causing catastrophic damage to his reputation, livelihood, and mental health.
            </p>
            <p>
              As a direct result of these lies, EBZ has lost <span className="text-white">tens of thousands of dollars</span> in streaming revenue, brand deals, and intellectual property opportunities he had worked years to build.
            </p>
            <p>
              Meanwhile, Kick platform partners{' '}
              <button
                type="button"
                onClick={openVideo}
                className="text-white underline decoration-dotted underline-offset-2 hover:text-[#53FC18] transition-colors"
              >
                Izi Prime
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={openAcVideo}
                className="text-white underline decoration-dotted underline-offset-2 hover:text-[#53FC18] transition-colors"
              >
                AC7ionman
              </button>{' '}
              continue to stream freely on the platform despite documented instances of behaviour and statements far more egregious than anything EBZ has ever said or done. The inconsistent enforcement of Kick's own policies raises serious questions about fairness, bias, and accountability.
            </p>
            <p>
              <span className="text-white">We are calling on Kick to:</span>
            </p>
            <ul className="ml-4 list-disc space-y-2 text-gray-300">
              <li>Immediately reinstate EBZ's Kick account and partner status</li>
              <li>Issue a public statement correcting the record and removing the association of EBZ with these false accusations</li>
              <li>Apply its community guidelines consistently and fairly to all creators on the platform</li>
              <li>Compensate EBZ for the financial damage caused by his wrongful ban</li>
            </ul>
            <p className="border-l-2 border-[#53FC18]/60 pl-4 text-gray-300 italic">
              "False accusations don't just damage reputation — they destroy lives. Silence is complicity. Sign your name and stand with EBZ."
            </p>
          </div>
        </section>

        {/* Sign the petition */}
        <section className="mb-12 rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="mb-6 font-sans text-xl font-bold uppercase tracking-wide text-white">
            Sign the Petition
          </h2>

          {formState === 'done' ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#53FC18]/40 bg-[#53FC18]/10 text-2xl text-[#53FC18]">✓</span>
              <p className="font-sans text-lg font-bold text-white">Your signature has been recorded.</p>
              <p className="font-mono text-sm text-gray-400">Thank you for standing with EBZ. Share this page to amplify the message.</p>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#53FC18]/40 hover:text-[#53FC18]"
              >
                Copy Link
              </button>
            </div>
          ) : formState === 'already_signed' ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="font-sans text-lg font-bold text-[#53FC18]">You've already signed.</p>
              <p className="font-mono text-sm text-gray-400">This browser session has already submitted a signature.</p>
            </div>
          ) : (
            <>
              {/* Step 1 — Kick login */}
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 font-mono text-[10px] text-gray-400">1</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">Verify with your Kick account</span>
                </div>

                {kickState === 'verified' ? (
                  <div className="flex items-center gap-2 rounded-lg border border-[#53FC18]/30 bg-[#53FC18]/10 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-[#53FC18]" />
                    <span className="font-mono text-xs text-[#53FC18]">Kick account verified — you can now sign below</span>
                    <button onClick={() => setKickState('idle')} className="ml-auto font-mono text-[10px] text-gray-600 hover:text-red-400">✕</button>
                  </div>
                ) : kickState === 'pending' ? (
                  <button
                    onClick={() => popupRef.current?.focus()}
                    className="flex animate-pulse items-center gap-2 rounded-lg border border-[#53FC18]/20 bg-[#53FC18]/5 px-4 py-3 font-mono text-xs text-[#53FC18]/70"
                  >
                    <span className="h-2 w-2 animate-ping rounded-full bg-[#53FC18]" />
                    Kick login in progress — click to refocus window
                  </button>
                ) : (
                  <button
                    onClick={handleKickLogin}
                    className="flex items-center gap-3 rounded-lg border border-[#53FC18]/40 bg-[#53FC18]/10 px-5 py-3 font-mono text-sm text-[#53FC18] transition-all hover:bg-[#53FC18]/20 hover:shadow-[0_0_20px_#53FC1830]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M2 2h20v14H2V2zm2 2v10h16V4H4zm6 8V8l5 2-5 2z" />
                    </svg>
                    Login with Kick
                  </button>
                )}
              </div>

              {/* Step 2 — Sign form */}
              <div className={kickState !== 'verified' ? 'pointer-events-none opacity-40' : ''}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 font-mono text-[10px] text-gray-400">2</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">Add your signature</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name or alias"
                        maxLength={80}
                        required
                        disabled={kickState !== 'verified'}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#53FC18]/40 focus:ring-1 focus:ring-[#53FC18]/20 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                        Kick Username *
                      </label>
                      <input
                        type="text"
                        value={kickUsername}
                        onChange={(e) => setKickUsername(e.target.value)}
                        placeholder="@username"
                        maxLength={50}
                        required
                        disabled={kickState !== 'verified'}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#53FC18]/40 focus:ring-1 focus:ring-[#53FC18]/20 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                      Statement (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal statement of support…"
                      maxLength={500}
                      rows={3}
                      disabled={kickState !== 'verified'}
                      className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#53FC18]/40 focus:ring-1 focus:ring-[#53FC18]/20 disabled:cursor-not-allowed"
                    />
                    <p className="mt-1 text-right font-mono text-[10px] text-gray-600">{message.length}/500</p>
                  </div>

                  {formState === 'error' && (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-400">
                      {errorMsg || 'Something went wrong. Please try again.'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={kickState !== 'verified' || formState === 'submitting'}
                    className="w-full rounded-lg border border-[#53FC18]/60 bg-[#53FC18]/15 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/25 hover:shadow-[0_0_24px_#53FC1840] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {formState === 'submitting' ? 'Submitting…' : 'Sign the Petition'}
                  </button>

                  <p className="text-center font-mono text-[10px] text-gray-600">
                    Your name and Kick username will be shown publicly on this petition.
                  </p>
                </form>
              </div>
            </>
          )}
        </section>

        {/* Signatures list */}
        <section>
          <h2 className="mb-6 font-sans text-xl font-bold uppercase tracking-wide text-white">
            Signatories{!loadingSigs && sigCount > 0 && <span className="ml-3 font-mono text-sm font-normal text-gray-500">({sigCount.toLocaleString()})</span>}
          </h2>

          {loadingSigs ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : signatures.length === 0 ? (
            <p className="font-mono text-sm text-gray-600">No signatures yet. Be the first to stand with EBZ.</p>
          ) : (
            <div className="space-y-3">
              {signatures.map((sig, i) => (
                <div
                  key={sig.id}
                  className="flex gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-5 py-4"
                >
                  <span className="mt-0.5 font-mono text-xs text-gray-600">#{sigCount - i}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-baseline gap-2">
                      <span className="font-sans text-sm font-bold text-white">{sig.name}</span>
                      <span className="font-mono text-[10px] text-[#53FC18]">@{sig.kick_username}</span>
                      <span className="ml-auto font-mono text-[10px] text-gray-600">{formatted(sig.created_at)}</span>
                    </div>
                    {sig.message && (
                      <p className="font-mono text-xs leading-relaxed text-gray-400 italic">"{sig.message}"</p>
                    )}
                  </div>
                </div>
              ))}
              {sigCount > 50 && (
                <p className="pt-2 text-center font-mono text-[10px] text-gray-600">
                  Showing the 50 most recent signatures
                </p>
              )}
            </div>
          )}
        </section>

        {/* Share */}
        <div className="mt-16 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="mb-4 font-sans text-lg font-bold text-white">Spread the Word</p>
          <p className="mb-6 font-mono text-sm text-gray-400">Share this petition on social media, in Discord servers, and across the Kick community.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('#FreeEBZ — Sign the petition to get EBZ reinstated on Kick. He was falsely accused and wrongfully banned. Stand up for fairness.')}&url=${encodeURIComponent('https://stotteyman.com/ebz')}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-white/30 hover:text-white"
            >
              Share on X
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#53FC18]/40 hover:text-[#53FC18]"
            >
              Copy Link
            </button>
          </div>
        </div>

      </main>

      {/* AC7ionman video modal */}
      {acVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeAcVideo}
        >
          <div
            className="relative w-full max-w-3xl rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400">
                AC7ionman — Evidence
              </span>
              <button
                onClick={closeAcVideo}
                className="font-mono text-sm text-gray-500 hover:text-white transition-colors"
                aria-label="Close video"
              >
                ✕
              </button>
            </div>
            <video
              ref={acVideoRef}
              src="/ac7ionman.mp4"
              controls
              autoPlay
              className="w-full rounded-b-xl"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </div>
      )}

      {/* Video modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-3xl rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400">
                Izi Prime — Evidence
              </span>
              <button
                onClick={closeVideo}
                className="font-mono text-sm text-gray-500 hover:text-white transition-colors"
                aria-label="Close video"
              >
                ✕
              </button>
            </div>
            <video
              ref={videoRef}
              src="/prime.mp4"
              controls
              autoPlay
              className="w-full rounded-b-xl"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
