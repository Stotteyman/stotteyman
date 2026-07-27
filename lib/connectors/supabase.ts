import 'server-only';

import { createSupabaseServiceClient } from '@/lib/supabase/server';

import { runConnector, type ConnectorResult } from './types';

type SchemaStats = Record<string, Record<string, number | null>>;

/**
 * Per-business user counts, read from each sibling schema on the shared project.
 *
 * The heavy lifting is a security-definer RPC because the app's PostgREST client is
 * pinned to the `stotteyman` schema and cannot read the others directly.
 */
export async function fetchSupabase(
  entities: { slug: string; supabase_schema: string | null }[]
): Promise<ConnectorResult> {
  return runConnector('supabase', async () => {
    const admin = createSupabaseServiceClient();
    const { data, error } = await admin.rpc('sibling_schema_stats');
    if (error) throw new Error(error.message);

    const stats = (data ?? {}) as SchemaStats;

    /** First populated people-ish count in a schema, whatever it happens to be called. */
    const peopleCount = (row: Record<string, number | null>): number | null => {
      for (const key of [
        'profiles',
        'members',
        'users',
        'players',
        'accounts',
        'customers',
        'subscribers',
      ]) {
        const v = row[key];
        if (typeof v === 'number') return v;
      }
      return null;
    };

    const entityMetrics: Record<string, Record<string, unknown>> = {};
    for (const e of entities) {
      if (!e.supabase_schema) continue;
      const row = stats[e.supabase_schema];
      if (!row) continue;
      entityMetrics[e.slug] = {
        schema: e.supabase_schema,
        tables: row.tables ?? null,
        people: peopleCount(row),
        raw: row,
      };
    }

    const totalPeople = Object.values(stats).reduce((acc, row) => {
      const n = peopleCount(row);
      return acc + (n ?? 0);
    }, 0);

    return {
      summary: {
        schemas: Object.keys(stats).length,
        totalTables: Object.values(stats).reduce((a, r) => a + (Number(r.tables) || 0), 0),
        totalPeople,
        perSchema: stats,
      },
      entityMetrics,
    };
  });
}
