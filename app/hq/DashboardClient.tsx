'use client';

import { useCallback, useState } from 'react';

export type ConnectorView = {
  source: string;
  ok: boolean;
  error: string | null;
  fetchedAt: string | null;
  lastOkAt: string | null;
  durationMs: number | null;
  summary: Record<string, unknown>;
};

export type EntityCard = {
  slug: string;
  name: string;
  kind: string;
  status: string;
  domain: string | null;
  people: number | null;
  revenue30: number | null;
  currency: string | null;
  deployState: string | null;
  restricted: boolean;
  daysUntilExpiry: number | null;
};

function ago(iso: string | null): string {
  if (!iso) return 'never';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const money = (n: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(n);

export default function DashboardClient({
  connectors,
  cards,
  totals,
  canRefresh,
}: {
  connectors: ConnectorView[];
  cards: EntityCard[];
  totals: { people: number; revenue30: number; currency: string; domains: number; sites: number };
  canRefresh: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/hq/connectors/refresh/', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error ?? 'Refresh failed.');
      } else {
        const failed = (json.results as { source: string; ok: boolean }[]).filter((r) => !r.ok);
        setMessage(
          failed.length
            ? `Refreshed. Unavailable: ${failed.map((f) => f.source).join(', ')}`
            : 'Refreshed all sources.'
        );
        window.location.reload();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Refresh failed.');
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <div className="grid gap-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue · 30d" value={money(totals.revenue30, totals.currency)} />
        <Stat label="People across businesses" value={totals.people.toLocaleString()} />
        <Stat label="Live sites" value={String(totals.sites)} />
        <Stat label="Domains" value={String(totals.domains)} />
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Data sources</h2>
          {canRefresh ? (
            <div className="flex items-center gap-3">
              {message ? <span className="text-xs text-white/40">{message}</span> : null}
              <button
                type="button"
                onClick={refresh}
                disabled={busy}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/40 hover:text-white disabled:opacity-50"
              >
                {busy ? 'Refreshing…' : 'Refresh now'}
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {connectors.map((c) => {
            const unconfigured = !c.ok && /not set|No Stripe credentials/i.test(c.error ?? '');
            return (
              <div
                key={c.source}
                className={`rounded-2xl border p-4 ${
                  c.ok
                    ? 'border-white/10 bg-white/5'
                    : unconfigured
                      ? 'border-amber-400/30 bg-amber-400/5'
                      : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize text-white">{c.source}</span>
                  <span
                    className={`text-[0.6rem] uppercase tracking-[0.15em] ${
                      c.ok ? 'text-emerald-300' : unconfigured ? 'text-amber-300' : 'text-red-300'
                    }`}
                  >
                    {c.ok ? 'ok' : unconfigured ? 'not configured' : 'error'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-white/35">
                  {c.ok
                    ? `updated ${ago(c.fetchedAt)}${c.durationMs ? ` · ${c.durationMs}ms` : ''}`
                    : c.lastOkAt
                      ? `showing data from ${ago(c.lastOkAt)}`
                      : 'no data yet'}
                </p>
                {!c.ok && c.error ? (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/45">
                    {c.error}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">
          Businesses · {cards.length}
        </h2>
        <div className="mt-5 overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left">
                <Th>Business</Th>
                <Th align="right">Revenue 30d</Th>
                <Th align="right">People</Th>
                <Th>Deploy</Th>
                <Th align="right">Domain expiry</Th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.slug} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-medium text-white">{c.name}</span>
                      <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30">
                        {c.kind}
                      </span>
                      {c.restricted ? (
                        <span className="rounded-full border border-red-400/40 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.15em] text-red-300">
                          restricted team
                        </span>
                      ) : null}
                    </div>
                    {c.domain ? (
                      <span className="text-xs text-white/30">{c.domain}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-white/80">
                    {c.revenue30 === null ? (
                      <span className="text-white/20">—</span>
                    ) : (
                      money(c.revenue30, c.currency ?? 'usd')
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-white/80">
                    {c.people === null ? (
                      <span className="text-white/20">—</span>
                    ) : (
                      c.people.toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.deployState ? (
                      <span
                        className={
                          c.deployState === 'ready'
                            ? 'text-emerald-300'
                            : c.deployState === 'error'
                              ? 'text-red-300'
                              : 'text-white/50'
                        }
                      >
                        {c.deployState}
                      </span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c.daysUntilExpiry === null ? (
                      <span className="text-white/20">—</span>
                    ) : (
                      <span
                        className={
                          c.daysUntilExpiry <= 30
                            ? 'text-red-300'
                            : c.daysUntilExpiry <= 60
                              ? 'text-amber-300'
                              : 'text-white/60'
                        }
                      >
                        {c.daysUntilExpiry}d
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-4 py-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/40 ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      {children}
    </th>
  );
}
