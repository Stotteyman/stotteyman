'use client';

import { useMemo, useState } from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  BAND_LABEL,
  DOC_TYPES,
  DOC_TYPE_LABEL,
  type DocType,
  type DocumentRow,
  type Renewal,
  type RenewalBand,
} from '@/lib/hq/documents';

export type EntityOption = {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  kind: string;
};

type Props = {
  initialDocuments: DocumentRow[];
  initialRenewals: Renewal[];
  entities: EntityOption[];
  canWrite: boolean;
};

const BAND_ORDER: RenewalBand[] = ['overdue', 'due30', 'due60', 'due90', 'later'];

const BAND_TONE = {
  overdue: 'danger',
  due30: 'warn',
  due60: 'warn',
  due90: 'neutral',
  later: 'neutral',
} as const;

const input =
  'w-full rounded-sm border border-line bg-bg-raised px-3.5 py-2.5 text-body-sm text-fg ' +
  'placeholder:text-fg-faint focus:border-accent/40 focus:outline-none';

const labelCls = 'font-mono text-label uppercase text-fg-subtle';

/** `trailingSlash: true` eats a 308 on every fetch that omits the slash. */
const API = '/api/hq/documents/';

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function relative(days: number) {
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export default function LegalClient({
  initialDocuments,
  initialRenewals,
  entities,
  canWrite,
}: Props) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [renewals, setRenewals] = useState(initialRenewals);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterEntity, setFilterEntity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [form, setForm] = useState({
    title: '',
    entityId: '',
    docType: 'license' as DocType,
    link: '',
    expiresAt: '',
    reference: '',
    autoRenews: false,
  });

  const entityName = useMemo(() => {
    const map = new Map(entities.map((e) => [e.id, e.name]));
    return (id: string | null) => (id ? (map.get(id) ?? 'Unknown') : 'Group-wide');
  }, [entities]);

  const entityNameBySlug = useMemo(() => {
    const map = new Map(entities.map((e) => [e.slug, e.name]));
    return (slug: string | null) => (slug ? (map.get(slug) ?? slug) : '—');
  }, [entities]);

  async function refresh() {
    const res = await fetch(API, { cache: 'no-store' });
    if (!res.ok) return;
    const data = (await res.json()) as { documents: DocumentRow[]; renewals: Renewal[] };
    setDocuments(data.documents);
    setRenewals(data.renewals);
  }

  async function file(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('A title is required.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          entityId: form.entityId || null,
          docType: form.docType,
          link: form.link || null,
          expiresAt: form.expiresAt || null,
          reference: form.reference || null,
          autoRenews: form.autoRenews,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Could not file that.');

      setForm({
        title: '',
        entityId: form.entityId,
        docType: form.docType,
        link: '',
        expiresAt: '',
        reference: '',
        autoRenews: false,
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not file that.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await fetch(`${API}${id}/`, { method: 'DELETE' });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const banded = useMemo(() => {
    const groups = new Map<RenewalBand, Renewal[]>();
    for (const r of renewals) {
      if (r.band === 'later') continue;
      const list = groups.get(r.band) ?? [];
      list.push(r);
      groups.set(r.band, list);
    }
    return BAND_ORDER.filter((b) => b !== 'later' && groups.has(b)).map((b) => ({
      band: b,
      items: groups.get(b)!,
    }));
  }, [renewals]);

  const visible = useMemo(
    () =>
      documents.filter((d) => {
        if (!showArchived && (d.status === 'archived' || d.status === 'superseded')) return false;
        if (filterEntity && d.entity_id !== filterEntity) return false;
        if (filterType && d.doc_type !== filterType) return false;
        return true;
      }),
    [documents, filterEntity, filterType, showArchived]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, DocumentRow[]>();
    for (const d of visible) {
      const key = d.entity_id ?? '__group__';
      const list = map.get(key) ?? [];
      list.push(d);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) =>
      entityName(a[0] === '__group__' ? null : a[0]).localeCompare(
        entityName(b[0] === '__group__' ? null : b[0])
      )
    );
  }, [visible, entityName]);

  return (
    <div className="grid gap-12">
      {/* ── Renewals ─────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-mono text-label uppercase text-fg-subtle">Renewals</h2>
          <span className="font-mono text-label uppercase text-fg-faint">
            {renewals.length} tracked
          </span>
        </div>

        {banded.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-line p-6 text-body-sm text-fg-subtle">
            Nothing due in the next 90 days.
          </p>
        ) : (
          <div className="mt-5 grid gap-6">
            {banded.map(({ band, items }) => (
              <div key={band}>
                <div className="flex items-center gap-3">
                  <Badge tone={BAND_TONE[band]}>{BAND_LABEL[band]}</Badge>
                  <span className="font-mono text-label uppercase text-fg-faint">
                    {items.length}
                  </span>
                </div>
                <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
                  {items.map((r) => (
                    <li
                      key={r.key}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-body-sm text-fg">
                          {r.link ? (
                            <a
                              href={r.link}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="underline underline-offset-4 hover:text-accent"
                            >
                              {r.title}
                            </a>
                          ) : (
                            r.title
                          )}
                        </p>
                        <p className="mt-1 font-mono text-label uppercase text-fg-subtle">
                          {r.subtitle} ·{' '}
                          {r.kind === 'domain' ? entityNameBySlug(r.entitySlug) : entityName(r.entityId)}
                          {r.autoRenews ? ' · auto-renews' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-body-sm ${
                            r.band === 'overdue' ? 'text-danger' : 'text-fg-muted'
                          }`}
                        >
                          {fmtDate(r.expiresOn)}
                        </p>
                        <p className="mt-1 font-mono text-label uppercase text-fg-subtle">
                          {relative(r.daysUntil)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── File a document ──────────────────────────────────────────────── */}
      {canWrite ? (
        <section>
          <h2 className="font-mono text-label uppercase text-fg-subtle">File a document</h2>
          <form
            onSubmit={file}
            className="mt-5 grid gap-4 rounded-lg border border-line bg-surface p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className={labelCls}>Title</span>
                <input
                  className={input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Articles of Organization"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className={labelCls}>Business</span>
                <select
                  className={input}
                  value={form.entityId}
                  onChange={(e) => setForm({ ...form, entityId: e.target.value })}
                >
                  <option value="">Group-wide</option>
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className={labelCls}>Type</span>
                <select
                  className={input}
                  value={form.docType}
                  onChange={(e) => setForm({ ...form, docType: e.target.value as DocType })}
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {DOC_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className={labelCls}>Expires</span>
                <input
                  type="date"
                  className={input}
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className={labelCls}>Link</span>
                <input
                  className={input}
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="Paste the Drive or state-portal URL"
                />
              </label>

              <label className="grid gap-2">
                <span className={labelCls}>Reference</span>
                <input
                  className={input}
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="Licence or policy number"
                />
              </label>

              <label className="flex items-center gap-3 self-end pb-2.5">
                <input
                  type="checkbox"
                  checked={form.autoRenews}
                  onChange={(e) => setForm({ ...form, autoRenews: e.target.checked })}
                  className="h-4 w-4 accent-[rgb(255_122_26)]"
                />
                <span className="text-body-sm text-fg-muted">Renews automatically</span>
              </label>
            </div>

            {error ? <p className="text-body-sm text-danger">{error}</p> : null}

            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? 'Filing…' : 'File document'}
              </Button>
              <span className="text-body-sm text-fg-subtle">
                Only a title is required — everything else can be added later.
              </span>
            </div>
          </form>
        </section>
      ) : null}

      {/* ── Register ─────────────────────────────────────────────────────── */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-mono text-label uppercase text-fg-subtle">
            Register · {visible.length}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`${input} w-auto py-1.5`}
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
            >
              <option value="">All businesses</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <select
              className={`${input} w-auto py-1.5`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All types</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {DOC_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-body-sm text-fg-muted">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="h-4 w-4 accent-[rgb(255_122_26)]"
              />
              Show retired
            </label>
          </div>
        </div>

        {grouped.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-line p-8 text-center text-body-sm text-fg-subtle">
            No documents filed yet. Start with the LLC&apos;s formation documents and EIN letter.
          </p>
        ) : (
          <div className="mt-5 grid gap-8">
            {grouped.map(([key, docs]) => (
              <div key={key}>
                <h3 className="text-body font-medium text-fg">
                  {entityName(key === '__group__' ? null : key)}
                </h3>
                <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
                  {docs.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-start justify-between gap-4 px-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <p className="text-body-sm text-fg">
                            {d.link ? (
                              <a
                                href={d.link}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="underline underline-offset-4 hover:text-accent"
                              >
                                {d.title}
                              </a>
                            ) : (
                              d.title
                            )}
                          </p>
                          <Badge status={d.status} />
                        </div>
                        <p className="mt-1.5 font-mono text-label uppercase text-fg-subtle">
                          {DOC_TYPE_LABEL[d.doc_type] ?? d.doc_type}
                          {d.reference ? ` · ${d.reference}` : ''}
                          {d.expires_at ? ` · expires ${fmtDate(d.expires_at)}` : ''}
                          {d.auto_renews ? ' · auto' : ''}
                        </p>
                      </div>
                      {canWrite ? (
                        <button
                          type="button"
                          onClick={() => remove(d.id, d.title)}
                          disabled={busy}
                          className="font-mono text-label uppercase text-fg-faint transition-colors hover:text-danger"
                        >
                          Delete
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
