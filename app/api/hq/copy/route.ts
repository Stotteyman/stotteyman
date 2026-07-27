import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Bulk-save page copy. Keys are fixed by the seed — new keys are rejected. */
export async function PATCH(request: NextRequest) {
  try {
    const actor = await requirePermission('content.write');
    const body = (await request.json()) as { values?: Record<string, string> };
    const values = body.values ?? {};

    const admin = createSupabaseServiceClient();
    const { data: existing, error: readError } = await admin.from('site_copy').select('key, value');
    if (readError) throw readError;

    const known = new Map((existing ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
    const changed = Object.entries(values).filter(
      ([k, v]) => known.has(k) && known.get(k) !== v && String(v).trim() !== ''
    );

    if (changed.length === 0) return NextResponse.json({ ok: true, updated: 0 });

    for (const [key, value] of changed) {
      const { error } = await admin.from('site_copy').update({ value }).eq('key', key);
      if (error) throw error;
    }

    await audit(actor.userId, 'copy.updated', 'site_copy', undefined, {
      keys: changed.map(([k]) => k),
    });
    return NextResponse.json({ ok: true, updated: changed.length });
  } catch (e) {
    if (e instanceof HqAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('[hq/copy]', e);
    return NextResponse.json({ error: 'Save failed.' }, { status: 500 });
  }
}
