'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

/**
 * Stream control panel.
 *
 * Five things live here: the overlay URLs you paste into OBS and Moblin, who is
 * allowed to use TTS, the donation review queue, the song queue, and broadcast
 * promotion. Everything writes through /api/hq/stream/* — this component holds no
 * Supabase credential and talks to no table directly.
 */

type Settings = Record<string, unknown> & {
  overlay_key: string;
  tts_enabled: boolean;
  tts_mode: string;
};

type Source = {
  id: string;
  platform: string;
  channel: string;
  enabled: boolean;
  external_id: string | null;
};

type TtsAccount = {
  id: string;
  platform: string;
  username: string;
  access: 'allow' | 'deny';
  note: string | null;
};

type Donation = {
  id: string;
  source: string;
  status: string;
  amount_cents: number;
  currency: string;
  donor_name: string | null;
  message: string | null;
  is_song_request: boolean;
  youtube_title: string | null;
  created_at: string;
};

type Song = {
  id: string;
  video_id: string;
  title: string | null;
  requested_by: string | null;
  amount_cents: number;
  status: string;
};

type Broadcast = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  scheduled_for: string | null;
  status: string;
  announced_at: string | null;
};

const TABS = ['Overlays', 'Chat & TTS', 'Donations', 'Songs', 'Promote'] as const;
type Tab = (typeof TABS)[number];

const card = 'rounded-xl border border-line bg-surface] p-5';
const label = 'block font-mono text-label uppercase text-fg-subtle';
const input =
  'mt-1 w-full rounded-lg border border-line bg-black/50 px-3 py-2 font-mono text-sm text-fg focus:border-line-strong focus:outline-none';
const button =
  'rounded-full border border-line bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-40';
const primary =
  'rounded-full border border-[#53fc18]/40 bg-[#53fc18]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#53fc18] transition-colors hover:bg-[#53fc18]/20 disabled:opacity-40';
const danger =
  'rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-40';

const money = (cents: number, currency = 'usd') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
};

