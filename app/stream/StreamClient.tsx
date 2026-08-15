'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import KickChatWidget from './KickChatWidget';

const kickChannel = 'stotteyman';
const kickChatPopout = `https://kick.com/popout/${kickChannel}/chat`;
const discordInvite = 'https://discord.gg/9zbyfPyp3E';
const KICK_PROVIDER = 'custom:kick';
const KICK_PROVIDER_TOKEN_KEY = 'kick_provider_token';
/**
 * A token Kick has already rejected. Supabase keeps handing the same dead
 * `provider_token` back on every `getSession()` — without remembering which one
 * died, every reload silently re-adopts it and the first message of the session
 * fails all over again.
 */
const KICK_DEAD_TOKEN_KEY = 'kick_provider_token_dead';

/**
 * `chat:write` posts the message; `channel:read` is what lets the send route look up
 * the channel's `broadcaster_user_id`, which Kick's public chat API requires and
 * which cannot be derived from the chatroom id the overlay uses.
 */
const KICK_SCOPES = 'user:read channel:read chat:write';

type LoginState = 'idle' | 'pending' | 'loggedIn';

export default function StreamClient() {
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [kickUsername, setKickUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean | null>(null);
  const [chatWidth, setChatWidth] = useState(340);
  const [isDesktop, setIsDesktop] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: chatWidth };
    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - mv.clientX;
      setChatWidth(Math.min(600, Math.max(220, dragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [chatWidth]);

  /**
   * Real live/offline state.
   *
   * The header used to render an always-green pulsing "LIVE ON KICK" dot regardless of
   * whether anything was broadcasting — so the page claimed to be live while the player
   * underneath it said "stotteyman is offline". Same edge function the rest of the
   * stream stack uses, because kick.com/api 403s Cloudflare-flagged origins directly.
   */
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return;

    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${base}/functions/v1/kick-chatroom?slug=${kickChannel}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const body = (await res.json()) as { isLive?: boolean };
        if (!cancelled) setIsLive(Boolean(body.isLive));
      } catch {
        /* a failed poll leaves the last known state rather than claiming offline */
      }
    };

    check();
    const id = setInterval(check, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    supabase
      .from('stream_announcements')
      .select('message')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.message) {
          setAnnouncement(data.message);
          setShowBanner(true);
        }
      });
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
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

  const syncFromSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;

    if (user) {
      const uname = resolveKickUsernameFromUser(user);
      const dead = window.sessionStorage.getItem(KICK_DEAD_TOKEN_KEY);
      const sessionToken = data.session?.provider_token ?? null;
      const storedToken = window.sessionStorage.getItem(KICK_PROVIDER_TOKEN_KEY);
      const candidate = sessionToken || storedToken;
      const token = candidate && candidate !== dead ? candidate : null;

      setKickUsername(uname);
      setProviderToken(token);
      if (token) {
        window.sessionStorage.setItem(KICK_PROVIDER_TOKEN_KEY, token);
        window.sessionStorage.removeItem(KICK_DEAD_TOKEN_KEY);
      }

      setLoginState(token ? 'loggedIn' : 'idle');
      setErrorMsg('');
      return;
    }

    setKickUsername('');
    setLoginState('idle');
    setProviderToken(null);
    window.sessionStorage.removeItem(KICK_PROVIDER_TOKEN_KEY);
  }, [resolveKickUsernameFromUser]);

  useEffect(() => {
    syncFromSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uname = resolveKickUsernameFromUser(session.user);
        const dead = window.sessionStorage.getItem(KICK_DEAD_TOKEN_KEY);
        const candidate =
          session.provider_token ?? window.sessionStorage.getItem(KICK_PROVIDER_TOKEN_KEY);
        const token = candidate && candidate !== dead ? candidate : null;

        setKickUsername(uname);
        setProviderToken(token);
        if (token) {
          window.sessionStorage.setItem(KICK_PROVIDER_TOKEN_KEY, token);
          window.sessionStorage.removeItem(KICK_DEAD_TOKEN_KEY);
        }

        setLoginState(token ? 'loggedIn' : 'idle');
        setErrorMsg('');
      } else {
        setKickUsername('');
        setLoginState('idle');
        setProviderToken(null);
        window.sessionStorage.removeItem(KICK_PROVIDER_TOKEN_KEY);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [resolveKickUsernameFromUser, syncFromSession]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'KICK_AUTH_DONE') return;

      // The popup carries the provider_token, because it is the only context Supabase
      // ever gives it to. Take it from the message and store it before syncing, or the
      // sync below finds no token and concludes we are signed out.
      const fromPopup = event.data?.providerToken;
      if (typeof fromPopup === 'string' && fromPopup) {
        window.sessionStorage.setItem(KICK_PROVIDER_TOKEN_KEY, fromPopup);
        window.sessionStorage.removeItem(KICK_DEAD_TOKEN_KEY);
        setProviderToken(fromPopup);
      }

      syncFromSession();
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [syncFromSession]);

  const handleLogin = useCallback(async () => {
    setErrorMsg('');

    // An explicit reconnect clears the dead-token marker. Kick can hand back the same
    // access token when the existing grant is still valid, and without this the guard
    // rejects it on arrival — so pressing Reconnect appeared to do nothing at all.
    window.sessionStorage.removeItem(KICK_DEAD_TOKEN_KEY);

    // If popup is already open, focus it
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    setLoginState('pending');

    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const authBase = isLocalhost
      ? window.location.origin
      : configuredSiteUrl || window.location.origin;
    const redirectTo = new URL('/auth/callback', authBase).toString();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: KICK_PROVIDER,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        scopes: KICK_SCOPES,
      },
    });

    if (error || !data.url) {
      setLoginState('idle');
      setErrorMsg(error ? `Kick auth failed: ${error.message}` : 'Kick auth URL was not returned.');
      return;
    }

    const width = 480;
    const height = 700;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      data.url,
      'kick-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      setLoginState('idle');
      setErrorMsg('Popup blocked. Allow popups for this site, then click Login to Kick again.');
      return;
    }

    popupRef.current = popup;

    pollRef.current = setInterval(() => {
      if (popup.closed) {
        stopPolling();
        syncFromSession();
      }
    }, 500);
  }, [stopPolling, syncFromSession]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setLoginState('idle');
    setKickUsername('');
    setProviderToken(null);
    window.sessionStorage.removeItem(KICK_PROVIDER_TOKEN_KEY);
  }, []);

  /**
   * A dead Kick token is not a dead site session.
   *
   * This used to call `supabase.auth.signOut()`, so one rejected message threw away
   * the whole identity — and because the old send endpoint rejected *every* message,
   * that fired on the very first thing anyone typed. Only the Kick credential is
   * dropped now; the viewer stays signed in and reconnects with one click.
   */
  const handleKickAuthExpired = useCallback(async () => {
    if (providerToken) {
      window.sessionStorage.setItem(KICK_DEAD_TOKEN_KEY, providerToken);
    }
    window.sessionStorage.removeItem(KICK_PROVIDER_TOKEN_KEY);
    setProviderToken(null);
    setLoginState('idle');
    setErrorMsg('Your Kick connection expired — reconnect to keep chatting.');
  }, [providerToken]);

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-bg text-fg">

      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line bg-black/60 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-label uppercase text-fg-subtle transition-colors hover:text-accent"
          >
            ← Home
          </Link>
          <span className="hidden h-3 w-px bg-surface-hover sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                isLive
                  ? 'animate-pulse bg-[#53FC18] shadow-[0_0_8px_#53FC18]'
                  : isLive === false
                    ? 'bg-fg-faint'
                    : 'bg-fg-faint/50'
              }`}
            />
            <span
              className={`font-mono text-label uppercase ${
                isLive ? 'text-[#53FC18]' : 'text-fg-subtle'
              }`}
            >
              {isLive === null ? 'Checking…' : isLive ? 'Live on Kick' : 'Offline'}
            </span>
          </div>
        </div>

        <p className="font-sans text-sm font-bold tracking-[0.2em] text-fg">STOTTEYMAN</p>

        <div className="flex items-center gap-2">
          {loginState === 'loggedIn' ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[#53FC18]/40 bg-[#53FC18]/10 px-3 py-1.5 font-mono text-label uppercase text-[#53FC18]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#53FC18]" />
                {kickUsername ? `@${kickUsername}` : 'Kick Connected'}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-line bg-surface px-2 py-1.5 font-mono text-label uppercase text-fg-subtle transition-all hover:border-red-500/40 hover:text-red-400"
                title="Clear login state"
              >
                ✕
              </button>
            </div>
          ) : loginState === 'pending' ? (
            <button
              onClick={() => { popupRef.current?.focus(); }}
              className="flex animate-pulse cursor-pointer items-center gap-2 rounded-full border border-[#53FC18]/30 bg-[#53FC18]/5 px-3 py-1.5 font-mono text-label uppercase text-[#53FC18]/70"
            >
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#53FC18]" />
              Logging in…
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-label uppercase text-fg-muted transition-all hover:border-[#53FC18]/60 hover:bg-[#53FC18]/10 hover:text-[#53FC18]"
            >
              Login
            </button>
          )}
          <a
            href={discordInvite}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-label uppercase text-fg-muted transition-all hover:border-[#5865F2]/60 hover:text-[#5865F2]"
          >
            Discord
          </a>
        </div>
      </header>

      {/* A dropped Kick connection is a prompt, not a stack trace: it offers the one
          action that fixes it instead of leaving a red bar with no way forward. */}
      {errorMsg && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-warn/25 bg-warn/10 px-4 py-2.5">
          <p className="font-mono text-[11px] text-warn">{errorMsg}</p>
          <div className="flex items-center gap-2">
            {!providerToken && (
              <button
                onClick={handleLogin}
                className="rounded-full border border-warn/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-warn transition-colors hover:bg-warn/15"
              >
                Reconnect Kick
              </button>
            )}
            <button
              onClick={() => setErrorMsg('')}
              aria-label="Dismiss"
              className="font-mono text-[11px] text-warn/60 hover:text-warn"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Announcement banner */}
      {showBanner && announcement && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#53FC18]/20 bg-[#53FC18]/10 px-4 py-2">
          <p className="font-mono text-[10px] text-[#53FC18]">{announcement}</p>
          <button
            onClick={() => setShowBanner(false)}
            className="font-mono text-[10px] text-[#53FC18]/60 hover:text-[#53FC18]"
            aria-label="Dismiss announcement"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stream + Chat */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

        {/* Video player */}
        <div className="relative min-h-0 flex-1 bg-bg">
          <iframe
            src={`https://player.kick.com/${kickChannel}`}
            title="Stotteyman Kick livestream"
            allowFullScreen
            allow="autoplay; fullscreen"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>

        {/* Chat sidebar */}
        <div
          className="relative flex h-[45vh] shrink-0 flex-col border-t border-line lg:h-full lg:border-l lg:border-t-0"
          style={isDesktop ? { width: chatWidth } : undefined}
        >
          {/* Resize handle — desktop only */}
          <div
            className="absolute hidden lg:block"
            style={{ width: 6, top: 0, bottom: 0, left: 0, cursor: 'col-resize', zIndex: 10 }}
            onMouseDown={handleResizeStart}
          />
          <div className="flex shrink-0 items-center justify-between border-b border-line bg-[#050505] px-4 py-3">
            {/* This badge used to read CONNECTED off `loginState`, which says nothing
                about the chat socket — it stayed green while chat was down. It names
                the signed-in account now, which is the thing loginState actually knows. */}
            <span className="font-mono text-label uppercase text-fg-subtle">
              {loginState === 'loggedIn' ? (
                <span className="flex items-center gap-2">
                  Live Chat
                  <span className="rounded bg-[#53FC18]/15 px-1.5 py-0.5 text-[9px] text-[#53FC18]">
                    {kickUsername ? `@${kickUsername}` : 'Kick linked'}
                  </span>
                </span>
              ) : (
                'Live Chat'
              )}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={kickChatPopout}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-label uppercase text-fg-subtle transition-colors hover:text-accent"
              >
                Pop out ↗
              </a>
            </div>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden bg-bg">
            <KickChatWidget
              providerToken={providerToken}
              username={kickUsername}
              onLoginRequest={handleLogin}
              onAuthExpired={handleKickAuthExpired}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
