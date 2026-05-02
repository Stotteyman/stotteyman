'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';

// ---------- constants ----------
const CHATROOM_ID = 1062846;
const KICK_CHANNEL_SLUG = 'stotteyman';
const PUSHER_KEY = '32cbd69e4b950bf97679';
const PUSHER_CLUSTER = 'us2';
const SEND_PROXY = '/api/kick-chat'; // Netlify function proxy
const MAX_MESSAGES = 150;

// ---------- types ----------
interface KickBadge {
  type: string;
  text: string;
  count?: number;
}

interface KickSender {
  id: number;
  username: string;
  slug: string;
  profile_pic?: string;
  identity?: {
    color?: string;
    badges?: KickBadge[];
  };
}

interface KickEmote {
  id: string;
  name: string;
  src: string;
  srcset: string;
}

interface KickMessageEvent {
  id: string;
  content: string;
  type: 'message' | 'reply' | 'subscription';
  created_at: string;
  sender: KickSender;
  emotes?: KickEmote[];
  metadata?: {
    original_message?: { id: string; content: string };
    original_sender?: { username: string };
  };
}

interface ChatMsg {
  id: string;
  username: string;
  color: string;
  content: string;
  badges: KickBadge[];
  profilePic?: string;
  isReply?: boolean;
  replyTo?: string;
  replyContent?: string;
  emotes?: KickEmote[];
  ts: number;
}

interface Props {
  providerToken: string | null;
  username: string;
  onLoginRequest: () => void;
}

// ---------- helpers ----------
function parseBadges(badges: KickBadge[] = []): KickBadge[] {
  return badges.filter(b => b.type !== 'channel_sub_gifter'); // keep relevant
}

function renderContent(content: string, emotes: KickEmote[] = []): React.ReactNode[] {
  if (!emotes.length) return [content];

  // Replace emote names with <img> tags
  let parts: React.ReactNode[] = [content];

  for (const emote of emotes) {
    parts = parts.flatMap((part, partIdx) => {
      if (typeof part !== 'string') return [part];
      const segments = part.split(new RegExp(`\\[${emote.name}\\]`, 'g'));
      if (segments.length === 1) return [part];
      return segments.flatMap((seg, i) =>
        i < segments.length - 1
          ? [
              seg,
              <img
                key={`${partIdx}-${emote.id}-${i}`}
                src={emote.src}
                alt={emote.name}
                title={emote.name}
                className="inline-block h-6 w-6 align-middle"
              />,
            ]
          : [seg],
      );
    });
  }

  return parts;
}

function BadgePill({ badge }: { badge: KickBadge }) {
  const label = (() => {
    switch (badge.type) {
      case 'broadcaster': return '👑';
      case 'moderator':   return '🔧';
      case 'subscriber':  return '⭐';
      case 'og':          return 'OG';
      case 'verified':    return '✓';
      case 'founder':     return 'F';
      default:            return badge.text ?? badge.type;
    }
  })();

  const color = (() => {
    switch (badge.type) {
      case 'broadcaster': return 'text-[#FFD700]';
      case 'moderator':   return 'text-[#53FC18]';
      case 'subscriber':  return 'text-purple-400';
      case 'og':          return 'text-orange-400';
      case 'verified':    return 'text-blue-400';
      default:            return 'text-gray-400';
    }
  })();

  return (
    <span className={`text-[11px] ${color}`} title={badge.text ?? badge.type}>
      {label}
    </span>
  );
}

