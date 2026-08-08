/**
 * Document register — types, constants and pure helpers.
 *
 * Deliberately free of `server-only` and of any Supabase import. The legal screen is a
 * client component and needs the type list, the labels and the banding rules; when
 * those lived alongside `listDocuments`, importing them dragged `lib/supabase/server`
 * (and therefore the service key) into the browser bundle and broke the build.
 *
 * Anything that touches the database lives in `documents.server.ts`.
 */

export const DOC_TYPES = [
  'formation',
  'ein',
  'operating_agreement',
  'license',
  'permit',
  'insurance',
  'contract',
  'nda',
  'trademark',
  'tax',
  'banking',
  'registration',
  'other',
] as const;

export type DocType = (typeof DOC_TYPES)[number];

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  formation: 'Formation',
  ein: 'EIN',
  operating_agreement: 'Operating agreement',
  license: 'Licence',
  permit: 'Permit',
  insurance: 'Insurance',
  contract: 'Contract',
  nda: 'NDA',
  trademark: 'Trademark',
  tax: 'Tax',
  banking: 'Banking',
  registration: 'Registration',
  other: 'Other',
};

export const DOC_STATUSES = [
  'active',
  'pending',
  'draft',
  'expired',
  'superseded',
  'archived',
] as const;

export type DocStatus = (typeof DOC_STATUSES)[number];

/**
 * One literal, never a concatenation: supabase-js infers row types from the *literal*
 * type of the select string, and `+` collapses it to plain `string`.
 */
export const DOCUMENT_FIELDS =
  'id, entity_id, client_id, title, doc_type, status, issuer, reference, issued_on, effective_on, expires_at, renewal_term, auto_renews, cost_cents, currency, link, storage_path, notes, supersedes_id, created_at, updated_at' as const;

export type DocumentRow = {
  id: string;
  entity_id: string | null;
  client_id: string | null;
  title: string;
  doc_type: DocType;
  status: DocStatus;
  issuer: string | null;
  reference: string | null;
  issued_on: string | null;
  effective_on: string | null;
  expires_at: string | null;
  renewal_term: string | null;
  auto_renews: boolean;
  cost_cents: number | null;
  currency: string;
  link: string | null;
  storage_path: string | null;
  notes: string | null;
  supersedes_id: string | null;
  created_at: string;
  updated_at: string;
};

// ── Renewals ─────────────────────────────────────────────────────────────────

export type RenewalBand = 'overdue' | 'due30' | 'due60' | 'due90' | 'later';

export type Renewal = {
  key: string;
  kind: 'document' | 'domain';
  title: string;
  entityId: string | null;
  entitySlug: string | null;
  subtitle: string | null;
  expiresOn: string;
  daysUntil: number;
  band: RenewalBand;
  autoRenews: boolean;
  link: string | null;
  documentId?: string;
};

const DAY = 86_400_000;

/**
 * Whole days from today to `iso`, negative once it is in the past.
 *
 * Both sides are normalised to UTC midnight so the answer does not flip by one
 * depending on the viewer's timezone — a renewal that reads "in 0 days" for one person
 * and "1 day ago" for another is worse than useless.
 */
export function daysUntil(iso: string): number {
  const then = new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime();
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`).getTime();
  return Math.round((then - today) / DAY);
}

export function bandFor(days: number): RenewalBand {
  if (days < 0) return 'overdue';
  if (days <= 30) return 'due30';
  if (days <= 60) return 'due60';
  if (days <= 90) return 'due90';
  return 'later';
}

export const BAND_LABEL: Record<RenewalBand, string> = {
  overdue: 'Overdue',
  due30: 'Next 30 days',
  due60: 'Next 60 days',
  due90: 'Next 90 days',
  later: 'Later',
};

/**
 * Count that drives the dashboard alert.
 *
 * Auto-renewing items are excluded until they are actually overdue — an auto-renewal
 * that has passed its date without renewing is exactly the failure worth shouting
 * about (usually an expired card on file), while one that is merely approaching is
 * noise.
 */
export function attentionCount(renewals: Renewal[]): number {
  return renewals.filter((r) => r.band === 'overdue' || (r.band === 'due30' && !r.autoRenews))
    .length;
}
