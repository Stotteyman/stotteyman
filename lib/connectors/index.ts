import 'server-only';

import { createSupabaseServiceClient } from '@/lib/supabase/server';

import { fetchGoDaddy } from './godaddy';
import { fetchNetlify } from './netlify';
import { fetchStripe } from './stripe';
import { fetchSupabase } from './supabase';
import type { ConnectorResult } from './types';

export const CONNECTOR_SOURCES = ['stripe', 'netlify', 'godaddy', 'supabase'] as const;
export type ConnectorSource = (typeof CONNECTOR_SOURCES)[number];

export type CachedConnector = {
  source: string;
  payload: { summary?: Record<string, unknown>; entityMetrics?: Record<string, unknown> };
  ok: boolean;
  error: string | null;
  fetched_at: string | null;
  last_ok_at: string | null;
  duration_ms: number | null;
};

/**
 * Refreshes every connector concurrently and writes each result to the cache.
 *
 * Failures are persisted but never overwrite the last good payload — a provider being
 * down should make the dashboard show stale data with a warning, not empty tiles.
 */
export async function refreshConnectors(only?: ConnectorSource[]): Promise<ConnectorResult[]> {
  const admin = createSupabaseServiceClient();

  const { data: entityRows } = await admin
    .from('entities')
    .select('slug, name, domain, stripe_account_id, supabase_schema, netlify_site_id');

  const entities = (entityRows ?? []) as {
    slug: string;
    name: string;
    domain: string | null;
    stripe_account_id: string | null;
    supabase_schema: string | null;
    netlify_site_id: string | null;
  }[];

  const wanted = new Set<string>(only ?? CONNECTOR_SOURCES);
  const jobs: Promise<ConnectorResult>[] = [];
  if (wanted.has('stripe')) jobs.push(fetchStripe(entities));
  if (wanted.has('netlify')) jobs.push(fetchNetlify(entities));
  if (wanted.has('godaddy')) jobs.push(fetchGoDaddy(entities));
  if (wanted.has('supabase')) jobs.push(fetchSupabase(entities));

  const results = await Promise.all(jobs);

  await Promise.all(
    results.map(async (r) => {
      const { data: existing } = await admin
        .from('connector_cache')
        .select('payload, last_ok_at')
        .eq('source', r.source)
        .maybeSingle();

      const payload = r.ok
        ? { summary: r.summary, entityMetrics: r.entityMetrics }
        : (existing?.payload ?? { summary: {}, entityMetrics: {} });

      await admin.from('connector_cache').upsert(
        {
          source: r.source,
          payload,
          ok: r.ok,
          error: r.error ?? null,
          fetched_at: r.fetchedAt,
          last_ok_at: r.ok ? r.fetchedAt : (existing?.last_ok_at ?? null),
          duration_ms: r.durationMs,
        },
        { onConflict: 'source' }
      );
    })
  );

  return results;
}

export async function readConnectorCache(): Promise<CachedConnector[]> {
  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from('connector_cache')
    .select('source, payload, ok, error, fetched_at, last_ok_at, duration_ms');
  return (data ?? []) as CachedConnector[];
}

/** Rolls a metric up through the ownership tree, so parents include their children. */
export function rollUp(
  entityId: string,
  childrenOf: Map<string | null, { id: string; slug: string }[]>,
  valueOf: (slug: string) => number,
  slugOf: (id: string) => string
): number {
  let total = valueOf(slugOf(entityId));
  for (const child of childrenOf.get(entityId) ?? []) {
    total += rollUp(child.id, childrenOf, valueOf, slugOf);
  }
  return total;
}
