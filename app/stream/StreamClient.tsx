'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const kickChannel = 'stotteyman';
const kickUrl = 'https://kick.com/stotteyman';
const kickLoginUrl = 'https://kick.com/login';
const kickChatPopout = `https://kick.com/popout/${kickChannel}/chat`;
const discordInvite = 'https://discord.gg/9zbyfPyp3E';

type LoginState = 'idle' | 'pending' | 'loggedIn';

export default function StreamClient() {
  const chatIframeRef = useRef<HTMLIFrameElement>(null);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [chatKey, setChatKey] = useState(0);
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

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

  const handleLogin = useCallback(() => {
    // If popup is already open, focus it
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    const width = 480;
    const height = 700;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      kickLoginUrl,
      'kick-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      // Popup blocked — fall back to new tab
      window.open(kickLoginUrl, '_blank', 'noreferrer');
      return;
    }

    popupRef.current = popup;
    setLoginState('pending');

    // Poll until the popup closes, then reload chat and mark logged in
    pollRef.current = setInterval(() => {
      if (popup.closed) {
        stopPolling();
        setLoginState('loggedIn');
        // Reload the chat iframe so Kick picks up the new session cookie
        setChatKey((k) => k + 1);
      }
    }, 500);
  }, [stopPolling]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleLogout = useCallback(() => {
    setLoginState('idle');
  }, []);

  const reloadChat = useCallback(() => {
    setChatKey((k) => k + 1);
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
                Kick Connected
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
              Login to Kick
            </button>
          )}
          <a
            href={kickUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#53FC18]/40 bg-[#53FC18]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/20"
          >
            kick.com
          </a>
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
        <div className="flex h-[40vh] shrink-0 flex-col border-t border-white/10 lg:h-full lg:w-80 lg:border-l lg:border-t-0 xl:w-96">
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
              {loginState === 'loggedIn' && (
                <button
                  onClick={reloadChat}
                  className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600 transition-colors hover:text-[#53FC18]"
                  title="Refresh chat"
                >
                  ↺ Refresh
                </button>
              )}
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
          <div className="relative min-h-0 flex-1 bg-black">
            <iframe
              key={chatKey}
              ref={chatIframeRef}
              src={kickChatPopout}
              title="Kick live chat"
              className="h-full w-full border-0"
            />
            {/* Login overlay when not logged in */}
            {loginState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent pb-8">
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                    Login to join the chat
                  </p>
                  <button
                    onClick={handleLogin}
                    className="rounded-full border border-[#53FC18]/60 bg-[#53FC18]/15 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#53FC18] transition-all hover:bg-[#53FC18]/25 hover:shadow-[0_0_16px_#53FC1840]"
                  >
                    Login with Kick
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
