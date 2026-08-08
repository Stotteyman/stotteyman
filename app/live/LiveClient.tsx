'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Privacy = 'public' | 'unlisted' | 'invite_only' | 'off';

type Props = {
  initialTitle: string;
  initialDescription: string | null;
  privacy: Privacy;
  isLive: boolean;
  chatEnabled: boolean;
};

type ChatMessage = {
  id: string;
  display_name: string;
  body: string;
  created_at: string;
};

type Phase = 'idle' | 'joining' | 'connecting' | 'playing' | 'denied' | 'offline';

const DENIAL_COPY: Record<string, string> = {
  stream_off: 'The stream is currently off.',
  invite_required: 'This stream is invite-only. Open it using your invite link.',
  invite_invalid: 'That invite link is not valid.',
  invite_expired: 'That invite link has expired.',
  invite_exhausted: 'That invite link has reached its limit.',
  not_configured: 'The stream is not configured yet.',
};

const inputCls =
  'w-full rounded border border-line bg-black/50 px-3 py-2 text-sm text-fg placeholder-white/30 focus:border-line-strong focus:outline-none';
const btnCls =
  'rounded border border-line-strong px-4 py-2 text-sm text-fg transition hover:border-line-strong hover:text-fg disabled:opacity-40';

/**
 * WHEP (WebRTC-HTTP Egress Protocol) playback against MediaMTX.
 *
 * WHEP is a single POST: we send an SDP offer and the server returns an answer.
 * There is no signalling socket to keep alive, which is how sub-second latency
 * is reached without extra infrastructure.
 */
async function startWhep(url: string, video: HTMLVideoElement): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  // Receive-only: a viewer never publishes anything back.
  pc.addTransceiver('video', { direction: 'recvonly' });
  pc.addTransceiver('audio', { direction: 'recvonly' });

  const stream = new MediaStream();
  pc.ontrack = (event) => {
    stream.addTrack(event.track);
    video.srcObject = stream;
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Wait for ICE gathering so the offer carries its candidates — WHEP has no
  // trickle-ICE channel to deliver them afterwards.
  await new Promise<void>((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const check = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', check);
        resolve();
      }
    };
    pc.addEventListener('icegatheringstatechange', check);
    setTimeout(resolve, 2000);
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: pc.localDescription?.sdp ?? '',
  });

  if (!response.ok) {
    pc.close();
    throw new Error(response.status === 401 ? 'denied' : `whep_${response.status}`);
  }

  await pc.setRemoteDescription({ type: 'answer', sdp: await response.text() });
  return pc;
}

export default function LiveClient({
  initialTitle,
  initialDescription,
  privacy,
  isLive,
  chatEnabled,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [chatOn, setChatOn] = useState(chatEnabled);

  const join = useCallback(async () => {
    setPhase('joining');
    setMessage(null);

    // The invite token travels in the URL fragment, so it never reaches the
    // server in a request line, stays out of access logs, and is not sent in
    // the Referer header when the viewer navigates away.
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    const inviteToken =
      new URLSearchParams(hash).get('invite') ??
      new URLSearchParams(window.location.search).get('invite');

    try {
      const res = await fetch('/api/live/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteToken, displayName: displayName || undefined }),
      });
      const data = await res.json();

      if (!data.ok) {
        setPhase('denied');
        setMessage(DENIAL_COPY[data.reason] ?? 'You do not have access to this stream.');
        return;
      }

      setChatOn(Boolean(data.chatEnabled));

      if (!data.whepUrl) {
        setPhase('offline');
        setMessage('Playback is not configured yet.');
        return;
      }

      setPhase('connecting');
      const video = videoRef.current;
      if (!video) return;
      pcRef.current = await startWhep(data.whepUrl, video);
      setPhase('playing');
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'error';
      if (reason === 'denied') {
        setPhase('denied');
        setMessage('Your access to this stream was revoked.');
      } else {
        setPhase('offline');
        setMessage('The stream is not broadcasting right now.');
      }
    }
  }, [displayName]);

  useEffect(() => {
    return () => {
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, []);

  // Poll rather than subscribe: invite viewers are anonymous and hold no
  // Supabase session for Realtime to authorise. At invite-only scale a 3s poll
  // is cheaper than the machinery needed to work around that.
  useEffect(() => {
    if (phase !== 'playing' || !chatOn) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch('/api/live/chat', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.messages)) setMessages(data.messages);
      } catch {
        // Transient failure; the next tick retries.
      }
    };

    void tick();
    const id = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [phase, chatOn]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const body = draft.trim();
      if (!body) return;
      setDraft('');
      await fetch('/api/live/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
    },
    [draft]
  );

  if (privacy === 'off') {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-semibold text-fg">{initialTitle}</h1>
        <p className="mt-4 text-sm text-fg-muted">The stream is currently off. Check back soon.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-fg">{initialTitle}</h1>
          <span
            className={
              isLive
                ? 'rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-red-300'
                : 'rounded-full bg-surface px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-fg-subtle'
            }
          >
            {isLive ? 'Live' : 'Offline'}
          </span>
        </div>
        {initialDescription ? (
          <p className="mt-3 max-w-2xl text-sm text-fg-muted">{initialDescription}</p>
        ) : null}
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="relative overflow-hidden rounded-lg border border-line bg-bg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            className="aspect-video w-full bg-bg"
          />

          {phase !== 'playing' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
              {phase === 'idle' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void join();
                  }}
                  className="w-full max-w-xs space-y-3 text-center"
                >
                  <label htmlFor="live-name" className="block text-label uppercase text-fg-subtle">
                    Display name
                  </label>
                  <input
                    id="live-name"
                    className={inputCls}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="guest"
                    maxLength={32}
                  />
                  <button type="submit" className={`${btnCls} w-full`}>
                    Watch stream
                  </button>
                </form>
              ) : null}

              {phase === 'joining' || phase === 'connecting' ? (
                <p className="text-sm text-fg-muted">
                  {phase === 'joining' ? 'Checking access…' : 'Connecting…'}
                </p>
              ) : null}

              {phase === 'denied' || phase === 'offline' ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-fg-muted">{message}</p>
                  <button type="button" className={btnCls} onClick={() => void join()}>
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {phase === 'playing' && chatOn ? (
          <section className="flex h-[60vh] flex-col rounded-lg border border-line lg:h-auto">
            <h2 className="border-b border-line px-4 py-3 text-label uppercase text-fg-subtle">
              Chat
            </h2>
            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
              {messages.map((m) => (
                <p key={m.id} className="text-sm leading-relaxed">
                  <span className="font-medium text-fg">{m.display_name}</span>{' '}
                  <span className="text-fg-muted">{m.body}</span>
                </p>
              ))}
              {messages.length === 0 ? (
                <p className="text-sm text-fg-faint">No messages yet.</p>
              ) : null}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-line p-3">
              <input
                className={inputCls}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Say something…"
                maxLength={500}
              />
              <button type="submit" className={btnCls}>
                Send
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}
