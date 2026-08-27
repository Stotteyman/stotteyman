'use client';

import { useCallback, useState } from 'react';

export type AmaRowView = {
  id: string;
  public_token: string;
  question: string;
  asker_name: string | null;
  asker_email: string | null;
  status: string;
  amount_cents: number;
  answer: string | null;
  answered_at: string | null;
  internal_notes: string | null;
  notified_at: string | null;
  paid_at: string | null;
  created_at: string;
};

const STATUS_TONE: Record<string, string> = {
  paid: 'border-amber-400/40 text-amber-200',
  answered: 'border-emerald-400/40 text-emerald-200',
  pending: 'border-line text-fg-faint',
  expired: 'border-line text-fg-faint',
  refunded: 'border-violet-400/40 text-violet-200',
};

/** How long a paid question has been sitting there, in words. */
function waitedFor(paidAt: string | null): string {
  if (!paidAt) return '';
  const mins = Math.floor((Date.now() - new Date(paidAt).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AmaClient({
  initial,
  siteUrl,
  notifyConfigured,
}: {
  initial: AmaRowView[];
  siteUrl: string;
  notifyConfigured: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<'waiting' | 'answered' | 'all'>('waiting');
  const [openId, setOpenId] = useState<string | null>(
    initial.find((r) => r.status === 'paid')?.id ?? null
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const patch = useCallback(async (id: string, body: Record<string, unknown>) => {
    setError('');
    setBusyId(id);
    try {
      const res = await fetch(`/api/hq/ama/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? 'Update failed.');
        return false;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...json.question } : r)));
      return true;
    } catch {
      setError('Network error.');
      return false;
    } finally {
      setBusyId(null);
    }
  }, []);

  const send = useCallback(
    async (id: string) => {
      const answer = (drafts[id] ?? '').trim();
      if (!answer) {
        setError('Write something before sending.');
        return;
      }
      const ok = await patch(id, { answer });
      if (ok) {
        setDrafts((d) => ({ ...d, [id]: '' }));
        setOpenId(null);
      }
    },
    [drafts, patch]
  );

  const visible = rows.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'waiting') return r.status === 'paid';
    return r.status === 'answered';
  });

  const waitingCount = rows.filter((r) => r.status === 'paid').length;
  // A paid row that never pinged means the webhook worked but every channel failed.
  const silentCount = rows.filter((r) => r.status === 'paid' && !r.notified_at).length;

  return (
    <div className="grid gap-6">
      {!notifyConfigured ? (
        <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          No alert channel is configured, so paid questions land here silently. Set
          <code className="mx-1 font-mono text-xs">AMA_DISCORD_WEBHOOK_URL</code>, or
          <code className="mx-1 font-mono text-xs">AMA_DISCORD_BOT_TOKEN</code> plus
          <code className="mx-1 font-mono text-xs">AMA_DISCORD_CHANNEL_ID</code>, in Netlify env.
        </p>
      ) : null}

      {silentCount > 0 ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {silentCount} paid {silentCount === 1 ? 'question' : 'questions'} never reached
          your phone — the payment landed but the alert failed. Check the notifier config.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ['waiting', `Waiting (${waitingCount})`],
            ['answered', 'Answered'],
            ['all', `All (${rows.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-4 py-1.5 text-label uppercase transition-colors ${
              filter === key
                ? 'border-line-strong bg-surface-hover text-fg'
                : 'border-line text-fg-subtle hover:border-line-strong'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-10 text-center text-sm text-fg-faint">
          {filter === 'waiting' ? 'Nothing waiting. Inbox zero.' : 'Nothing here yet.'}
        </p>
      ) : null}

      <div className="grid gap-3">
        {visible.map((r) => {
          const open = openId === r.id;
          return (
            <article key={r.id} className="rounded-lg border border-line bg-surface">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : r.id)}
                className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left"
              >
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] ${
                    STATUS_TONE[r.status] ?? 'border-line text-fg-subtle'
                  }`}
                >
                  {r.status}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-fg">{r.question}</span>
                <span className="shrink-0 font-mono text-xs text-fg-subtle">
                  ${(r.amount_cents / 100).toFixed(2)}
                </span>
                <span className="shrink-0 text-xs text-fg-faint">
                  {r.status === 'paid' ? waitedFor(r.paid_at) : new Date(r.created_at).toLocaleDateString()}
                </span>
              </button>

              {open ? (
                <div className="border-t border-line px-5 py-5">
                  <p className="whitespace-pre-wrap rounded-xl border border-line bg-black/25 p-4 text-sm leading-relaxed text-fg-muted">
                    {r.question}
                  </p>

                  <p className="mt-3 text-xs text-fg-faint">
                    {r.asker_name || 'Anonymous'}
                    {r.asker_email ? ` · ${r.asker_email}` : ''}
                    {' · '}
                    <a
                      href={`${siteUrl}/ama/q/${r.public_token}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      their page
                    </a>
                  </p>

                  {r.answer ? (
                    <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/70">
                        Sent {r.answered_at ? new Date(r.answered_at).toLocaleString() : ''}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
                        {r.answer}
                      </p>
                    </div>
                  ) : null}

                  <label className="mt-5 grid gap-1.5">
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
                      {r.answer ? 'Replace the answer' : 'Your answer'}
                    </span>
                    <textarea
                      rows={8}
                      value={drafts[r.id] ?? ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        // Ctrl/Cmd+Enter sends — this is a queue you work through fast.
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                          e.preventDefault();
                          void send(r.id);
                        }
                      }}
                      placeholder="Answer it the way you would say it out loud. Publishing sets the status to answered and it appears on their page immediately."
                      className="rounded-xl border border-line bg-bg-raised px-4 py-3 text-sm leading-relaxed text-fg outline-none focus:border-line-strong"
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => void send(r.id)}
                      className="rounded-full border border-accent bg-accent px-5 py-2 text-label uppercase text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {busyId === r.id ? 'Publishing…' : 'Publish answer'}
                    </button>
                    <span className="font-mono text-[0.65rem] uppercase text-fg-faint">
                      ⌘/Ctrl + Enter
                    </span>

                    {r.status !== 'refunded' ? (
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void patch(r.id, { status: 'refunded' })}
                        className="ml-auto rounded-full border border-line px-4 py-2 text-label uppercase text-fg-subtle hover:border-line-strong hover:text-fg-muted"
                      >
                        Mark refunded
                      </button>
                    ) : null}
                  </div>

                  <p className="mt-2 text-xs text-fg-faint">
                    Marking refunded only changes what their page says. Issue the actual
                    refund in Stripe.
                  </p>

                  <label className="mt-5 grid gap-1.5">
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
                      Internal notes
                    </span>
                    <textarea
                      rows={2}
                      defaultValue={r.internal_notes ?? ''}
                      onBlur={(e) => {
                        if (e.target.value !== (r.internal_notes ?? '')) {
                          void patch(r.id, { internal_notes: e.target.value });
                        }
                      }}
                      placeholder="Only you see this."
                      className="rounded-xl border border-line bg-bg-raised px-4 py-3 text-sm leading-relaxed text-fg outline-none focus:border-line-strong"
                    />
                  </label>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
