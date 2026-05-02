'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Signature = {
  id: string;
  name: string;
  kick_username: string;
  message: string | null;
  created_at: string;
};

type KickState = 'idle' | 'pending' | 'verified';
type FormState = 'ready' | 'submitting' | 'done' | 'error' | 'already_signed';

const KICK_PROVIDER = 'custom:kick';

export default function EbzClient() {
  // Kick login flow
  const [kickState, setKickState] = useState<KickState>('idle');
  const [kickUsername, setKickUsername] = useState('');

  // Petition flow
  const [formState, setFormState] = useState<FormState>('ready');
  const [errorMsg, setErrorMsg] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);

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

  // Scroll-to-sign
  const signRef = useRef<HTMLElement>(null);
  const scrollToSign = useCallback(() => {
    signRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const resolveKickUsernameFromUser = useCallback((user: User | null) => {
    if (!user) return '';

    const fromMeta = user.user_metadata as Record<string, unknown>;
    const topLevelCandidates = [
      fromMeta?.preferred_username,
      fromMeta?.user_name,
      fromMeta?.username,
      fromMeta?.display_name,
      fromMeta?.name,
      fromMeta?.nick,
    ];

    for (const candidate of topLevelCandidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim().replace(/^@/, '');
      }
    }

    for (const identity of user.identities || []) {
      const identityData = identity.identity_data as Record<string, unknown> | null;
      const identityCandidates = [
        identityData?.preferred_username,
        identityData?.user_name,
        identityData?.username,
        identityData?.display_name,
        identityData?.name,
        identityData?.nick,
      ];
      for (const candidate of identityCandidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate.trim().replace(/^@/, '');
        }
      }
    }

    return '';
  }, []);

  // ── Supabase session bootstrap + auth listener ────────────────────
  useEffect(() => {
    const syncFromSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        setUserId(session.user.id);
        const uname = resolveKickUsernameFromUser(session.user);
        if (uname) {
          setKickUsername(uname);
          setKickState('verified');
          setErrorMsg('');
        } else {
          setKickState('idle');
        }
        return;
      }

      const { data: signInData } = await supabase.auth.signInAnonymously();
      if (signInData.user) setUserId(signInData.user.id);
      setKickState('idle');
      setKickUsername('');
    };

    syncFromSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        const uname = resolveKickUsernameFromUser(session.user);
        if (uname) {
          setKickUsername(uname);
          setKickState('verified');
          setErrorMsg('');
        }
      } else {
        setKickState('idle');
        setKickUsername('');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [resolveKickUsernameFromUser]);

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

  // ── postMessage listener: callback page signals auth complete ──────
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'KICK_AUTH_DONE') return;

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        const uname = resolveKickUsernameFromUser(data.session.user);
        if (uname) {
          setKickUsername(uname);
          setKickState('verified');
          setErrorMsg('');
        } else {
          setKickState('idle');
          setErrorMsg('Logged in but Kick username was not found in provider data. Check provider UserInfo mapping.');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [resolveKickUsernameFromUser]);

  // ── Supabase Kick OAuth flow ──────────────────────────────────────
  const handleKickLogin = useCallback(async () => {
    setErrorMsg('');
    setKickState('pending');

    // Redirect to /auth/callback — that page posts a message back when done
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    const isAnonymousUser = Boolean(currentUser?.is_anonymous);

    const authResponse = isAnonymousUser
      ? await supabase.auth.linkIdentity({
          provider: KICK_PROVIDER,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            scopes: 'user:read',
          },
        })
      : await supabase.auth.signInWithOAuth({
          provider: KICK_PROVIDER,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            scopes: 'user:read',
          },
        });

    const { data, error } = authResponse;

    if (error || !data.url) {
      setKickState('idle');
      setErrorMsg(
        error
          ? `Kick auth failed: ${error.message}`
          : 'Kick auth URL was not returned.'
      );
      return;
    }

    const w = 520;
    const h = 680;
    const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
    const popup = window.open(
      data.url,
      'kickauth',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      setKickState('idle');
      setErrorMsg('Popup blocked. Allow popups for this site, then click Login with Kick again.');
      return;
    }

    // Poll only to detect if user manually closes the popup (cancelled)
    const poll = setInterval(() => {
      if (popup.closed) {
        clearInterval(poll);
        // Reset to idle only if we haven't already been set to verified by the message
        setKickState(prev => (prev === 'pending' ? 'idle' : prev));
      }
    }, 500);
  }, []);

  const handleKickLogout = useCallback(async () => {
    await supabase.auth.signOut();
    const { data: signInData } = await supabase.auth.signInAnonymously();
    if (signInData.user) setUserId(signInData.user.id);
    setKickState('idle');
    setKickUsername('');
  }, []);

  // ── Submit signature ──────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
      if (formState !== 'ready') return;

      const trimKick = kickUsername.trim().replace(/^@/, '');
      if (!trimKick) {
        setErrorMsg('Kick username is required. Log in with Kick first.');
        return;
      }

      setFormState('submitting');
      setErrorMsg('');

      const payload: Record<string, string | null> = {
        name: trimKick,
        kick_username: trimKick,
        message: null,
        user_id: userId,
      };

      const { error } = await supabase.from('ebz_signatures').insert(payload);

      if (!error) {
        setFormState('done');
        setShareModalOpen(true);
        await loadSignatures();
      } else if (error.code === '23505') {
        // Unique violation — already signed
        setFormState('already_signed');
      } else {
        setFormState('error');
        setErrorMsg(error.message);
      }
    },
    [formState, kickUsername, userId, loadSignatures]
  );

  const formatted = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const petitionUrl = 'https://stotteyman.com/ebz';
  const thankYouShareMessage = `I just signed a petition to get EBZ reinstated on Kick. He was falsely accused and wrongfully banned. Add your name too: ${petitionUrl}`;

  const handleCopyShareMessage = useCallback(async () => {
    await navigator.clipboard.writeText(thankYouShareMessage);
  }, [thankYouShareMessage]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      {/* Nav */}
      <nav className="shrink-0 z-50 flex items-center gap-4 border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-gray-500 transition-colors hover:text-white"
        >
          ← Home
        </Link>
        <span className="h-3 w-px bg-white/10" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#53FC18]">#FreeEBZ</span>
        <button
          onClick={scrollToSign}
          className="ml-auto rounded-full border border-[#53FC18]/60 bg-[#53FC18]/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/20"
        >
          Sign Petition ↓
        </button>
      </nav>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
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
          <button
            onClick={scrollToSign}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#53FC18]/60 bg-[#53FC18]/10 px-8 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/20 hover:shadow-[0_0_30px_#53FC1840]"
          >
            ✍ Sign the Petition
          </button>
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
              As a direct result of these lies, EBZ has lost <span className="text-white">tens of thousands of dollars</span> in streaming revenue and brand deals, while also seeing years of work in his intellectual property and future opportunities damaged.
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
        <section ref={signRef} className="mb-12 rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="mb-6 font-sans text-xl font-bold uppercase tracking-wide text-white">
            Sign the Petition
          </h2>

          {formState === 'done' ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#53FC18]/40 bg-[#53FC18]/10 text-2xl text-[#53FC18]">✓</span>
              <p className="font-sans text-lg font-bold text-white">Your signature has been recorded.</p>
              <p className="font-mono text-sm text-gray-400">Thank you for standing with EBZ. Share this page to amplify the message.</p>
              <button
                onClick={() => setShareModalOpen(true)}
                className="rounded-full border border-[#53FC18]/40 bg-[#53FC18]/10 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/20"
              >
                Open Share Message
              </button>
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
                    <span className="font-mono text-xs text-[#53FC18]">Connected as @{kickUsername}</span>
                    <button onClick={handleKickLogout} className="ml-auto font-mono text-[10px] text-gray-600 hover:text-red-400">Sign out</button>
                  </div>
                ) : kickState === 'pending' ? (
                  <div className="flex items-center gap-3 rounded-lg border border-[#53FC18]/20 bg-[#53FC18]/5 px-4 py-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#53FC18]" />
                    <span className="font-mono text-xs text-[#53FC18]/80">Complete login in the popup…</span>
                    <button
                      onClick={() => setKickState('idle')}
                      className="ml-auto font-mono text-[10px] text-gray-600 hover:text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleKickLogin}
                      className="flex items-center gap-3 rounded-lg border border-[#53FC18]/40 bg-[#53FC18]/10 px-5 py-3 font-mono text-sm text-[#53FC18] transition-all hover:bg-[#53FC18]/20 hover:shadow-[0_0_20px_#53FC1830]"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M2 2h20v14H2V2zm2 2v10h16V4H4zm6 8V8l5 2-5 2z" />
                      </svg>
                      Login with Kick
                    </button>
                    {errorMsg && (
                      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-400">
                        {errorMsg}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2 — Sign petition */}
              <div className={kickState !== 'verified' ? 'pointer-events-none opacity-40' : ''}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 font-mono text-[10px] text-gray-400">2</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">Sign with one click</span>
                </div>

                {formState === 'error' && (
                  <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-400">
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={kickState !== 'verified' || formState === 'submitting'}
                  className="w-full rounded-lg border border-[#53FC18]/60 bg-[#53FC18]/15 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/25 hover:shadow-[0_0_24px_#53FC1840] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {formState === 'submitting' ? 'Signing…' : 'Sign the Petition'}
                </button>

                <p className="mt-3 text-center font-mono text-[10px] text-gray-600">
                  Uses your detected Kick username and records it in the database.
                </p>
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
                      <a
                        href={`https://kick.com/${sig.kick_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-sm font-bold text-white underline decoration-transparent transition-colors hover:text-[#53FC18] hover:decoration-[#53FC18]/50"
                      >
                        {sig.name}
                      </a>
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
            {/* X / Twitter — intent/post drafts the tweet */}
            <a
              href={`https://x.com/intent/post?text=${encodeURIComponent('#FreeEBZ — Sign the petition to get EBZ reinstated on Kick. He was falsely accused and wrongfully banned. Stand up for fairness.\n\nhttps://stotteyman.com/ebz')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-white/30 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
            </a>
            {/* Facebook — sharer drafts a post with the URL */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://stotteyman.com/ebz')}&quote=${encodeURIComponent('#FreeEBZ — Sign the petition to reinstate EBZ on Kick.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-blue-500/40 hover:text-blue-400"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              Share on Facebook
            </a>
            {/* Threads — intent drafts a post */}
            <a
              href={`https://www.threads.net/intent/post?text=${encodeURIComponent('#FreeEBZ — Sign the petition to get EBZ reinstated on Kick. He was falsely accused and wrongfully banned. Stand up for fairness.\n\nhttps://stotteyman.com/ebz')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-white/30 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.473 12.01v-.017c.027-3.579.877-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.018 5.043.87 6.826 2.526 1.671 1.56 2.664 3.733 2.951 6.456l-2.987.302c-.249-2.058-1.004-3.652-2.252-4.763-1.134-1.01-2.712-1.528-4.69-1.54-2.537.017-4.482.782-5.786 2.272-1.229 1.41-1.862 3.518-1.884 6.265.022 2.744.655 4.85 1.884 6.263 1.304 1.489 3.249 2.255 5.786 2.27 1.675-.01 3.12-.44 4.296-1.28.966-.692 1.67-1.71 2.088-3.018l2.935.792c-.59 1.96-1.615 3.514-3.057 4.626C16.025 23.346 14.24 24 12.186 24zm5.624-11.304c-.021-.97-.289-1.72-.793-2.23-.567-.572-1.387-.86-2.437-.86l-.066.002c-1.406.04-2.498.48-3.245 1.305-.67.742-1.004 1.76-.99 3.021a4.84 4.84 0 0 0 .023.493c.123 1.46.668 2.554 1.62 3.253.814.594 1.9.891 3.226.891l.17-.003c1.05-.027 1.858-.329 2.4-.9.504-.528.768-1.29.778-2.264l-.003-.134-.013-.274.003-.045c.07-.55.035-1.084-.132-1.554l.459.3zm-2.43 4.135c-.312.31-.786.47-1.41.478l-.12.001c-.845 0-1.51-.209-1.974-.622-.443-.394-.697-.98-.762-1.742l-.01-.165c-.008-.11-.012-.22-.012-.327 0-.822.206-1.462.614-1.9.416-.446 1.033-.68 1.834-.7l.055-.001c.612.003 1.062.168 1.337.49.298.35.454.896.466 1.626v.097l.012.27-.014.068c.13.493.143.979.037 1.41a1.8 1.8 0 0 1-.054.018z"/></svg>
              Share on Threads
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#53FC18]/40 hover:text-[#53FC18]"
            >
              Copy Link
            </button>
          </div>
        </div>

      </main>
      </div>

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

      {shareModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-[#53FC18]/20 bg-[#0a0a0a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#53FC18]">Signature Recorded</p>
                <h3 className="mt-2 font-sans text-2xl font-black uppercase text-white">Thank You For Signing</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="font-mono text-sm text-gray-500 transition-colors hover:text-white"
                aria-label="Close thank you message"
              >
                ✕
              </button>
            </div>

            <p className="mb-5 font-mono text-sm leading-relaxed text-gray-400">
              Your name is now on the petition. Help push it further by sharing this message with your followers and friends.
            </p>

            <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-xs leading-relaxed text-gray-300">{thankYouShareMessage}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`https://x.com/intent/post?text=${encodeURIComponent(thankYouShareMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-white/30 hover:text-white"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share on X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(petitionUrl)}&quote=${encodeURIComponent(thankYouShareMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-blue-500/40 hover:text-blue-400"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                Share on Facebook
              </a>
              <a
                href={`https://www.threads.net/intent/post?text=${encodeURIComponent(thankYouShareMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-white/30 hover:text-white"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.473 12.01v-.017c.027-3.579.877-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.018 5.043.87 6.826 2.526 1.671 1.56 2.664 3.733 2.951 6.456l-2.987.302c-.249-2.058-1.004-3.652-2.252-4.763-1.134-1.01-2.712-1.528-4.69-1.54-2.537.017-4.482.782-5.786 2.272-1.229 1.41-1.862 3.518-1.884 6.265.022 2.744.655 4.85 1.884 6.263 1.304 1.489 3.249 2.255 5.786 2.27 1.675-.01 3.12-.44 4.296-1.28.966-.692 1.67-1.71 2.088-3.018l2.935.792c-.59 1.96-1.615 3.514-3.057 4.626C16.025 23.346 14.24 24 12.186 24zm5.624-11.304c-.021-.97-.289-1.72-.793-2.23-.567-.572-1.387-.86-2.437-.86l-.066.002c-1.406.04-2.498.48-3.245 1.305-.67.742-1.004 1.76-.99 3.021a4.84 4.84 0 0 0 .023.493c.123 1.46.668 2.554 1.62 3.253.814.594 1.9.891 3.226.891l.17-.003c1.05-.027 1.858-.329 2.4-.9.504-.528.768-1.29.778-2.264l-.003-.134-.013-.274.003-.045c.07-.55.035-1.084-.132-1.554l.459.3zm-2.43 4.135c-.312.31-.786.47-1.41.478l-.12.001c-.845 0-1.51-.209-1.974-.622-.443-.394-.697-.98-.762-1.742l-.01-.165c-.008-.11-.012-.22-.012-.327 0-.822.206-1.462.614-1.9.416-.446 1.033-.68 1.834-.7l.055-.001c.612.003 1.062.168 1.337.49.298.35.454.896.466 1.626v.097l.012.27-.014.068c.13.493.143.979.037 1.41a1.8 1.8 0 0 1-.054.018z"/></svg>
                Share on Threads
              </a>
              <button
                onClick={handleCopyShareMessage}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#53FC18]/40 hover:text-[#53FC18]"
              >
                Copy Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
