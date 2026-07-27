'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type Entity = {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  kind: string;
  status: string;
  tagline: string | null;
  description: string | null;
  domain: string | null;
  sort_order: number;
  stripe_account_id: string | null;
  supabase_schema: string | null;
  netlify_site_id: string | null;
  drive_folder_id: string | null;
};

export type Relationship = {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  kind: string;
  status: string;
  note: string | null;
};

const KINDS = ['holding', 'business', 'product', 'service', 'property', 'external'];
const STATUSES = ['active', 'building', 'paused', 'archived'];

const KIND_TONE: Record<string, string> = {
  holding: 'border-amber-400/40 text-amber-200',
  business: 'border-sky-400/40 text-sky-200',
  product: 'border-violet-400/40 text-violet-200',
  service: 'border-emerald-400/40 text-emerald-200',
  property: 'border-teal-400/40 text-teal-200',
  external: 'border-rose-400/40 text-rose-200',
};

const STATUS_TONE: Record<string, string> = {
  active: 'text-emerald-300',
  building: 'text-sky-300',
  paused: 'text-amber-300',
  archived: 'text-white/30',
};

/** Where a drop will land relative to the hovered node. */
type DropZone = 'before' | 'inside' | 'after';

export default function OrgClient({
  initialEntities,
  initialRelationships,
  canWrite,
}: {
  initialEntities: Entity[];
  initialRelationships: Relationship[];
  canWrite: boolean;
}) {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; zone: DropZone } | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const dragCounter = useRef(0);

  const byParent = useMemo(() => {
    const map = new Map<string | null, Entity[]>();
    for (const e of entities) {
      const key = e.parent_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    for (const list of map.values()) list.sort((a, b) => a.sort_order - b.sort_order);
    return map;
  }, [entities]);

  const byId = useMemo(() => new Map(entities.map((e) => [e.id, e])), [entities]);
  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;

  const refresh = useCallback(async () => {
    const res = await fetch('/api/hq/entities/');
    if (res.ok) {
      const json = (await res.json()) as {
        entities: Entity[];
        relationships: Relationship[];
      };
      setEntities(json.entities);
      setRelationships(json.relationships);
    }
  }, []);

  /** True if `maybeAncestor` sits anywhere above `nodeId`. Blocks self-drops in the UI. */
  const isAncestor = useCallback(
    (maybeAncestor: string, nodeId: string): boolean => {
      let cur = byId.get(nodeId)?.parent_id ?? null;
      let guard = 0;
      while (cur && guard < 100) {
        if (cur === maybeAncestor) return true;
        cur = byId.get(cur)?.parent_id ?? null;
        guard += 1;
      }
      return false;
    },
    [byId]
  );

  const performMove = useCallback(
    async (id: string, parentId: string | null, index: number) => {
      setSaving(true);
      setError('');
      try {
        const res = await fetch(`/api/hq/entities/${id}/move/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentId, index }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json.error ?? 'Move failed.');
        }
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const handleDrop = useCallback(
    (targetId: string, zone: DropZone) => {
      const id = dragId;
      setDragId(null);
      setDropTarget(null);
      dragCounter.current = 0;
      if (!id || id === targetId) return;

      // Guard here too, so an illegal drop never even reaches the server.
      if (isAncestor(id, targetId)) {
        setError('Cannot move an entity inside its own descendant.');
        return;
      }

      const target = byId.get(targetId);
      if (!target) return;

      if (zone === 'inside') {
        const children = byParent.get(targetId) ?? [];
        void performMove(id, targetId, children.length);
        setCollapsed((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
        return;
      }

      const siblings = (byParent.get(target.parent_id) ?? []).filter((s) => s.id !== id);
      const targetIndex = siblings.findIndex((s) => s.id === targetId);
      const index = zone === 'before' ? targetIndex : targetIndex + 1;
      void performMove(id, target.parent_id, Math.max(0, index));
    },
    [dragId, byId, byParent, isAncestor, performMove]
  );

  const patch = useCallback(
    async (id: string, fields: Record<string, unknown>) => {
      setSaving(true);
      setError('');
      // Optimistic: the panel should not flicker while the request is in flight.
      setEntities((prev) => prev.map((e) => (e.id === id ? { ...e, ...fields } : e)));
      try {
        const res = await fetch(`/api/hq/entities/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fields),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json.error ?? 'Save failed.');
          await refresh();
        }
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const addEntity = useCallback(
    async (parentId: string | null) => {
      const name = window.prompt('Name of the new entity?');
      if (!name?.trim()) return;
      setSaving(true);
      try {
        const res = await fetch('/api/hq/entities/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), parentId }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json.error ?? 'Create failed.');
        }
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const removeEntity = useCallback(
    async (e: Entity) => {
      const kids = byParent.get(e.id) ?? [];
      const msg = kids.length
        ? `Delete "${e.name}"? Its ${kids.length} child item(s) will move up to its parent.`
        : `Delete "${e.name}"?`;
      if (!window.confirm(msg)) return;
      setSaving(true);
      try {
        const res = await fetch(`/api/hq/entities/${e.id}/`, { method: 'DELETE' });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json.error ?? 'Delete failed.');
        }
        if (selectedId === e.id) setSelectedId(null);
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [byParent, refresh, selectedId]
  );

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const renderNode = (entity: Entity, depth: number) => {
    const children = byParent.get(entity.id) ?? [];
    const isCollapsed = collapsed.has(entity.id);
    const isDragging = dragId === entity.id;
    const target = dropTarget?.id === entity.id ? dropTarget.zone : null;
    const illegal = dragId ? dragId === entity.id || isAncestor(dragId, entity.id) : false;

    return (
      <li key={entity.id} className="list-none">
        <div
          className={[
            'relative rounded-xl border transition-all',
            target === 'inside' && !illegal
              ? 'border-emerald-400/70 bg-emerald-400/10'
              : 'border-white/10 bg-white/5',
            isDragging ? 'opacity-40' : '',
            selectedId === entity.id ? 'ring-1 ring-white/40' : '',
          ].join(' ')}
          draggable={canWrite}
          onDragStart={(ev) => {
            setDragId(entity.id);
            ev.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => {
            setDragId(null);
            setDropTarget(null);
          }}
          onDragOver={(ev) => {
            if (!canWrite || !dragId) return;
            ev.preventDefault();
            ev.dataTransfer.dropEffect = illegal ? 'none' : 'move';
            const rect = ev.currentTarget.getBoundingClientRect();
            const offset = (ev.clientY - rect.top) / rect.height;
            const zone: DropZone = offset < 0.28 ? 'before' : offset > 0.72 ? 'after' : 'inside';
            setDropTarget({ id: entity.id, zone });
          }}
          onDragLeave={(ev) => {
            if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
            setDropTarget((prev) => (prev?.id === entity.id ? null : prev));
          }}
          onDrop={(ev) => {
            ev.preventDefault();
            if (!canWrite || illegal) return;
            handleDrop(entity.id, target ?? 'inside');
          }}
        >
          {target === 'before' && !illegal ? (
            <span className="absolute -top-[2px] left-0 right-0 h-[3px] rounded bg-emerald-400" />
          ) : null}
          {target === 'after' && !illegal ? (
            <span className="absolute -bottom-[2px] left-0 right-0 h-[3px] rounded bg-emerald-400" />
          ) : null}

          <div className="flex items-center gap-3 px-3 py-2.5">
            {children.length ? (
              <button
                type="button"
                onClick={() => toggle(entity.id)}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                className="h-5 w-5 shrink-0 rounded text-xs text-white/50 hover:bg-white/10 hover:text-white"
              >
                {isCollapsed ? '▸' : '▾'}
              </button>
            ) : (
              <span className="h-5 w-5 shrink-0" />
            )}

            {canWrite ? (
              <span className="cursor-grab select-none text-white/25" title="Drag to move">
                ⠿
              </span>
            ) : null}

            <button
              type="button"
              onClick={() => setSelectedId(entity.id)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="truncate text-sm font-medium text-white">{entity.name}</span>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] ${
                  KIND_TONE[entity.kind] ?? 'border-white/20 text-white/50'
                }`}
              >
                {entity.kind}
              </span>
              <span
                className={`shrink-0 text-[0.6rem] uppercase tracking-[0.15em] ${
                  STATUS_TONE[entity.status] ?? 'text-white/40'
                }`}
              >
                {entity.status}
              </span>
              {entity.domain ? (
                <span className="hidden truncate text-xs text-white/35 md:inline">
                  {entity.domain}
                </span>
              ) : null}
              {children.length ? (
                <span className="shrink-0 text-[0.6rem] text-white/25">{children.length}</span>
              ) : null}
            </button>

            {canWrite ? (
              <button
                type="button"
                onClick={() => addEntity(entity.id)}
                title="Add child"
                className="shrink-0 rounded px-2 py-1 text-xs text-white/40 hover:bg-white/10 hover:text-white"
              >
                +
              </button>
            ) : null}
          </div>
        </div>

        {children.length && !isCollapsed ? (
          <ul className="ml-6 mt-2 grid gap-2 border-l border-white/10 pl-4">
            {children.map((c) => renderNode(c, depth + 1))}
          </ul>
        ) : null}
      </li>
    );
  };

  const roots = byParent.get(null) ?? [];
  const owned = roots.filter((r) => r.kind !== 'external');
  const external = roots.filter((r) => r.kind === 'external');

  const relationsFor = (id: string) =>
    relationships
      .filter((r) => r.from_entity_id === id || r.to_entity_id === id)
      .map((r) => ({
        ...r,
        other: byId.get(r.from_entity_id === id ? r.to_entity_id : r.from_entity_id),
        outgoing: r.from_entity_id === id,
      }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {error ? (
          <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">
            Ownership · {entities.filter((e) => e.kind !== 'external').length}
          </h2>
          <span className="text-xs text-white/30">{saving ? 'Saving…' : 'Saved'}</span>
        </div>

        <ul className="grid gap-2">{owned.map((r) => renderNode(r, 0))}</ul>

        {external.length ? (
          <>
            <h2 className="mb-4 mt-10 text-xs uppercase tracking-[0.3em] text-white/40">
              External · not owned by the group
            </h2>
            <ul className="grid gap-2">{external.map((r) => renderNode(r, 0))}</ul>
          </>
        ) : null}

        {canWrite ? (
          <button
            type="button"
            onClick={() => addEntity(null)}
            className="mt-6 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:border-white/40 hover:text-white"
          >
            + Add top-level
          </button>
        ) : null}

        {canWrite ? (
          <p className="mt-6 text-xs leading-relaxed text-white/30">
            Drag a row onto another to nest it. Drop near the top or bottom edge to reorder as a
            sibling instead. Changes save immediately.
          </p>
        ) : null}
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        {selected ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-white">{selected.name}</h3>
                <p className="mt-1 font-mono text-[0.65rem] text-white/30">{selected.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="shrink-0 text-white/40 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {canWrite ? (
              <div className="mt-5 grid gap-4">
                <Field
                  label="Name"
                  value={selected.name}
                  onSave={(v) => patch(selected.id, { name: v })}
                />
                <Select
                  label="Kind"
                  value={selected.kind}
                  options={KINDS}
                  onSave={(v) => patch(selected.id, { kind: v })}
                />
                <Select
                  label="Status"
                  value={selected.status}
                  options={STATUSES}
                  onSave={(v) => patch(selected.id, { status: v })}
                />
                <Field
                  label="Tagline"
                  value={selected.tagline ?? ''}
                  onSave={(v) => patch(selected.id, { tagline: v })}
                />
                <Field
                  label="Domain"
                  value={selected.domain ?? ''}
                  onSave={(v) => patch(selected.id, { domain: v })}
                />

                <details className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <summary className="cursor-pointer text-xs uppercase tracking-[0.2em] text-white/40">
                    Connector wiring
                  </summary>
                  <div className="mt-4 grid gap-4">
                    <Field
                      label="Stripe account"
                      value={selected.stripe_account_id ?? ''}
                      onSave={(v) => patch(selected.id, { stripe_account_id: v })}
                    />
                    <Field
                      label="Supabase schema"
                      value={selected.supabase_schema ?? ''}
                      onSave={(v) => patch(selected.id, { supabase_schema: v })}
                    />
                    <Field
                      label="Netlify site id"
                      value={selected.netlify_site_id ?? ''}
                      onSave={(v) => patch(selected.id, { netlify_site_id: v })}
                    />
                    <Field
                      label="Drive folder id"
                      value={selected.drive_folder_id ?? ''}
                      onSave={(v) => patch(selected.id, { drive_folder_id: v })}
                    />
                  </div>
                </details>

                <button
                  type="button"
                  onClick={() => removeEntity(selected)}
                  className="mt-2 rounded-full border border-white/10 px-4 py-2 text-xs text-white/45 hover:border-red-400/50 hover:text-red-200"
                >
                  Delete entity
                </button>
              </div>
            ) : (
              <dl className="mt-5 grid gap-2 text-sm">
                <Row label="Kind" value={selected.kind} />
                <Row label="Status" value={selected.status} />
                {selected.tagline ? <Row label="Tagline" value={selected.tagline} /> : null}
                {selected.domain ? <Row label="Domain" value={selected.domain} /> : null}
              </dl>
            )}

            {relationsFor(selected.id).length ? (
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Relationships</p>
                <ul className="mt-3 grid gap-2">
                  {relationsFor(selected.id).map((r) => (
                    <li key={r.id} className="text-xs text-white/60">
                      <span className="text-white/85">{r.other?.name ?? 'Unknown'}</span>{' '}
                      <span className="text-white/35">
                        — {r.outgoing ? `is ${r.kind} of this` : `this is ${r.kind} of them`}
                        {r.status !== 'active' ? ` (${r.status})` : ''}
                      </span>
                      {r.note ? <p className="mt-0.5 text-white/30">{r.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 p-8 text-center">
            <p className="text-sm text-white/35">Select an entity to view and edit it.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/40">{label}</dt>
      <dd className="text-right text-white/80">{value}</dd>
    </div>
  );
}

/** Commits on blur or Enter, so every keystroke is not a request. */
function Field({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const commit = () => {
    if (local !== value) onSave(local);
  };

  return (
    <label className="grid gap-1.5">
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">{label}</span>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') setLocal(value);
        }}
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onSave,
}: {
  label: string;
  value: string;
  options: string[];
  onSave: (v: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">{label}</span>
      <select
        value={value}
        onChange={(e) => onSave(e.target.value)}
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#07070a]">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
