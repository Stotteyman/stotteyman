import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import {
  DOCUMENT_FIELDS,
  DOC_STATUSES,
  DOC_TYPES,
  type DocStatus,
  type DocType,
} from '@/lib/hq/documents';
import { buildRenewals, listDocuments } from '@/lib/hq/documents.server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fail(e: unknown, tag: string) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error(tag, e);
  return NextResponse.json(
    { error: e instanceof Error ? e.message : 'Unexpected error.' },
    { status: 500 }
  );
}

/** Trim, collapse empties to null, and cap length so a paste cannot bloat a row. */
export function text(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

/**
 * Accepts an http(s) URL or a bare domain, and rejects anything else.
 *
 * `javascript:` and `data:` are the ones that matter — this value is rendered as an
 * anchor href in HQ, so a stored `javascript:` URL would be a stored XSS against the
 * only people who can read the page.
 */
export function safeLink(v: unknown): string | null {
  const raw = text(v, 2000);
  if (!raw) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
}

/** `YYYY-MM-DD` or null. Anything unparseable becomes null rather than a 400. */
export function date(v: unknown): string | null {
  const raw = text(v, 40);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function money(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export async function GET() {
  try {
    await requirePermission('documents.read');
    const documents = await listDocuments();
    const renewals = await buildRenewals(documents);
    return NextResponse.json({ documents, renewals });
  } catch (e) {
    return fail(e, '[hq/documents GET]');
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('documents.write');
    const body = (await request.json()) as Record<string, unknown>;

    const title = text(body.title, 200);
    if (!title) {
      return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
    }

    const docType = DOC_TYPES.includes(body.docType as DocType)
      ? (body.docType as DocType)
      : 'other';
    const status = DOC_STATUSES.includes(body.status as DocStatus)
      ? (body.status as DocStatus)
      : 'active';

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('documents')
      .insert({
        entity_id: text(body.entityId, 40),
        client_id: text(body.clientId, 40),
        title,
        doc_type: docType,
        status,
        issuer: text(body.issuer, 200),
        reference: text(body.reference, 200),
        issued_on: date(body.issuedOn),
        effective_on: date(body.effectiveOn),
        expires_at: date(body.expiresAt),
        renewal_term: text(body.renewalTerm, 120),
        auto_renews: body.autoRenews === true,
        cost_cents: money(body.cost),
        currency: (text(body.currency, 8) ?? 'usd').toLowerCase(),
        link: safeLink(body.link),
        notes: text(body.notes, 4000),
        created_by: actor.userId,
      })
      .select(DOCUMENT_FIELDS)
      .single();

    if (error) throw error;

    await audit(actor.userId, 'document.filed', 'document', data.id, {
      title,
      docType,
      expiresAt: data.expires_at,
    });

    return NextResponse.json({ document: data });
  } catch (e) {
    return fail(e, '[hq/documents POST]');
  }
}
