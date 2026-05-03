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
      setKickUsername(uname);
      setLoginState('loggedIn');
      setProviderToken(data.session?.provider_token ?? null);
      setErrorMsg('');
      return;
    }

    setKickUsername('');
    setLoginState('idle');
    setProviderToken(null);
  }, [resolveKickUsernameFromUser]);

  useEffect(() => {
    syncFromSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uname = resolveKickUsernameFromUser(session.user);
        setKickUsername(uname);
        setLoginState('loggedIn');
        setProviderToken(session.provider_token ?? null);
        setErrorMsg('');
      } else {
        setKickUsername('');
        setLoginState('idle');
        setProviderToken(null);
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
      syncFromSession();
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [syncFromSession]);

  const handleLogin = useCallback(async () => {
    setErrorMsg('');

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
        scopes: 'user:read',
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
  }, []);

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-black text-white">

      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.35em] text-gray-500 transition-colors hover:text-neon-orange"
          >
            ← Home
          </Link>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#53FC18] shadow-[0_0_8px_#53FC18]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#53FC18]">Live on Kick</span>
          </div>
        </div>

        <p className="font-sans text-sm font-bold tracking-[0.2em] text-white">STOTTEYMAN</p>

        <div className="flex items-center gap-2">
          {loginState === 'loggedIn' ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[#53FC18]/40 bg-[#53FC18]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#53FC18]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#53FC18]" />
                {kickUsername ? `@${kickUsername}` : 'Kick Connected'}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 transition-all hover:border-red-500/40 hover:text-red-400"
                title="Clear login state"
              >
                ✕
              </button>
            </div>
          ) : loginState === 'pending' ? (
            <button
              onClick={() => { popupRef.current?.focus(); }}
              className="flex animate-pulse cursor-pointer items-center gap-2 rounded-full border border-[#53FC18]/30 bg-[#53FC18]/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#53FC18]/70"
            >
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#53FC18]" />
              Logging in…
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#53FC18]/60 hover:bg-[#53FC18]/10 hover:text-[#53FC18]"
            >
              Login
            </button>
          )}
          <a
            href={discordInvite}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#5865F2]/60 hover:text-[#5865F2]"
          >
            Discord
          </a>
        </div>
      </header>

      {errorMsg && (
        <div className="shrink-0 border-b border-red-400/30 bg-red-400/10 px-4 py-2">
          <p className="font-mono text-[10px] text-red-300">{errorMsg}</p>
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
        <div className="relative min-h-0 flex-1 bg-black">
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
          className="relative flex h-[45vh] shrink-0 flex-col border-t border-white/10 lg:h-full lg:border-l lg:border-t-0"
          style={isDesktop ? { width: chatWidth } : undefined}
        >
          {/* Resize handle — desktop only */}
          <div
            className="absolute hidden lg:block"
            style={{ width: 6, top: 0, bottom: 0, left: 0, cursor: 'col-resize', zIndex: 10 }}
            onMouseDown={handleResizeStart}
          />
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#050505] px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400">
              {loginState === 'loggedIn' ? (
                <span className="flex items-center gap-2">
                  Live Chat
                  <span className="rounded bg-[#53FC18]/15 px-1.5 py-0.5 text-[9px] text-[#53FC18]">CONNECTED</span>
                </span>
              ) : 'Live Chat'}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={kickChatPopout}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600 transition-colors hover:text-neon-orange"
              >
                Pop out ↗
              </a>
            </div>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
            <KickChatWidget
              providerToken={providerToken}
              username={kickUsername}
              onLoginRequest={handleLogin}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
