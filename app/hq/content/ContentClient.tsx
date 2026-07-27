'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Collection, Field } from '@/lib/hq/collections';

type Row = Record<string, unknown> & { id: string };
type CopyRow = {
  key: string;
  value: string;
  label: string;
  section: string;
  multiline: boolean;
  sort_order: number;
};

export default function ContentClient({
  collections,
  copy,
}: {
  collections: Collection[];
  copy: CopyRow[];
}) {
  const [tab, setTab] = useState<string>('copy');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const active = collections.find((c) => c.key === tab);

  const load = useCallback(async (key: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/hq/content/${key}/`);
      const json = await res.json();
      if (!res.ok) setError(json.error ?? 'Failed to load.');
      else setRows(json.rows as Row[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== 'copy') void load(tab);
    else setRows([]);
    setOpenId(null);
  }, [tab, load]);

  const flash = (msg: string) => {
    setSaved(msg);
    window.setTimeout(() => setSaved(''), 2500);
  };

  const save = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      setError('');
      const res = await fetch(`/api/hq/content/${tab}/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Save failed.');
        return false;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? (json.row as Row) : r)));
      flash('Saved');
      return true;
    },
    [tab]
  );

  const create = useCallback(async () => {
    if (!active) return;
    const title = window.prompt(`New ${active.label.replace(/s$/, '')} — title?`);
    if (!title?.trim()) return;
    setError('');
    const res = await fetch(`/api/hq/content/${tab}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [active.titleField]: title.trim(), published: false }),
    });
    const json = await res.json();
    if (!res.ok) setError(json.error ?? 'Create failed.');
    else {
      await load(tab);
      setOpenId((json.row as Row).id);
      flash('Created — unpublished');
    }
  }, [active, tab, load]);

  const remove = useCallback(
    async (row: Row) => {
      if (!active) return;
      const name = String(row[active.titleField] ?? 'this entry');
      if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
      const res = await fetch(`/api/hq/content/${tab}/${row.id}/`, { method: 'DELETE' });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        flash('Deleted');
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Delete failed.');
      }
    },
    [active, tab]
  );

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-2">
        <TabButton active={tab === 'copy'} onClick={() => setTab('copy')}>
          Page copy
        </TabButton>
        {collections.map((c) => (
          <TabButton key={c.key} active={tab === c.key} onClick={() => setTab(c.key)}>
            {c.label}
          </TabButton>
        ))}
        <span className="ml-auto text-xs text-emerald-300">{saved}</span>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {tab === 'copy' ? (
        <CopyEditor copy={copy} onSaved={() => flash('Saved')} onError={setError} />
      ) : active ? (
        <section>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-white/45">{active.description}</p>
            <button
              type="button"
              onClick={create}
              className="shrink-0 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/40 hover:text-white"
            >
              + New
            </button>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-white/35">Loading…</p>
          ) : (
            <div className="mt-6 grid gap-3">
              {rows.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
                  Nothing here yet.
                </p>
              ) : null}

              {rows.map((row) => (
                <RowEditor
                  key={row.id}
                  collection={active}
                  row={row}
                  open={openId === row.id}
                  onToggle={() => setOpenId(openId === row.id ? null : row.id)}
                  onSave={(patch) => save(row.id, patch)}
                  onDelete={() => remove(row)}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors ${
        active
          ? 'border-white/40 bg-white/10 text-white'
          : 'border-white/10 text-white/45 hover:border-white/25'
      }`}
    >
      {children}
    </button>
  );
}

