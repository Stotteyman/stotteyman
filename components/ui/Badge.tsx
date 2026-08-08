import type { ReactNode } from 'react';

/**
 * Mono status chip. See BRAND.md §6.
 *
 * `status` maps a raw database value straight to a tone, so pages stop inventing a
 * different colour rule each time. Unknown values fall back to neutral rather than
 * throwing or silently rendering an accent.
 */

export type BadgeTone = 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'accent' | 'faint';

const TONE: Record<BadgeTone, string> = {
  neutral: 'border-line text-fg-subtle',
  ok: 'border-ok/30 text-ok',
  warn: 'border-warn/30 text-warn',
  danger: 'border-danger/30 text-danger',
  info: 'border-info/30 text-info',
  accent: 'border-accent/40 text-accent',
  faint: 'border-line text-fg-faint',
};

/** Database status -> tone. Keys are lowercased and non-alphanumerics collapsed. */
const STATUS_TONE: Record<string, BadgeTone> = {
  active: 'ok',
  live: 'ok',
  shipped: 'ok',
  published: 'ok',
  complete: 'ok',
  building: 'warn',
  inprogress: 'warn',
  indevelopment: 'warn',
  draft: 'warn',
  pending: 'warn',
  paused: 'neutral',
  onhold: 'neutral',
  archived: 'faint',
  superseded: 'faint',
  expired: 'danger',
  failed: 'danger',
  revoked: 'danger',
  overdue: 'danger',
};

/** Database status -> display label. Anything unmapped is shown as written. */
const STATUS_LABEL: Record<string, string> = {
  active: 'Live',
  shipped: 'Shipped',
  inprogress: 'In development',
  building: 'Building',
  paused: 'Paused',
  archived: 'Archived',
};

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

type BadgeProps = {
  children?: ReactNode;
  /** Raw status string from the database. Sets tone and label unless overridden. */
  status?: string;
  tone?: BadgeTone;
  /** Adds a filled dot before the label — for "currently true" states. */
  dot?: boolean;
  className?: string;
};

export default function Badge({ children, status, tone, dot, className = '' }: BadgeProps) {
  const key = status ? normalise(status) : '';
  const resolvedTone: BadgeTone = tone ?? (key ? (STATUS_TONE[key] ?? 'neutral') : 'neutral');
  const label = children ?? (status ? (STATUS_LABEL[key] ?? status) : null);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-label uppercase ${TONE[resolvedTone]} ${className}`.trim()}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {label}
    </span>
  );
}
