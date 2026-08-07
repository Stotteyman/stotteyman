'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Unified multi-platform chat overlay.
 *
 * Kick and Twitch are consumed DIRECTLY from this page over public WebSockets —
 * Kick's Pusher socket and Twitch's anonymous `justinfan` IRC both work from a
 * browser with no credentials. That is what lets the overlay be hosted rather than
 * served by the local stream-control daemon: a phone running Moblin can load it,
 * and nothing depends on the PC being reachable.
 *
 * YouTube is the exception and is polled through a server route, because it needs
 * an API key that must never ship to a browser source.
 */

type Platform = 'kick' | 'twitch' | 'youtube';

type ChatMessage = {
  id: string;
  platform: Platform;
  author: string;
  color: string | null;
  badges: string[];
  text: string;
  at: number;
};

type Config = {
  chat: {
    enabled: boolean;
    maxMessages: number;
    fadeSeconds: number;
    fontScale: number;
    showPlatform: boolean;
    hideCommands: boolean;
    blockedUsers: string[];
  };
  tts: { enabled: boolean; cooldownSeconds: number; volume: number };
  sources: { platform: Platform; channel: string; externalId: string | null; accent: string | null }[];
  revision: string;
};

const PLATFORM_STYLE: Record<Platform, { label: string; accent: string }> = {
  kick: { label: 'KICK', accent: '#53fc18' },
  twitch: { label: 'TWITCH', accent: '#a970ff' },
  youtube: { label: 'YOUTUBE', accent: '#ff4444' },
};

const KICK_PUSHER_URL =
  'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.6.0&flash=false';
const TWITCH_IRC_URL = 'wss://irc-ws.chat.twitch.tv:443';

/** Exponential backoff, capped. A reconnect storm helps nobody. */
const backoff = (attempt: number) => Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));