function CopyEditor({
  copy,
  onSaved,
  onError,
}: {
  copy: CopyRow[];
  onSaved: () => void;
  onError: (m: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(copy.map((c) => [c.key, c.value]))
  );
  const [busy, setBusy] = useState(false);

  const sections = Array.from(new Set(copy.map((c) => c.section)));
  const dirty = copy.some((c) => values[c.key] !== c.value);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/hq/copy/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });
      const json = await res.json();
      if (!res.ok) onError(json.error ?? 'Save failed.');
      else onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-8">
      <p className="text-sm text-white/45">
        Headlines and body copy across the public site. Changes go live within five minutes.
      </p>

      {sections.map((section) => (
        <section key={section}>
          <h3 className="text-xs uppercase tracking-[0.3em] text-white/40">/{section}</h3>
          <div className="mt-4 grid gap-4">
            {copy
              .filter((c) => c.section === section)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((c) => (
                <label key={c.key} className="grid gap-1.5">
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
                    {c.label}
                  </span>
                  {c.multiline ? (
                    <textarea
                      rows={3}
                      value={values[c.key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [c.key]: e.target.value }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-white/40"
                    />
                  ) : (
                    <input
                      value={values[c.key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [c.key]: e.target.value }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-white/40"
                    />
                  )}
                </label>
              ))}
          </div>
        </section>
      ))}

      <div>
        <button
          type="button"
          onClick={submit}
          disabled={busy || !dirty}
          className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm text-white hover:border-white/40 disabled:opacity-40"
        >
          {busy ? 'Saving…' : dirty ? 'Save copy' : 'No changes'}
        </button>
      </div>
    </div>
  );
}

function RowEditor({
  collection,
  row,
  open,
  onToggle,
  onSave,
  onDelete,
}: {
  collection: Collection;
  row: Row;
  open: boolean;
  onToggle: () => void;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) setDraft({});
  }, [open]);

  const value = (f: Field) => (f.name in draft ? draft[f.name] : row[f.name]);
  const set = (name: string, v: unknown) => setDraft((d) => ({ ...d, [name]: v }));
  const dirty = Object.keys(draft).length > 0;

  const submit = async () => {
    setBusy(true);
    const ok = await onSave(draft);
    if (ok) setDraft({});
    setBusy(false);
  };

  const primary = collection.fields.filter((f) => f.primary);
  const title = String(row[collection.titleField] ?? '(untitled)');
  const published = row.published !== false;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] ${
            published ? 'border-emerald-400/40 text-emerald-200' : 'border-white/15 text-white/35'
          }`}
        >
          {published ? 'live' : 'draft'}
        </span>
        <span className="font-medium text-white">{title}</span>
        {primary
          .filter((f) => f.name !== collection.titleField)
          .slice(0, 1)
          .map((f) => (
            <span key={f.name} className="min-w-0 flex-1 truncate text-sm text-white/40">
              {String(row[f.name] ?? '')}
            </span>
          ))}
        <span className="shrink-0 text-xs text-white/25">{open ? 'close' : 'edit'}</span>
      </button>

      {open ? (
        <div className="border-t border-white/10 px-5 py-5">
          <div className="grid gap-4">
            {collection.fields.map((f) => (
              <FieldInput key={f.name} field={f} value={value(f)} onChange={(v) => set(f.name, v)} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={busy || !dirty}
              className="rounded-full border border-white/15 bg-white/10 px-6 py-2.5 text-sm text-white hover:border-white/40 disabled:opacity-40"
            >
              {busy ? 'Saving…' : dirty ? 'Save changes' : 'No changes'}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/45 hover:border-red-400/50 hover:text-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = (
    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">{field.label}</span>
  );
  const base =
    'rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-white/40';

  if (field.type === 'bool') {
    return (
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-black/40"
        />
        {label}
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="grid gap-1.5">
        {label}
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={base}>
          {field.options?.map((o) => (
            <option key={o} value={o} className="bg-[#07070a]">
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'textarea' || field.type === 'markdown') {
    return (
      <label className="grid gap-1.5">
        {label}
        <textarea
          rows={field.type === 'markdown' ? 8 : 3}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} leading-relaxed`}
        />
      </label>
    );
  }

  if (field.type === 'tags') {
    const list = Array.isArray(value) ? (value as string[]) : [];
    return (
      <label className="grid gap-1.5">
        {label}
        <input
          value={list.join(', ')}
          placeholder="Comma separated"
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      </label>
    );
  }

  if (field.type === 'date') {
    const v = value ? String(value).slice(0, 10) : '';
    return (
      <label className="grid gap-1.5">
        {label}
        <input type="date" value={v} onChange={(e) => onChange(e.target.value)} className={base} />
      </label>
    );
  }

  return (
    <label className="grid gap-1.5">
      {label}
      <input
        type={field.type === 'int' ? 'number' : 'text'}
        value={value === null || value === undefined ? '' : String(value)}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.type === 'int' ? Number(e.target.value) : e.target.value)}
        className={base}
      />
    </label>
  );
}
