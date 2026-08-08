'use client';

import { useCallback, useState } from 'react';

export type ConsultRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  request_type: string;
  topic: string | null;
  details: string;
  budget_band: string | null;
  preferred_times: string | null;
  timezone: string | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
};

const STATUSES = ['new', 'reviewing', 'accepted', 'scheduled', 'declined', 'completed', 'no_show'];

const STATUS_TONE: Record<string, string> = {
  new: 'border-sky-400/40 text-sky-200',
  reviewing: 'border-amber-400/40 text-amber-200',
  accepted: 'border-emerald-400/40 text-emerald-200',
  scheduled: 'border-emerald-400/40 text-emerald-200',
  declined: 'border-line text-fg-faint',
  completed: 'border-violet-400/40 text-violet-200',
  no_show: 'border-red-400/40 text-red-200',
};

export default function ConsultsClient({ initial }: { initial: ConsultRow[] }) {
  const [rows, setRows] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('open');
  const [error, setError] = useState('');

  const update = useCallback(async (id: string, patch: Partial<ConsultRow>) => {
    setError('');
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const res = await fetch(`/api/hq/consults/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? 'Update failed.');
    }
  }, []);

  const visible = rows.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'open') return ['new', 'reviewing', 'accepted', 'scheduled'].includes(r.status);
    return r.status === filter;
  });

  const counts = {
    open: rows.filter((r) => ['new', 'reviewing', 'accepted', 'scheduled'].includes(r.status))
      .length,
    new: rows.filter((r) => r.status === 'new').length,
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'open', label: `Open (${counts.open})` },
          { key: 'new', label: `New (${counts.new})` },
          { key: 'all', label: `All (${rows.length})` },
          { key: 'completed', label: 'Completed' },
          { key: 'declined', label: 'Declined' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-label uppercase transition-colors ${
              filter === f.key
                ? 'border-line-strong bg-surface-hover text-fg'
                : 'border-line text-fg-subtle hover:border-line-strong'
            }`}
          >
            {f.label}
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
          Nothing here yet.
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
                  {r.status.replace('_', ' ')}
                </span>
                <span className="font-medium text-fg">{r.name}</span>
                <span className="text-xs text-fg-subtle">{r.email}</span>
                <span className="text-[0.6rem] uppercase tracking-[0.15em] text-fg-faint">
                  {r.request_type}
                </span>
                {r.topic ? (
                  <span className="min-w-0 flex-1 truncate text-sm text-fg-subtle">{r.topic}</span>
                ) : (
                  <span className="flex-1" />
                )}
                <span className="shrink-0 text-xs text-fg-faint">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </button>

              {open ? (
                <div className="border-t border-line px-5 py-5">
                  <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    {r.company ? <Row label="Company" value={r.company} /> : null}
                    {r.budget_band ? <Row label="Budget" value={r.budget_band} /> : null}
                    {r.preferred_times ? <Row label="Availability" value={r.preferred_times} /> : null}
                    {r.timezone ? <Row label="Timezone" value={r.timezone} /> : null}
                  </dl>

                  <p className="mt-5 whitespace-pre-wrap rounded-xl border border-line bg-black/25 p-4 text-sm leading-relaxed text-fg-muted">
                    {r.details}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <label className="grid gap-1.5">
                      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
                        Status
                      </span>
                      <select
                        value={r.status}
                        onChange={(e) => update(r.id, { status: e.target.value })}
                        className="rounded-lg border border-line bg-bg-raised px-3 py-2 text-sm text-fg outline-none focus:border-line-strong"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-[#07070a]">
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </label>

                    <a
                      href={`mailto:${r.email}?subject=${encodeURIComponent(
                        `Re: ${r.topic || 'your request'}`
                      )}`}
                      className="mt-5 rounded-full border border-line bg-surface px-5 py-2 text-label uppercase text-fg-muted hover:border-line-strong hover:text-fg"
                    >
                      Reply by email
                    </a>
                  </div>

                  <label className="mt-5 grid gap-1.5">
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
                      Internal notes
                    </span>
                    <textarea
                      rows={3}
                      defaultValue={r.internal_notes ?? ''}
                      onBlur={(e) => {
                        if (e.target.value !== (r.internal_notes ?? '')) {
                          update(r.id, { internal_notes: e.target.value });
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="text-fg-faint">{label}</dt>
      <dd className="text-fg-muted">{value}</dd>
    </div>
  );
}
