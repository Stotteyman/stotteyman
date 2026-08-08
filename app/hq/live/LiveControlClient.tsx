'use client';

import { useCallback, useEffect, useState } from 'react';

type Privacy = 'public' | 'unlisted' | 'invite_only' | 'off';

type Settings = {
  privacy: Privacy;
  title: string;
  description: string | null;
  category: string | null;
  show_on_site: boolean;
  chat_enabled: boolean;
  is_live: boolean;
};

type Invite = {
  id: string;
  label: string | null;
  max_uses: number | null;
  use_count: number;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

type Viewer = {
  id: string;
  display_name: string;
  user_id: string | null;
  started_at: string;
  last_seen_at: string;
  invite_id: string | null;
};

const PRIVACY_OPTIONS: { value: Privacy; label: string; hint: string }[] = [
  { value: 'public', label: 'Public', hint: 'Anyone can watch. Listed and indexable.' },
  { value: 'unlisted', label: 'Unlisted', hint: 'Anyone with the page link can watch. Not indexed.' },
  { value: 'invite_only', label: 'Invite only', hint: 'Only valid invite links can watch.' },
  { value: 'off', label: 'Off', hint: 'Nobody can watch. Playback is refused.' },
];

const btn =
  'rounded border border-line px-3 py-1.5 text-sm text-fg transition hover:border-line-strong hover:text-fg disabled:opacity-40';
const input =
  'w-full rounded border border-line bg-bg-raised px-3 py-2 text-sm text-fg placeholder-white/30 focus:border-line-strong focus:outline-none';

export default function LiveControlClient({ initialSettings }: { initialSettings: Settings | null }) {
  const [settings, setSettings] = useState<Settings | null>(initialSettings);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [freshLink, setFreshLink] = useState<string | null>(null);

  const [inviteLabel, setInviteLabel] = useState('');
  const [inviteMaxUses, setInviteMaxUses] = useState('');
  const [inviteHours, setInviteHours] = useState('');

  const refresh = useCallback(async () => {
    const [stateRes, inviteRes] = await Promise.all([
      fetch('/api/hq/live', { cache: 'no-store' }),
      fetch('/api/hq/live/invites', { cache: 'no-store' }),
    ]);
    if (stateRes.ok) {
      const data = await stateRes.json();
      if (data.settings) setSettings(data.settings);
      setViewers(data.viewers ?? []);
    }
    if (inviteRes.ok) {
      const data = await inviteRes.json();
      setInvites(data.invites ?? []);
    }
  }, []);

  useEffect(() => {
    void refresh();
    // The viewer list is only meaningful if it is roughly current; sessions
    // age out of the query after 30s of silence.
    const id = setInterval(refresh, 10_000);
    return () => clearInterval(id);
  }, [refresh]);

  const patchSettings = useCallback(
    async (patch: Partial<Settings>) => {
      setBusy(true);
      setNotice(null);
      try {
        const res = await fetch('/api/hq/live', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed');
        setSettings(data.settings);
        setNotice('Saved.');
        void refresh();
      } catch (e) {
        setNotice(e instanceof Error ? e.message : 'Failed');
      } finally {
        setBusy(false);
      }
    },
    [refresh]
  );

  const createInvite = useCallback(async () => {
    setBusy(true);
    setNotice(null);
    setFreshLink(null);
    try {
      const res = await fetch('/api/hq/live/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: inviteLabel || null,
          maxUses: inviteMaxUses ? Number(inviteMaxUses) : null,
          expiresInHours: inviteHours ? Number(inviteHours) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setFreshLink(data.inviteUrl);
      setInviteLabel('');
      setInviteMaxUses('');
      setInviteHours('');
      void refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }, [inviteLabel, inviteMaxUses, inviteHours, refresh]);

  const revokeInvite = useCallback(
    async (id: string) => {
      await fetch('/api/hq/live/invites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      void refresh();
    },
    [refresh]
  );

  const kickViewer = useCallback(
    async (id?: string, all?: boolean) => {
      await fetch('/api/hq/live/viewers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : { all }),
      });
      void refresh();
    },
    [refresh]
  );

  const sendObs = useCallback(async (command: string, payload: Record<string, unknown> = {}) => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch('/api/hq/live/obs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setNotice(`Queued ${command}. The agent picks it up within a few seconds.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }, []);

  if (!settings) return <p className="text-sm text-fg-muted">Live settings row is missing.</p>;

  return (
    <div className="space-y-12">
      {notice ? <p className="rounded border border-line px-3 py-2 text-sm text-fg-muted">{notice}</p> : null}

      {/* ---- privacy ---- */}
      <section>
        <h2 className="text-lg font-medium text-fg">Privacy</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {PRIVACY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={busy}
              onClick={() => void patchSettings({ privacy: opt.value })}
              className={`rounded border px-4 py-3 text-left transition ${
                settings.privacy === opt.value
                  ? 'border-line-strong bg-surface'
                  : 'border-line hover:border-line-strong'
              }`}
            >
              <span className="block text-sm text-fg">{opt.label}</span>
              <span className="mt-1 block text-xs text-fg-subtle">{opt.hint}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-fg-subtle">
          Tightening privacy revokes viewers who joined without an invite, so it takes effect for
          people already watching — not just new arrivals.
        </p>
      </section>

      {/* ---- metadata ---- */}
      <section>
        <h2 className="text-lg font-medium text-fg">Details</h2>
        <div className="mt-4 space-y-3">
          <input
            className={input}
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            onBlur={() => void patchSettings({ title: settings.title })}
            placeholder="Stream title"
          />
          <textarea
            className={input}
            rows={3}
            value={settings.description ?? ''}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            onBlur={() => void patchSettings({ description: settings.description })}
            placeholder="Description"
          />
          <div className="flex flex-wrap gap-4 text-sm text-fg-muted">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.show_on_site}
                onChange={(e) => void patchSettings({ show_on_site: e.target.checked })}
              />
              Show on public site
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.chat_enabled}
                onChange={(e) => void patchSettings({ chat_enabled: e.target.checked })}
              />
              Chat enabled
            </label>
          </div>
        </div>
      </section>

      {/* ---- invites ---- */}
      <section>
        <h2 className="text-lg font-medium text-fg">Invite links</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <input className={input} placeholder="Label (who it is for)" value={inviteLabel} onChange={(e) => setInviteLabel(e.target.value)} />
          <input className={input} placeholder="Max uses (blank = ∞)" value={inviteMaxUses} onChange={(e) => setInviteMaxUses(e.target.value)} inputMode="numeric" />
          <input className={input} placeholder="Expires in hours" value={inviteHours} onChange={(e) => setInviteHours(e.target.value)} inputMode="numeric" />
          <button type="button" className={btn} disabled={busy} onClick={() => void createInvite()}>
            Create link
          </button>
        </div>

        {freshLink ? (
          <div className="mt-4 rounded border border-line-strong bg-surface p-3">
            <p className="text-xs text-fg-subtle">Copy this now — it is shown once and cannot be recovered.</p>
            <code className="mt-2 block break-all text-xs text-fg">{freshLink}</code>
            <button
              type="button"
              className={`${btn} mt-2`}
              onClick={() => void navigator.clipboard.writeText(freshLink)}
            >
              Copy
            </button>
          </div>
        ) : null}

        <ul className="mt-6 space-y-2">
          {invites.map((inv) => {
            const dead = Boolean(inv.revoked_at) || (inv.expires_at != null && new Date(inv.expires_at) < new Date());
            return (
              <li key={inv.id} className="flex items-center justify-between rounded border border-line px-3 py-2 text-sm">
                <span className={dead ? 'text-fg-faint line-through' : 'text-fg'}>
                  {inv.label ?? 'Untitled'}
                  <span className="ml-2 text-xs text-fg-subtle">
                    {inv.use_count}
                    {inv.max_uses ? `/${inv.max_uses}` : ''} uses
                    {inv.expires_at ? ` · expires ${new Date(inv.expires_at).toLocaleString()}` : ''}
                  </span>
                </span>
                {!dead ? (
                  <button type="button" className={btn} onClick={() => void revokeInvite(inv.id)}>
                    Revoke
                  </button>
                ) : null}
              </li>
            );
          })}
          {invites.length === 0 ? <li className="text-sm text-fg-subtle">No invite links yet.</li> : null}
        </ul>
      </section>

      {/* ---- viewers ---- */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-fg">Watching now ({viewers.length})</h2>
          {viewers.length > 0 ? (
            <button type="button" className={btn} onClick={() => void kickViewer(undefined, true)}>
              Kick everyone
            </button>
          ) : null}
        </div>
        <ul className="mt-4 space-y-2">
          {viewers.map((v) => (
            <li key={v.id} className="flex items-center justify-between rounded border border-line px-3 py-2 text-sm">
              <span className="text-fg">
                {v.display_name}
                <span className="ml-2 text-xs text-fg-subtle">
                  since {new Date(v.started_at).toLocaleTimeString()}
                  {v.user_id ? ' · member' : v.invite_id ? ' · invite' : ''}
                </span>
              </span>
              <button type="button" className={btn} onClick={() => void kickViewer(v.id)}>
                Kick
              </button>
            </li>
          ))}
          {viewers.length === 0 ? <li className="text-sm text-fg-subtle">Nobody watching.</li> : null}
        </ul>
      </section>

      {/* ---- OBS ---- */}
      <section>
        <h2 className="text-lg font-medium text-fg">OBS</h2>
        <p className="mt-2 text-xs text-fg-subtle">
          Commands are queued for the agent running beside OBS. Nothing connects into your PC from
          here, so this works without exposing obs-websocket.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btn} disabled={busy} onClick={() => void sendObs('start_stream')}>
            Start streaming
          </button>
          <button type="button" className={btn} disabled={busy} onClick={() => void sendObs('stop_stream')}>
            Stop streaming
          </button>
          <button type="button" className={btn} disabled={busy} onClick={() => void sendObs('refresh_feed')}>
            Refresh IRL feed
          </button>
          <button type="button" className={btn} disabled={busy} onClick={() => void sendObs('get_status')}>
            Get status
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['IRL', 'LAG', 'BRB', 'STARTING', 'ENDING', 'PRIVACY'].map((scene) => (
            <button
              key={scene}
              type="button"
              className={btn}
              disabled={busy}
              onClick={() => void sendObs('set_scene', { scene })}
            >
              {scene}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
