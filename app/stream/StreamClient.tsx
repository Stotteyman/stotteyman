'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const kickChannel = 'stotteyman';
const kickUrl = 'https://kick.com/stotteyman';
const kickLoginUrl = 'https://kick.com/login';
const kickChatPopout = `https://kick.com/popout/${kickChannel}/chat`;
const discordInvite = 'https://discord.gg/9zbyfPyp3E';

export default function StreamClient() {
  const chatIframeRef = useRef<HTMLIFrameElement>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleLogin = useCallback(() => {
    // If already have a popup open, focus it
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

    // Poll until the popup closes, then reload chat
    pollRef.current = setInterval(() => {
      if (popup.closed) {
        stopPolling();
        setLoggedIn(true);
        // Reload the chat iframe by bumping the key
        setChatKey((k) => k + 1);
      }
    }, 500);
  }, [stopPolling]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

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
          {loggedIn ? (
            <button
              onClick={reloadChat}
              className="rounded-full border border-[#53FC18]/60 bg-[#53FC18]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/20"
              title="Reload chat to apply your login"
            >
              Reload Chat
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#53FC18]/60 hover:text-[#53FC18]"
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
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400">Live Chat</span>
            <a
              href={kickChatPopout}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600 transition-colors hover:text-neon-orange"
            >
              Pop out ↗
            </a>
          </div>
          <div className="min-h-0 flex-1 bg-black">
            <iframe
              key={chatKey}
              ref={chatIframeRef}
              src={kickChatPopout}
              title="Kick live chat"
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