export default function ChatOverlayClient({
  overlayKey,
  ttsRequested,
}: {
  overlayKey: string;
  ttsRequested: boolean;
}) {
  const [config, setConfig] = useState<Config | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fatal, setFatal] = useState<string | null>(null);

  // Refs, not state: the socket callbacks are created once and must always see the
  // current config without tearing down and rebuilding every connection on a change.
  const configRef = useRef<Config | null>(null);
  configRef.current = config;

  const seenIds = useRef<Set<string>>(new Set());

  const push = useCallback((msg: Omit<ChatMessage, 'id' | 'at'> & { id?: string }) => {
    const cfg = configRef.current;
    const text = msg.text.trim();
    if (!text) return;

    const author = msg.author.toLowerCase();
    if (cfg?.chat.blockedUsers.includes(author)) return;
    if (cfg?.chat.hideCommands && text.startsWith('!')) return;

    const id = msg.id ?? `${msg.platform}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (seenIds.current.has(id)) return;
    seenIds.current.add(id);
    // Unbounded Set in an immortal browser source is a slow leak.
    if (seenIds.current.size > 2000) {
      seenIds.current = new Set(Array.from(seenIds.current).slice(-500));
    }

    const entry: ChatMessage = {
      id,
      platform: msg.platform,
      author: msg.author,
      color: msg.color,
      badges: msg.badges,
      text: text.slice(0, 300),
      at: Date.now(),
    };

    setMessages((prev) => {
      const max = cfg?.chat.maxMessages ?? 25;
      return [...prev, entry].slice(-max);
    });
  }, []);

  // ── config ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/overlay/config/?key=${encodeURIComponent(overlayKey)}`, {
          cache: 'no-store',
        });
        if (res.status === 401) {
          if (!cancelled) setFatal('Overlay key rejected');
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as Config;
        if (!cancelled) {
          setConfig(data);
          setFatal(null);
        }
      } catch {
        // Offline or the site is redeploying. Keep whatever we already have on
        // screen and try again on the next tick.
      }
    };

    load();
    // Re-poll so a settings change in HQ reaches a browser source nobody will touch.
    const timer = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [overlayKey]);

  // ── Kick ──────────────────────────────────────────────────────────────────
  const kickRooms = useMemo(
    () =>
      (config?.sources ?? [])
        .filter((s) => s.platform === 'kick' && s.externalId)
        .map((s) => s.externalId as string)
        .join(','),
    [config]
  );

  useEffect(() => {
    if (!kickRooms) return;
    const rooms = kickRooms.split(',');
    let ws: WebSocket | null = null;
    let attempt = 0;
    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (stopped) return;
      ws = new WebSocket(KICK_PUSHER_URL);

      ws.onopen = () => {
        attempt = 0;
        for (const room of rooms) {
          ws?.send(
            JSON.stringify({
              event: 'pusher:subscribe',
              data: { auth: '', channel: `chatrooms.${room}.v2` },
            })
          );
        }
      };

      ws.onmessage = (ev) => {
        let frame: { event?: string; data?: unknown };
        try {
          frame = JSON.parse(ev.data as string);
        } catch {
          return;
        }
        if (frame.event === 'pusher:ping') {
          ws?.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
          return;
        }
        if (!/ChatMessageEvent/.test(frame.event ?? '')) return;

        // Pusher double-encodes: `data` is a JSON string inside a JSON frame.
        let d: {
          id?: string;
          content?: string;
          sender?: { username?: string; identity?: { color?: string; badges?: { type?: string }[] } };
        };
        try {
          d = typeof frame.data === 'string' ? JSON.parse(frame.data) : (frame.data as never);
        } catch {
          return;
        }

        push({
          id: d.id ? `kick-${d.id}` : undefined,
          platform: 'kick',
          author: d.sender?.username ?? 'unknown',
          color: d.sender?.identity?.color ?? null,
          badges: (d.sender?.identity?.badges ?? []).map((b) => b.type ?? '').filter(Boolean),
          text: d.content ?? '',
        });
      };

      ws.onclose = () => {
        if (stopped) return;
        retryTimer = setTimeout(connect, backoff(attempt++));
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      ws?.close();
    };
  }, [kickRooms, push]);

  // ── Twitch ────────────────────────────────────────────────────────────────
  const twitchChannels = useMemo(
    () =>
      (config?.sources ?? [])
        .filter((s) => s.platform === 'twitch')
        .map((s) => s.channel.toLowerCase().replace(/^#/, ''))
        .join(','),
    [config]
  );

  useEffect(() => {
    if (!twitchChannels) return;
    const channels = twitchChannels.split(',');
    let ws: WebSocket | null = null;
    let attempt = 0;
    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (stopped) return;
      ws = new WebSocket(TWITCH_IRC_URL);

      ws.onopen = () => {
        attempt = 0;
        // Without the tags capability every message renders as a lowercase login
        // with no colour and no badges.
        ws?.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
        ws?.send(`NICK justinfan${Math.floor(Math.random() * 90000) + 10000}`);
        for (const channel of channels) ws?.send(`JOIN #${channel}`);
      };

      ws.onmessage = (ev) => {
        for (const line of String(ev.data).split('\r\n')) {
          if (!line) continue;
          // Twitch drops the connection if PINGs go unanswered.
          if (line.startsWith('PING')) {
            ws?.send('PONG :tmi.twitch.tv');
            continue;
          }
          const m = line.match(/^(?:@(\S+) )?:(\w+)!\S+ PRIVMSG #\S+ :(.*)$/);
          if (!m) continue;

          const tags = Object.fromEntries(
            (m[1] ?? '')
              .split(';')
              .filter(Boolean)
              .map((kv) => {
                const i = kv.indexOf('=');
                return [kv.slice(0, i), kv.slice(i + 1)];
              })
          ) as Record<string, string>;

          push({
            id: tags.id ? `twitch-${tags.id}` : undefined,
            platform: 'twitch',
            author: tags['display-name'] || m[2],
            color: tags.color || null,
            badges: (tags.badges ?? '')
              .split(',')
              .filter(Boolean)
              .map((b) => b.split('/')[0]),
            text: m[3],
          });
        }
      };

      ws.onclose = () => {
        if (stopped) return;
        retryTimer = setTimeout(connect, backoff(attempt++));
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      ws?.close();
    };
  }, [twitchChannels, push]);

  // ── YouTube (server-polled) ───────────────────────────────────────────────
  const hasYouTube = (config?.sources ?? []).some((s) => s.platform === 'youtube');

  useEffect(() => {
    if (!hasYouTube) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      let waitMs = 15000;
      try {
        const res = await fetch(`/api/overlay/youtube/?key=${encodeURIComponent(overlayKey)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = (await res.json()) as {
            messages?: { id: string; author: string; badges: string[]; text: string }[];
            pollMs?: number;
          };
          for (const m of data.messages ?? []) {
            push({
              id: `youtube-${m.id}`,
              platform: 'youtube',
              author: m.author,
              color: null,
              badges: m.badges ?? [],
              text: m.text,
            });
          }
          waitMs = Math.max(5000, data.pollMs ?? 15000);
        }
      } catch {
        waitMs = 30000;
      }
      if (!stopped) timer = setTimeout(tick, waitMs);
    };

    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [hasYouTube, overlayKey, push]);

  // ── fade out old messages ─────────────────────────────────────────────────
  const fadeSeconds = config?.chat.fadeSeconds ?? 0;
  useEffect(() => {
    if (!fadeSeconds) return;
    const timer = setInterval(() => {
      const cutoff = Date.now() - fadeSeconds * 1000;
      setMessages((prev) => prev.filter((m) => m.at > cutoff));
    }, 1000);
    return () => clearInterval(timer);
  }, [fadeSeconds]);

  // ── TTS ───────────────────────────────────────────────────────────────────
  const ttsActive = ttsRequested && Boolean(config?.tts.enabled);
  useTextToSpeech({
    active: ttsActive,
    overlayKey,
    messages,
    cooldownSeconds: config?.tts.cooldownSeconds ?? 20,
    volume: config?.tts.volume ?? 1,
  });

  if (fatal) {
    return (
      <div style={{ padding: 16, fontFamily: 'monospace', color: '#ff5555', fontSize: 14 }}>
        {fatal}
      </div>
    );
  }

  const scale = config?.chat.fontScale ?? 1;
  const showPlatform = config?.chat.showPlatform ?? true;

  return (
    <div className="overlay-chat" style={{ fontSize: `${scale}rem` }}>
      {messages.map((m) => {
        const accent = PLATFORM_STYLE[m.platform].accent;
        return (
          <div key={m.id} className="overlay-chat__row">
            {showPlatform && (
              <span className="overlay-chat__platform" style={{ backgroundColor: accent }}>
                {PLATFORM_STYLE[m.platform].label}
              </span>
            )}
            <span className="overlay-chat__author" style={{ color: m.color ?? accent }}>
              {m.author}
            </span>
            <span className="overlay-chat__text">{m.text}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Speaks eligible messages, one at a time, in order.
 *
 * Audio is synthesised server-side and played through a single <audio> element.
 * A queue is essential: firing an Audio per message means five people talking over
 * each other the moment chat gets busy.
 */
function useTextToSpeech({
  active,
  overlayKey,
  messages,
  cooldownSeconds,
  volume,
}: {
  active: boolean;
  overlayKey: string;
  messages: ChatMessage[];
  cooldownSeconds: number;
  volume: number;
}) {
  const spokenIds = useRef<Set<string>>(new Set());
  const lastSpokeAt = useRef<Map<string, number>>(new Map());
  const queue = useRef<string[]>([]);
  const playing = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mark everything already on screen as spoken, so enabling TTS (or a browser
  // source reload mid-stream) does not read out the entire backlog at once.
  const primed = useRef(false);
  useEffect(() => {
    if (primed.current) return;
    primed.current = true;
    for (const m of messages) spokenIds.current.add(m.id);
  }, [messages]);

  const drain = useCallback(async () => {
    if (playing.current) return;
    const next = queue.current.shift();
    if (!next) return;

    playing.current = true;
    try {
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = next;
      audio.volume = Math.min(1, Math.max(0, volume));
      await audio.play();
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
      });
    } catch {
      // Autoplay refused (a normal browser tab without a click). In OBS and Moblin
      // this does not happen; dropping the clip is better than stalling the queue.
    } finally {
      const url = next;
      URL.revokeObjectURL(url);
      playing.current = false;
      if (queue.current.length) void drain();
    }
  }, [volume]);

  useEffect(() => {
    if (!active) return;

    const pending = messages.filter((m) => !spokenIds.current.has(m.id));
    if (!pending.length) return;

    for (const m of pending) {
      spokenIds.current.add(m.id);

      // Per-account cooldown is enforced here rather than server-side: one browser
      // source sees the whole conversation, while serverless invocations share no
      // memory and would each think they were first.
      const key = `${m.platform}:${m.author.toLowerCase()}`;
      const last = lastSpokeAt.current.get(key) ?? 0;
      if (Date.now() - last < cooldownSeconds * 1000) continue;
      lastSpokeAt.current.set(key, Date.now());

      void (async () => {
        try {
          const res = await fetch(`/api/overlay/tts/?key=${encodeURIComponent(overlayKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: m.platform,
              username: m.author,
              badges: m.badges,
              text: m.text,
            }),
          });
          // 204 = not eligible. Silence is the correct outcome, not an error.
          if (res.status !== 200) return;
          const blob = await res.blob();
          queue.current.push(URL.createObjectURL(blob));
          void drain();
        } catch {
          /* network hiccup — skip this line rather than retrying into a backlog */
        }
      })();
    }
  }, [active, messages, overlayKey, cooldownSeconds, drain]);
}
