import 'server-only';

import { readConnectorCache } from '@/lib/connectors';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import {
  DOCUMENT_FIELDS,
  DOC_TYPE_LABEL,
  bandFor,
  daysUntil,
  type DocumentRow,
  type Renewal,
} from './documents';

/**
 * Database access for the document register.
 *
 * Split from `documents.ts` so the client component can import the types and labels
 * without pulling the service-role client into the browser bundle.
 */

export async function listDocuments(): Promise<DocumentRow[]> {
  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from('documents')
    .select(DOCUMENT_FIELDS)
    .order('expires_at', { ascending: true, nullsFirst: false })
    .order('title');
  return (data ?? []) as unknown as DocumentRow[];
}

type DomainMetric = {
  domain?: unknown;
  expires?: unknown;
  daysUntilExpiry?: unknown;
  renewAuto?: unknown;
};

/**
 * Merges document expiries with domain expiries into one ordered list.
 *
 * Two different things expire in this business and they live in different places:
 * filings recorded by hand, and domains the GoDaddy connector already tracks. Asking
 * "what needs renewing?" in two separate screens is how a deadline gets missed.
 *
 * Domains come from the connector cache rather than a live fetch, so this is cheap
 * enough to run on every dashboard render. A stale cache is fine — a domain expiry
 * date does not move between refreshes.
 */
export async function buildRenewals(documents?: DocumentRow[]): Promise<Renewal[]> {
  const docs = documents ?? (await listDocuments());
  const out: Renewal[] = [];

  for (const d of docs) {
    if (!d.expires_at) continue;
    // Superseded and archived filings keep their old expiry date and would otherwise
    // sit permanently at the top of the overdue list.
    if (d.status !== 'active' && d.status !== 'pending') continue;

    const days = daysUntil(d.expires_at);
    out.push({
      key: `doc:${d.id}`,
      kind: 'document',
      title: d.title,
      entityId: d.entity_id,
      entitySlug: null,
      subtitle: DOC_TYPE_LABEL[d.doc_type] ?? d.doc_type,
      expiresOn: d.expires_at.slice(0, 10),
      daysUntil: days,
      band: bandFor(days),
      autoRenews: d.auto_renews,
      link: d.link,
      documentId: d.id,
    });
  }

  // A connector failure must not blank the renewals list — documents still render.
  let metrics: Record<string, DomainMetric> = {};
  try {
    const cache = await readConnectorCache();
    const godaddy = cache.find((c) => c.source === 'godaddy');
    metrics = (godaddy?.payload.entityMetrics ?? {}) as Record<string, DomainMetric>;
  } catch {
    metrics = {};
  }

  for (const [slug, m] of Object.entries(metrics)) {
    const domain = typeof m.domain === 'string' ? m.domain : null;
    const expires = typeof m.expires === 'string' ? m.expires : null;
    if (!domain || !expires) continue;

    const days = typeof m.daysUntilExpiry === 'number' ? m.daysUntilExpiry : daysUntil(expires);
    out.push({
      key: `domain:${domain}`,
      kind: 'domain',
      title: domain,
      entityId: null,
      entitySlug: slug,
      subtitle: 'Domain registration',
      expiresOn: expires.slice(0, 10),
      daysUntil: days,
      band: bandFor(days),
      autoRenews: m.renewAuto === true,
      link: `https://dcc.godaddy.com/control/portfolio/${domain}/settings`,
    });
  }

  return out.sort((a, b) => a.daysUntil - b.daysUntil);
}
