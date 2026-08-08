import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import {
  DOCUMENT_FIELDS,
  DOC_STATUSES,
  DOC_TYPES,
  type DocStatus,
  type DocType,
} from '@/lib/hq/documents';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

import { date, money, safeLink, text } from '../route';

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

/**
 * Only the keys actually present in the body are written.
 *
 * A blanket object would blank every column the form did not send — which is how an
 * "edit the expiry date" action silently erases the link and the notes.
 */
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission('documents.write');
    const { id } = await ctx.params;
    const body = (await request.json()) as Record<string, unknown>;

    const patch: Record<string, unknown> = {};
    const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

    if (has('title')) {
      const t = text(body.title, 200);
      if (!t) return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
      patch.title = t;
    }
    if (has('docType') && DOC_TYPES.includes(body.docType as DocType)) {
      patch.doc_type = body.docType;
    }
    if (has('status') && DOC_STATUSES.includes(body.status as DocStatus)) {
      patch.status = body.status;
    }
    if (has('entityId')) patch.entity_id = text(body.entityId, 40);
    if (has('clientId')) patch.client_id = text(body.clientId, 40);
    if (has('issuer')) patch.issuer = text(body.issuer, 200);
    if (has('reference')) patch.reference = text(body.reference, 200);
    if (has('issuedOn')) patch.issued_on = date(body.issuedOn);
    if (has('effectiveOn')) patch.effective_on = date(body.effectiveOn);
    if (has('expiresAt')) patch.expires_at = date(body.expiresAt);
    if (has('renewalTerm')) patch.renewal_term = text(body.renewalTerm, 120);
    if (has('autoRenews')) patch.auto_renews = body.autoRenews === true;
    if (has('cost')) patch.cost_cents = money(body.cost);
    if (has('link')) patch.link = safeLink(body.link);
    if (has('notes')) patch.notes = text(body.notes, 4000);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from('documents')
      .update(patch)
      .eq('id', id)
      .select(DOCUMENT_FIELDS)
      .single();

    if (error) throw error;

    await audit(actor.userId, 'document.updated', 'document', id, { fields: Object.keys(patch) });
    return NextResponse.json({ document: data });
  } catch (e) {
    return fail(e, '[hq/documents PATCH]');
  }
}

/**
 * Files the renewal as a new row and retires the old one in a single call.
 *
 * Doing this as "create then update" from the client leaves a window where both rows
 * are active, and the register is meant to answer "what is in force right now".
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission('documents.write');
    const { id } = await ctx.params;
    const body = (await request.json()) as Record<string, unknown>;

    const admin = createSupabaseServiceClient();
    const { data: previous, error: readErr } = await admin
      .from('documents')
      .select(DOCUMENT_FIELDS)
      .eq('id', id)
      .maybeSingle();

    if (readErr) throw readErr;
    if (!previous) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    const { data: created, error: insertErr } = await admin
      .from('documents')
      .insert({
        entity_id: previous.entity_id,
        client_id: previous.client_id,
        title: previous.title,
        doc_type: previous.doc_type,
        status: 'active',
        issuer: previous.issuer,
        reference: text(body.reference, 200) ?? previous.reference,
        issued_on: date(body.issuedOn) ?? new Date().toISOString().slice(0, 10),
        effective_on: date(body.effectiveOn),
        expires_at: date(body.expiresAt),
        renewal_term: previous.renewal_term,
        auto_renews: previous.auto_renews,
        cost_cents: money(body.cost) ?? previous.cost_cents,
        currency: previous.currency,
        link: safeLink(body.link) ?? previous.link,
        notes: text(body.notes, 4000),
        supersedes_id: previous.id,
        created_by: actor.userId,
      })
      .select(DOCUMENT_FIELDS)
      .single();

    if (insertErr) throw insertErr;

    const { error: retireErr } = await admin
      .from('documents')
      .update({ status: 'superseded' })
      .eq('id', id);
    if (retireErr) throw retireErr;

    await audit(actor.userId, 'document.renewed', 'document', created.id, {
      supersedes: id,
      expiresAt: created.expires_at,
    });

    return NextResponse.json({ document: created });
  } catch (e) {
    return fail(e, '[hq/documents renew]');
  }
}

export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission('documents.write');
    const { id } = await ctx.params;

    const admin = createSupabaseServiceClient();
    const { data: existing } = await admin
      .from('documents')
      .select('title')
      .eq('id', id)
      .maybeSingle();

    const { error } = await admin.from('documents').delete().eq('id', id);
    if (error) throw error;

    await audit(actor.userId, 'document.deleted', 'document', id, {
      title: existing?.title ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e, '[hq/documents DELETE]');
  }
}