export default function KickChatWidget({ providerToken, username, onLoginRequest }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [connected, setConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAutoScroll(nearBottom);
  }, []);

  // Connect to Kick chat via Pusher
  useEffect(() => {
    Pusher.logToConsole = false;

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    });

    pusherRef.current = pusher;

    pusher.connection.bind('connected', () => setConnected(true));
    pusher.connection.bind('disconnected', () => setConnected(false));
    pusher.connection.bind('error', () => setConnected(false));

    const channel = pusher.subscribe(`chatrooms.${CHATROOM_ID}.v2`);

    channel.bind('App\\Events\\ChatMessageEvent', (data: KickMessageEvent) => {
      const msg: ChatMsg = {
        id: data.id,
        username: data.sender.username,
        color: data.sender.identity?.color ?? '#aaaaaa',
        content: data.content,
        badges: parseBadges(data.sender.identity?.badges),
        profilePic: data.sender.profile_pic ?? undefined,
        isReply: data.type === 'reply',
        replyTo: data.metadata?.original_sender?.username,
        replyContent: data.metadata?.original_message?.content,
        emotes: data.emotes ?? [],
        ts: Date.now(),
      };

      setMessages(prev => {
        const next = [...prev, msg];
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
      });
    });

    // Subscription + gift sub events
    channel.bind('App\\Events\\SubscriptionEvent', (data: { username: string; months: number }) => {
      setMessages(prev => {
        const notice: ChatMsg = {
          id: `sub-${Date.now()}`,
          username: '⚡ Kick',
          color: '#53FC18',
          content: `${data.username} subscribed${data.months > 1 ? ` for ${data.months} months` : ''}!`,
          badges: [],
          ts: Date.now(),
        };
        const next = [...prev, notice];
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
      });
    });

    return () => {
      pusher.unsubscribe(`chatrooms.${CHATROOM_ID}.v2`);
      pusher.disconnect();
    };
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !providerToken || sending) return;

    setSending(true);
    setSendError('');

    try {
      const res = await fetch(SEND_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatroomId: CHATROOM_ID,
          content: text,
          token: providerToken,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSendError(err?.message ?? `Send failed (${res.status})`);
      } else {
        setInput('');
      }
    } catch {
      setSendError('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [input, providerToken, sending]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      {/* Messages list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-600">
              {connected ? 'Waiting for messages…' : 'Connecting…'}
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className="mb-1 break-words leading-snug">
            {msg.isReply && msg.replyTo && (
              <div className="mb-0.5 flex items-center gap-1 pl-2 text-[10px] text-gray-500">
                <span className="opacity-60">↩</span>
                <span className="font-semibold">{msg.replyTo}:</span>
                <span className="truncate opacity-60">{msg.replyContent}</span>
              </div>
            )}
            <span className="mr-1 inline-flex items-baseline gap-1">
              {msg.badges.map((b, i) => (
                <BadgePill key={i} badge={b} />
              ))}
              <span
                className="cursor-default font-bold text-[13px]"
                style={{ color: msg.color }}
              >
                {msg.username}
              </span>
              <span className="text-gray-400 text-[13px]">:</span>
            </span>
            <span className="text-[13px] text-gray-200">
              {renderContent(msg.content, msg.emotes)}
            </span>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom nudge */}
      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mx-3 mb-1 rounded border border-white/10 bg-black/80 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-white"
        >
          ↓ New messages
        </button>
      )}

      {/* Input area */}
      <div className="shrink-0 border-t border-white/10 bg-[#050505] px-3 py-2">
        {providerToken ? (
          <>
            {sendError && (
              <p className="mb-1 font-mono text-[10px] text-red-400">{sendError}</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={500}
                placeholder={`Chat as @${username || 'you'}…`}
                className="min-w-0 flex-1 rounded border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[12px] text-white placeholder-gray-600 outline-none focus:border-[#53FC18]/40 focus:bg-[#53FC18]/5"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="rounded border border-[#53FC18]/40 bg-[#53FC18]/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#53FC18] transition-all hover:bg-[#53FC18]/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? '…' : 'Send'}
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onLoginRequest}
            className="w-full rounded border border-[#53FC18]/40 bg-[#53FC18]/10 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/20"
          >
            Login to chat
          </button>
        )}
      </div>
    </div>
  );
}