export default function StreamControlClient({
  initialSettings,
  initialSources,
  siteUrl,
  canManage,
}: {
  initialSettings: Settings | null;
  initialSources: Source[];
  siteUrl: string;
  canManage: boolean;
}) {
  const [tab, setTab] = useState<Tab>('Overlays');
  const [settings, setSettings] = useState<Settings | null>(initialSettings);
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const say = useCallback((kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const call = useCallback(
    async (url: string, init?: RequestInit) => {
      setBusy(true);
      try {
        const res = await fetch(url, {
          ...init,
          headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          say('err', data.error ?? `Request failed (${res.status})`);
          return null;
        }
        return data;
      } catch {
        say('err', 'Network error.');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [say]
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="border-b border-line pb-6">
        <Link
          href="/"
          className="font-mono text-label uppercase text-fg-subtle hover:text-fg"
        >
          ← HQ
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-fg">Stream</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          Overlays, text-to-speech access, donations, song queue and promotion.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                tab === t
                  ? 'border-line-strong bg-surface-hover text-fg'
                  : 'border-line bg-surface] text-fg-subtle hover:text-fg'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {toast && (
        <div
          className={`mt-6 rounded-lg border px-4 py-3 font-mono text-[12px] ${
            toast.kind === 'ok'
              ? 'border-[#53fc18]/30 bg-[#53fc18]/10 text-[#53fc18]'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="mt-8">
        {tab === 'Overlays' && (
          <OverlaysTab
            settings={settings}
            setSettings={setSettings}
            sources={sources}
            setSources={setSources}
            siteUrl={siteUrl}
            canManage={canManage}
            call={call}
            say={say}
            busy={busy}
          />
        )}
        {tab === 'Chat & TTS' && (
          <ChatTtsTab
            settings={settings}
            setSettings={setSettings}
            canManage={canManage}
            call={call}
            say={say}
            busy={busy}
          />
        )}
        {tab === 'Donations' && <DonationsTab call={call} say={say} busy={busy} />}
        {tab === 'Songs' && <SongsTab call={call} say={say} busy={busy} />}
        {tab === 'Promote' && <PromoteTab call={call} say={say} busy={busy} />}
      </div>
    </main>
  );
}

// ── Overlays ─────────────────────────────────────────────────────────────────

function OverlaysTab({
  settings,
  setSettings,
  sources,
  setSources,
  siteUrl,
  canManage,
  call,
  say,
  busy,
}: {
  settings: Settings | null;
  setSettings: (s: Settings) => void;
  sources: Source[];
  setSources: (s: Source[]) => void;
  siteUrl: string;
  canManage: boolean;
  call: (url: string, init?: RequestInit) => Promise<Record<string, unknown> | null>;
  say: (k: 'ok' | 'err', t: string) => void;
  busy: boolean;
}) {
  const key = settings?.overlay_key ?? '';

  const urls = [
    {
      name: 'Unified chat — OBS (with voice)',
      url: `${siteUrl}/overlay/chat?key=${key}&tts=1`,
      note: 'Add to your desktop/game scenes. This is the ONLY copy that should speak.',
    },
    {
      name: 'Unified chat — Moblin / IRL (silent)',
      url: `${siteUrl}/overlay/chat?key=${key}`,
      note: 'Add as a browser widget on the phone. Leave it off OBS IRL scenes so it is not doubled.',
    },
    {
      name: 'Donation alerts',
      url: `${siteUrl}/overlay/alerts?key=${key}`,
      note: 'OBS only — it produces audio, and a second copy would fire every alert twice.',
    },
    {
      name: 'Now playing (song requests)',
      url: `${siteUrl}/overlay/song?key=${key}`,
      note: 'Silent. Safe to add anywhere.',
    },
  ];

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      say('ok', 'Copied.');
    } catch {
      say('err', 'Could not copy — select the text manually.');
    }
  };

  const rotate = async () => {
    if (
      !confirm(
        'Rotate the overlay key?\n\nEvery overlay URL stops working immediately, including the ones live on stream right now. You will have to paste the new URLs into OBS and Moblin.'
      )
    ) {
      return;
    }
    const data = await call('/api/hq/stream/settings/', { method: 'POST' });
    if (data?.overlayKey && settings) {
      setSettings({ ...settings, overlay_key: data.overlayKey as string });
      say('ok', 'Key rotated. Update OBS and Moblin with the new URLs.');
    }
  };

  const resolveKick = async (id: string) => {
    const data = await call('/api/hq/stream/sources/', {
      method: 'PATCH',
      body: JSON.stringify({ id, action: 'resolve' }),
    });
    if (data?.source) {
      setSources(sources.map((s) => (s.id === id ? (data.source as Source) : s)));
      say('ok', 'Chatroom id resolved.');
    }
  };

  const toggle = async (source: Source) => {
    const data = await call('/api/hq/stream/sources/', {
      method: 'PATCH',
      body: JSON.stringify({ id: source.id, enabled: !source.enabled }),
    });
    if (data?.source) {
      setSources(sources.map((s) => (s.id === source.id ? (data.source as Source) : s)));
    }
  };

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Browser source URLs
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Paste these into OBS (Sources → Browser) and Moblin (Widgets → Browser). They
          carry the overlay key, so treat them like a password.
        </p>

        <div className="mt-5 space-y-4">
          {urls.map((u) => (
            <div key={u.name} className="rounded-lg border border-line bg-bg-raised p-4">
              <p className="font-sans text-sm font-semibold text-fg">{u.name}</p>
              <p className="mt-1 text-[12px] text-fg-subtle">{u.note}</p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto whitespace-nowrap rounded bg-black/60 px-3 py-2 font-mono text-[11px] text-fg-muted">
                  {u.url}
                </code>
                <button type="button" className={button} onClick={() => copy(u.url)}>
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>

        {canManage && (
          <div className="mt-5 border-t border-line pt-4">
            <button type="button" className={danger} disabled={busy} onClick={rotate}>
              Rotate overlay key
            </button>
            <p className="mt-2 text-[12px] text-fg-subtle">
              The only way to revoke a leaked overlay URL.
            </p>
          </div>
        )}
      </section>

      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Chat sources
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Every enabled platform is merged into the one on-screen chat.
        </p>

        <div className="mt-4 space-y-3">
          {sources.map((s) => {
            const needsId = s.platform === 'kick' && !s.external_id;
            const needsYtId = s.platform === 'youtube' && !s.external_id;
            return (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-bg-raised p-3"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
                  {s.platform}
                </span>
                <span className="font-sans text-sm text-fg">{s.channel}</span>
                {s.external_id && (
                  <code className="font-mono text-[11px] text-fg-faint">{s.external_id}</code>
                )}
                <span className="flex-1" />
                {needsId && (
                  <button type="button" className={button} disabled={busy} onClick={() => resolveKick(s.id)}>
                    Resolve chatroom id
                  </button>
                )}
                {needsYtId && (
                  <span className="font-mono text-[11px] text-[#ff8c00]">
                    needs channel ID + YOUTUBE_API_KEY
                  </span>
                )}
                {canManage && (
                  <button
                    type="button"
                    className={s.enabled ? primary : button}
                    disabled={busy}
                    onClick={() => toggle(s)}
                  >
                    {s.enabled ? 'On' : 'Off'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── Chat & TTS ───────────────────────────────────────────────────────────────

function ChatTtsTab({
  settings,
  setSettings,
  canManage,
  call,
  say,
  busy,
}: {
  settings: Settings | null;
  setSettings: (s: Settings) => void;
  canManage: boolean;
  call: (url: string, init?: RequestInit) => Promise<Record<string, unknown> | null>;
  say: (k: 'ok' | 'err', t: string) => void;
  busy: boolean;
}) {
  const [accounts, setAccounts] = useState<TtsAccount[]>([]);
  const [draft, setDraft] = useState({ username: '', platform: 'any', access: 'allow' as 'allow' | 'deny' });

  const loadAccounts = useCallback(async () => {
    const data = await call('/api/hq/stream/tts-accounts/');
    if (data?.accounts) setAccounts(data.accounts as TtsAccount[]);
  }, [call]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const save = async (patch: Record<string, unknown>) => {
    const data = await call('/api/hq/stream/settings/', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (data?.settings) {
      setSettings(data.settings as Settings);
      say('ok', 'Saved.');
    }
  };

  /**
   * Access is passed in rather than read from `draft`: setting state then calling
   * this in the same handler would send the PREVIOUS access value, which silently
   * allowed someone you meant to deny.
   */
  const addAccount = async (access: 'allow' | 'deny') => {
    const username = draft.username.trim();
    if (!username) return;
    const data = await call('/api/hq/stream/tts-accounts/', {
      method: 'POST',
      body: JSON.stringify({ username, platform: draft.platform, access }),
    });
    if (data?.account) {
      setDraft({ ...draft, username: '' });
      await loadAccounts();
      say('ok', `${username} ${access === 'allow' ? 'allowed' : 'denied'}.`);
    }
  };

  const remove = async (id: string) => {
    const data = await call(`/api/hq/stream/tts-accounts/?id=${id}`, { method: 'DELETE' });
    if (data?.ok) await loadAccounts();
  };

  if (!settings) return <p className="text-fg-subtle">Settings unavailable.</p>;

  const num = (k: string) => Number(settings[k] ?? 0);
  const bool = (k: string) => Boolean(settings[k]);

  const allowed = accounts.filter((a) => a.access === 'allow');
  const denied = accounts.filter((a) => a.access === 'deny');

  return (
    <div className="space-y-6">
      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
            Text to speech
          </h2>
          <button
            type="button"
            className={bool('tts_enabled') ? primary : button}
            disabled={busy || !canManage}
            onClick={() => save({ tts_enabled: !bool('tts_enabled') })}
          >
            {bool('tts_enabled') ? 'TTS is ON' : 'TTS is OFF'}
          </button>
        </div>

        <div className="mt-5">
          <span className={label}>Who gets read aloud</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { id: 'allowlist', name: 'Allowlist only', hint: 'Only accounts you add below' },
              { id: 'subscribers', name: 'Subs & mods', hint: 'Plus anyone on the allowlist' },
              { id: 'everyone', name: 'Everyone', hint: 'Except accounts you deny' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                disabled={busy || !canManage}
                onClick={() => save({ tts_mode: mode.id })}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  settings.tts_mode === mode.id
                    ? 'border-[#53fc18]/50 bg-[#53fc18]/10'
                    : 'border-line bg-bg-raised hover:border-line-strong'
                }`}
              >
                <span className="block font-sans text-sm font-semibold text-fg">{mode.name}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-fg-subtle">{mode.hint}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-fg-subtle">
            A denied account stays silent in every mode — deny always wins.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className={label}>Voice</span>
            <input
              className={input}
              defaultValue={String(settings.tts_voice ?? '')}
              onBlur={(e) => save({ tts_voice: e.target.value })}
              disabled={!canManage}
            />
          </label>
          <label>
            <span className={label}>Speed (0.5–2)</span>
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="2"
              className={input}
              defaultValue={num('tts_rate')}
              onBlur={(e) => save({ tts_rate: e.target.value })}
              disabled={!canManage}
            />
          </label>
          <label>
            <span className={label}>Volume (0–1)</span>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              className={input}
              defaultValue={num('tts_volume')}
              onBlur={(e) => save({ tts_volume: e.target.value })}
              disabled={!canManage}
            />
          </label>
          <label>
            <span className={label}>Cooldown per person (s)</span>
            <input
              type="number"
              min="0"
              className={input}
              defaultValue={num('tts_cooldown_seconds')}
              onBlur={(e) => save({ tts_cooldown_seconds: e.target.value })}
              disabled={!canManage}
            />
          </label>
          <label>
            <span className={label}>Max characters</span>
            <input
              type="number"
              min="1"
              max="500"
              className={input}
              defaultValue={num('tts_max_chars')}
              onBlur={(e) => save({ tts_max_chars: e.target.value })}
              disabled={!canManage}
            />
          </label>
          <label className="sm:col-span-2 lg:col-span-3">
            <span className={label}>Blocked words (comma separated)</span>
            <input
              className={input}
              defaultValue={(settings.tts_blocked_words as string[] | undefined)?.join(', ') ?? ''}
              onBlur={(e) => save({ tts_blocked_words: e.target.value })}
              disabled={!canManage}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ['tts_read_name', 'Read the name'],
            ['tts_skip_links', 'Skip messages with links'],
            ['chat_hide_commands', 'Hide ! commands'],
            ['chat_show_platform', 'Show platform tag'],
          ].map(([key, name]) => (
            <button
              key={key}
              type="button"
              disabled={busy || !canManage}
              onClick={() => save({ [key]: !bool(key) })}
              className={bool(key) ? primary : button}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          TTS access by account
        </h2>

        {canManage && (
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="min-w-[12rem] flex-1">
              <span className={label}>Username</span>
              <input
                className={input}
                value={draft.username}
                placeholder="viewer name"
                onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addAccount('allow')}
              />
            </label>
            <label>
              <span className={label}>Platform</span>
              <select
                className={input}
                value={draft.platform}
                onChange={(e) => setDraft({ ...draft, platform: e.target.value })}
              >
                <option value="any">Any</option>
                <option value="kick">Kick</option>
                <option value="twitch">Twitch</option>
                <option value="youtube">YouTube</option>
              </select>
            </label>
            <button
              type="button"
              className={primary}
              disabled={busy}
              onClick={() => addAccount('allow')}
            >
              Allow
            </button>
            <button
              type="button"
              className={danger}
              disabled={busy}
              onClick={() => addAccount('deny')}
            >
              Deny
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="font-mono text-label uppercase text-[#53fc18]">
              Allowed ({allowed.length})
            </p>
            <ul className="mt-2 space-y-1">
              {allowed.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded border border-line bg-bg-raised px-3 py-2"
                >
                  <span className="font-mono text-[10px] uppercase text-fg-faint">{a.platform}</span>
                  <span className="text-sm text-fg">{a.username}</span>
                  <span className="flex-1" />
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      className="font-mono text-[11px] text-fg-faint hover:text-red-300"
                    >
                      remove
                    </button>
                  )}
                </li>
              ))}
              {!allowed.length && <li className="text-[12px] text-fg-faint">Nobody yet.</li>}
            </ul>
          </div>

          <div>
            <p className="font-mono text-label uppercase text-red-400">
              Denied ({denied.length})
            </p>
            <ul className="mt-2 space-y-1">
              {denied.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded border border-line bg-bg-raised px-3 py-2"
                >
                  <span className="font-mono text-[10px] uppercase text-fg-faint">{a.platform}</span>
                  <span className="text-sm text-fg">{a.username}</span>
                  <span className="flex-1" />
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      className="font-mono text-[11px] text-fg-faint hover:text-fg"
                    >
                      remove
                    </button>
                  )}
                </li>
              ))}
              {!denied.length && <li className="text-[12px] text-fg-faint">Nobody denied.</li>}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Donations ────────────────────────────────────────────────────────────────

function DonationsTab({
  call,
  say,
  busy,
}: {
  call: (url: string, init?: RequestInit) => Promise<Record<string, unknown> | null>;
  say: (k: 'ok' | 'err', t: string) => void;
  busy: boolean;
}) {
  const [pending, setPending] = useState<Donation[]>([]);
  const [recent, setRecent] = useState<Donation[]>([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    const data = await call('/api/hq/stream/donations/');
    if (data) {
      setPending((data.pending ?? []) as Donation[]);
      setRecent((data.recent ?? []) as Donation[]);
      setTotal((data.totalCents ?? 0) as number);
    }
  }, [call]);

  useEffect(() => {
    void load();
    // Pending claims arrive while the panel is open; without a refresh they sit
    // unseen until a manual reload.
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    const data = await call('/api/hq/stream/donations/', {
      method: 'POST',
      body: JSON.stringify({ id, action }),
    });
    if (data?.ok) {
      say('ok', action === 'approve' ? 'Approved — alert fired.' : 'Rejected.');
      await load();
    }
  };

  const test = async () => {
    const data = await call('/api/hq/stream/donations/', {
      method: 'POST',
      body: JSON.stringify({ action: 'test' }),
    });
    if (data?.ok) say('ok', 'Test alert queued — watch the alerts overlay.');
  };

  return (
    <div className="space-y-6">
      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={label}>Confirmed all time</p>
            <p className="mt-1 text-2xl font-semibold text-fg">{money(total)}</p>
          </div>
          <button type="button" className={button} disabled={busy} onClick={test}>
            Fire test alert
          </button>
        </div>
      </section>

      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Awaiting confirmation ({pending.length})
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Cash App and crypto have no webhook, so these are claims. Check the money landed,
          then approve — that is what fires the alert and queues the song.
        </p>

        <div className="mt-4 space-y-2">
          {pending.map((d) => (
            <div key={d.id} className="rounded-lg border border-line bg-bg-raised p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-label uppercase text-[#ff8c00]">
                  {d.source}
                </span>
                <span className="font-sans text-base font-semibold text-fg">
                  {money(d.amount_cents, d.currency)}
                </span>
                <span className="text-sm text-fg-muted">{d.donor_name ?? 'Anonymous'}</span>
                {d.is_song_request && (
                  <span className="font-mono text-label uppercase text-[#ff4444]">
                    song
                  </span>
                )}
                <span className="flex-1" />
                <button
                  type="button"
                  className={primary}
                  disabled={busy}
                  onClick={() => act(d.id, 'approve')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className={danger}
                  disabled={busy}
                  onClick={() => act(d.id, 'reject')}
                >
                  Reject
                </button>
              </div>
              {d.message && <p className="mt-2 text-sm text-fg-muted">“{d.message}”</p>}
              {d.youtube_title && (
                <p className="mt-1 font-mono text-[11px] text-fg-subtle">♪ {d.youtube_title}</p>
              )}
            </div>
          ))}
          {!pending.length && <p className="text-[12px] text-fg-faint">Nothing waiting.</p>}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">Recent</h2>
        <div className="mt-3 space-y-1">
          {recent.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center gap-3 rounded border border-line bg-bg-raised px-3 py-2"
            >
              <span className="font-mono text-[10px] uppercase text-fg-faint">{d.source}</span>
              <span className="text-sm font-semibold text-fg">
                {money(d.amount_cents, d.currency)}
              </span>
              <span className="text-sm text-fg-muted">{d.donor_name ?? 'Anonymous'}</span>
              {d.message && <span className="text-[12px] text-fg-subtle">“{d.message}”</span>}
            </div>
          ))}
          {!recent.length && <p className="text-[12px] text-fg-faint">No donations yet.</p>}
        </div>
      </section>
    </div>
  );
}

// ── Songs ────────────────────────────────────────────────────────────────────

function SongsTab({
  call,
  say,
  busy,
}: {
  call: (url: string, init?: RequestInit) => Promise<Record<string, unknown> | null>;
  say: (k: 'ok' | 'err', t: string) => void;
  busy: boolean;
}) {
  const [awaiting, setAwaiting] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [playing, setPlaying] = useState<Song | null>(null);

  const load = useCallback(async () => {
    const data = await call('/api/hq/stream/songs/');
    if (data) {
      setAwaiting((data.awaiting ?? []) as Song[]);
      setQueue((data.queue ?? []) as Song[]);
      setPlaying((data.playing ?? null) as Song | null);
    }
  }, [call]);

  useEffect(() => {
    void load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [load]);

  const act = async (id: string | undefined, action: string) => {
    const data = await call('/api/hq/stream/songs/', {
      method: 'POST',
      body: JSON.stringify({ id, action }),
    });
    if (data?.ok) {
      say('ok', 'Done.');
      await load();
    }
  };

  const row = (s: Song, actions: { name: string; action: string; style: string }[]) => (
    <div
      key={s.id}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-bg-raised p-3"
    >
      <span className="font-mono text-[11px] text-[#53fc18]">{money(s.amount_cents)}</span>
      <a
        href={`https://www.youtube.com/watch?v=${s.video_id}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-fg hover:text-[#ff4444]"
      >
        {s.title ?? s.video_id}
      </a>
      {s.requested_by && <span className="text-[12px] text-fg-subtle">by {s.requested_by}</span>}
      <span className="flex-1" />
      {actions.map((a) => (
        <button
          key={a.action}
          type="button"
          className={a.style}
          disabled={busy}
          onClick={() => act(s.id, a.action)}
        >
          {a.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Now playing
        </h2>
        {playing ? (
          <div className="mt-3">
            {row(playing, [{ name: 'Finish', action: 'finish', style: button }])}
          </div>
        ) : (
          <p className="mt-3 text-[12px] text-fg-faint">Nothing playing.</p>
        )}
      </section>

      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Awaiting approval ({awaiting.length})
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Paid requests that have not been vetted. Check the link before approving.
        </p>
        <div className="mt-3 space-y-2">
          {awaiting.map((s) =>
            row(s, [
              { name: 'Approve', action: 'approve', style: primary },
              { name: 'Skip', action: 'skip', style: danger },
            ])
          )}
          {!awaiting.length && <p className="text-[12px] text-fg-faint">Nothing waiting.</p>}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Queue ({queue.length}) — highest payer first
        </h2>
        <div className="mt-3 space-y-2">
          {queue.map((s) =>
            row(s, [
              { name: 'Play', action: 'play', style: primary },
              { name: 'Skip', action: 'skip', style: danger },
            ])
          )}
          {!queue.length && <p className="text-[12px] text-fg-faint">Queue is empty.</p>}
        </div>
      </section>
    </div>
  );
}

// ── Promote ──────────────────────────────────────────────────────────────────

const ANNOUNCE_CHANNELS = ['discord', 'x', 'facebook', 'instagram', 'blog'] as const;

function PromoteTab({
  call,
  say,
  busy,
}: {
  call: (url: string, init?: RequestInit) => Promise<Record<string, unknown> | null>;
  say: (k: 'ok' | 'err', t: string) => void;
  busy: boolean;
}) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [draft, setDraft] = useState({ title: '', description: '', category: '', scheduledFor: '' });
  const [channels, setChannels] = useState<string[]>(['discord']);

  const load = useCallback(async () => {
    const data = await call('/api/hq/stream/broadcasts/');
    if (data?.broadcasts) setBroadcasts(data.broadcasts as Broadcast[]);
  }, [call]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!draft.title.trim()) return say('err', 'Give it a title.');
    const data = await call('/api/hq/stream/broadcasts/', {
      method: 'POST',
      body: JSON.stringify(draft),
    });
    if (data?.broadcast) {
      setDraft({ title: '', description: '', category: '', scheduledFor: '' });
      await load();
      say('ok', 'Broadcast planned.');
    }
  };

  const act = async (id: string, action: string) => {
    const data = await call('/api/hq/stream/broadcasts/', {
      method: 'PATCH',
      body: JSON.stringify({ id, action, channels }),
    });
    if (data) {
      await load();
      if (action === 'announce') {
        const outcomes = (data.outcomes ?? []) as { channel: string; status: string; error?: string }[];
        const failed = outcomes.filter((o) => o.status === 'failed');
        say(
          failed.length ? 'err' : 'ok',
          failed.length
            ? `Posted with problems: ${failed.map((f) => `${f.channel} (${f.error})`).join(', ')}`
            : `Announced to ${outcomes.map((o) => o.channel).join(', ') || 'the queue'}.`
        );
      } else {
        say('ok', 'Updated.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Plan a broadcast
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={label}>Title</span>
            <input
              className={input}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Arma Reforger — FuriousPvP night"
            />
          </label>
          <label className="sm:col-span-2">
            <span className={label}>Description</span>
            <textarea
              rows={3}
              className={`${input} resize-none`}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </label>
          <label>
            <span className={label}>Category</span>
            <input
              className={input}
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              placeholder="Gaming / IRL"
            />
          </label>
          <label>
            <span className={label}>Scheduled for</span>
            <input
              type="datetime-local"
              className={input}
              value={draft.scheduledFor}
              onChange={(e) => setDraft({ ...draft, scheduledFor: e.target.value })}
            />
          </label>
        </div>
        <button type="button" className={`${primary} mt-4`} disabled={busy} onClick={create}>
          Save broadcast
        </button>
      </section>

      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Announce to
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Goes out through Studio, so it uses the same adapters, retries and audit trail as
          every other post.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ANNOUNCE_CHANNELS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() =>
                setChannels((prev) =>
                  prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                )
              }
              className={channels.includes(c) ? primary : button}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Broadcasts
        </h2>
        <div className="mt-3 space-y-2">
          {broadcasts.map((b) => (
            <div key={b.id} className="rounded-lg border border-line bg-bg-raised p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-label uppercase text-fg-subtle">
                  {b.status}
                </span>
                <span className="font-sans text-sm font-semibold text-fg">{b.title}</span>
                {b.scheduled_for && (
                  <span className="font-mono text-[11px] text-fg-faint">
                    {new Date(b.scheduled_for).toLocaleString()}
                  </span>
                )}
                <span className="flex-1" />
                <button
                  type="button"
                  className={primary}
                  disabled={busy}
                  onClick={() => act(b.id, 'announce')}
                >
                  {b.announced_at ? 'Announce again' : 'Announce'}
                </button>
                <button type="button" className={button} disabled={busy} onClick={() => act(b.id, 'live')}>
                  Live
                </button>
                <button type="button" className={button} disabled={busy} onClick={() => act(b.id, 'end')}>
                  End
                </button>
              </div>
              {b.description && <p className="mt-2 text-sm text-fg-muted">{b.description}</p>}
            </div>
          ))}
          {!broadcasts.length && <p className="text-[12px] text-fg-faint">Nothing planned yet.</p>}
        </div>
      </section>
    </div>
  );
}
