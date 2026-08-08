'use client';

import { useCallback, useEffect, useState } from 'react';

type Invite = {
  id: string;
  email: string;
  role_slug: string;
  note: string | null;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

type Member = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  status: string;
  roles: string[];
};

const ROLES = ['owner', 'admin', 'operator', 'collaborator', 'client', 'viewer'];

function statusOf(i: Invite): { label: string; tone: string } {
  if (i.accepted_at) return { label: 'Accepted', tone: 'text-emerald-300' };
  if (i.revoked_at) return { label: 'Revoked', tone: 'text-fg-faint' };
  if (new Date(i.expires_at) < new Date()) return { label: 'Expired', tone: 'text-amber-300' };
  return { label: 'Pending', tone: 'text-sky-300' };
}

export default function PeopleClient({ members }: { members: Member[] }) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/hq/invites');
    if (res.ok) {
      const json = (await res.json()) as { invites: Invite[] };
      setInvites(json.invites);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setError('');
      setLastLink(null);
      setCopied(false);
      try {
        const res = await fetch('/api/hq/invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role, note }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? 'Failed to create invite.');
        } else {
          setLastLink(json.inviteUrl);
          setEmail('');
          setNote('');
          await load();
        }
      } finally {
        setBusy(false);
      }
    },
    [email, role, note, load]
  );

  const revoke = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/hq/invites/${id}`, { method: 'DELETE' });
      if (res.ok) await load();
    },
    [load]
  );

  return (
    <div className="grid gap-10">
      <section>
        <h2 className="text-label uppercase text-fg-subtle">Invite someone</h2>

        <form
          onSubmit={create}
          className="mt-5 rounded-xl border border-line bg-surface p-6"
        >
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <label className="grid gap-2">
              <span className="text-xs text-fg-subtle">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="them@example.com"
                className="rounded-xl border border-line bg-bg-raised px-4 py-3 text-sm text-fg outline-none focus:border-line-strong"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs text-fg-subtle">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-xl border border-line bg-bg-raised px-4 py-3 text-sm text-fg outline-none focus:border-line-strong"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-[#07070a]">
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 grid gap-2">
            <span className="text-xs text-fg-subtle">Note (optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What are they here for?"
              className="rounded-xl border border-line bg-bg-raised px-4 py-3 text-sm text-fg outline-none focus:border-line-strong"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex items-center justify-center rounded-full border border-line bg-surface-hover px-6 py-3 text-sm font-medium text-fg transition-all duration-300 hover:border-line-strong disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create invite'}
          </button>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {lastLink ? (
            <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-label uppercase text-emerald-200/80">
                Invite link — shown once
              </p>
              <p className="mt-2 break-all font-mono text-xs text-emerald-100">{lastLink}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(lastLink);
                    setCopied(true);
                  }}
                  className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs text-emerald-100 hover:bg-emerald-400/10"
                >
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <span className="text-xs text-emerald-200/60">
                  Email delivery is not wired yet — send this yourself.
                </span>
              </div>
            </div>
          ) : null}
        </form>
      </section>

      <section>
        <h2 className="text-label uppercase text-fg-subtle">
          Members · {members.length}
        </h2>
        <div className="mt-5 grid gap-3">
          {members.length === 0 ? (
            <p className="rounded-lg border border-line bg-surface px-5 py-4 text-sm text-fg-subtle">
              No members yet.
            </p>
          ) : (
            members.map((m) => (
              <div
                key={m.user_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-fg">
                    {m.display_name ?? m.email ?? m.user_id}
                  </p>
                  <p className="text-xs text-fg-subtle">{m.email}</p>
                </div>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
                  {m.roles.join(', ') || 'no role'}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-label uppercase text-fg-subtle">
          Invites · {invites.length}
        </h2>
        <div className="mt-5 grid gap-3">
          {invites.length === 0 ? (
            <p className="rounded-lg border border-line bg-surface px-5 py-4 text-sm text-fg-subtle">
              No invites yet.
            </p>
          ) : (
            invites.map((i) => {
              const s = statusOf(i);
              const pending = !i.accepted_at && !i.revoked_at;
              return (
                <div
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-5 py-4"
                >
                  <div>
                    <p className="text-sm text-fg">{i.email}</p>
                    <p className="text-xs text-fg-subtle">
                      {i.role_slug}
                      {i.note ? ` · ${i.note}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs ${s.tone}`}>{s.label}</span>
                    {pending ? (
                      <button
                        type="button"
                        onClick={() => revoke(i.id)}
                        className="rounded-full border border-line px-4 py-2 text-xs text-fg-muted hover:border-red-400/50 hover:text-red-200"
                      >
                        Revoke
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
