import { NextResponse, type NextRequest } from 'next/server';

import {
  CONNECTOR_SOURCES,
  refreshConnectors,
  type ConnectorSource,
} from '@/lib/connectors';
import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';

export const dynamic = 'force-dynamic';
// Four external providers; the default 10s would cut a cold refresh short.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Scheduled invocations have no session. A shared secret lets the cron job in
    // without weakening the rule for humans — and it is compared only after confirming
    // the env var is actually set, so an unset secret can never mean "anyone".
    const cronSecret = process.env.CONNECTOR_CRON_SECRET;
    const presented = request.headers.get('x-cron-secret');
    const isCron = Boolean(cronSecret) && presented === cronSecret;

    const actor = isCron ? null : await requirePermission('entities.read');

    const body = (await request.json().catch(() => ({}))) as { sources?: string[] };
    const requested = body.sources?.filter((s): s is ConnectorSource =>
      (CONNECTOR_SOURCES as readonly string[]).includes(s)
    );

    const results = await refreshConnectors(requested?.length ? requested : undefined);

    await audit(actor?.userId ?? null, 'connectors.refreshed', 'connector', undefined, {
      sources: results.map((r) => r.source),
      failed: results.filter((r) => !r.ok).map((r) => r.source),
      trigger: isCron ? 'schedule' : 'manual',
    });

    return NextResponse.json({
      results: results.map((r) => ({
        source: r.source,
        ok: r.ok,
        notConfigured: r.notConfigured ?? false,
        error: r.error ?? null,
        durationMs: r.durationMs,
      })),
    });
  } catch (e) {
    if (e instanceof HqAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('[hq/connectors/refresh]', e);
    return NextResponse.json({ error: 'Refresh failed.' }, { status: 500 });
  }
}
