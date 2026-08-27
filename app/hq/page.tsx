import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { readConnectorCache } from '@/lib/connectors';
import { attentionCount } from '@/lib/hq/documents';
import { buildRenewals } from '@/lib/hq/documents.server';
import { ENTITY_FIELDS } from '@/lib/hq/entities';
import { createSupabaseServiceClient, getHqMember } from '@/lib/supabase/server';

import DashboardClient, { type ConnectorView, type EntityCard } from './DashboardClient';

export const metadata: Metadata = {
  title: 'HQ',
  robots: { index: false, follow: false },
};

// Live business data — never cache this page.
export const dynamic = 'force-dynamic';

type EntityRow = {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  kind: string;
  status: string;
  domain: string | null;
};

export default async function HqHomePage() {
  const member = await getHqMember();
  // Belt and braces: middleware already gates this, but a server component rendering
  // business data should never rely solely on an upstream check.
  if (!member) redirect('/no-access');

  const admin = createSupabaseServiceClient();
  const [{ data }, cache] = await Promise.all([
    admin.from('entities').select(ENTITY_FIELDS).order('sort_order'),
    readConnectorCache(),
  ]);

  const entities = (data ?? []) as unknown as EntityRow[];
  const bySource = new Map(cache.map((c) => [c.source, c]));

  // Overdue filings and non-auto-renewing deadlines inside 30 days. Read here rather
  // than only on /legal so a missed renewal is visible without going looking for it.
  const renewals = await buildRenewals();
  const needsAttention = attentionCount(renewals);

  const metricsOf = (source: string, slug: string): Record<string, unknown> => {
    const payload = bySource.get(source)?.payload ?? {};
    const all = (payload.entityMetrics ?? {}) as Record<string, Record<string, unknown>>;
    return all[slug] ?? {};
  };

  const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);

  const cards: EntityCard[] = entities
    .filter((e) => e.kind !== 'product' || metricsOf('supabase', e.slug).people !== undefined)
    .map((e) => {
      const sb = metricsOf('supabase', e.slug);
      const st = metricsOf('stripe', e.slug);
      const nf = metricsOf('netlify', e.slug);
      const gd = metricsOf('godaddy', e.slug);
      return {
        slug: e.slug,
        name: e.name,
        kind: e.kind,
        status: e.status,
        domain: e.domain,
        people: num(sb.people),
        revenue30: num(st.last30Gross),
        currency: typeof st.currency === 'string' ? st.currency : null,
        deployState: typeof nf.deployState === 'string' ? nf.deployState : null,
        restricted: nf.restricted === true,
        daysUntilExpiry: num(gd.daysUntilExpiry),
      };
    })
    .sort((a, b) => (b.revenue30 ?? 0) - (a.revenue30 ?? 0) || (b.people ?? 0) - (a.people ?? 0));

  const sbSummary = (bySource.get('supabase')?.payload.summary ?? {}) as Record<string, unknown>;
  const stSummary = (bySource.get('stripe')?.payload.summary ?? {}) as Record<string, unknown>;
  const gdSummary = (bySource.get('godaddy')?.payload.summary ?? {}) as Record<string, unknown>;
  const nfSummary = (bySource.get('netlify')?.payload.summary ?? {}) as Record<string, unknown>;

  const totals = {
    people: Number(sbSummary.totalPeople ?? 0),
    revenue30: Number(stSummary.last30Gross ?? 0),
    currency: String(stSummary.currency ?? 'usd'),
    domains: Number(gdSummary.totalDomains ?? 0),
    sites: Number(nfSummary.totalSites ?? 0),
  };

  const connectors: ConnectorView[] = ['stripe', 'netlify', 'godaddy', 'supabase'].map((source) => {
    const c = bySource.get(source);
    return {
      source,
      ok: c?.ok ?? false,
      error: c?.error ?? (c ? null : 'Never refreshed'),
      fetchedAt: c?.fetched_at ?? null,
      lastOkAt: c?.last_ok_at ?? null,
      durationMs: c?.duration_ms ?? null,
      summary: (c?.payload.summary ?? {}) as Record<string, unknown>,
    };
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="border-b border-line pb-8">
        <p className="text-label uppercase text-fg-subtle">Private</p>
        <h1 className="mt-3 text-3xl font-semibold text-fg">HQ</h1>
        <p className="mt-3 text-sm text-fg-muted">
          Signed in as {member.display_name ?? member.email}
          {member.roles.length ? (
            <>
              {' · '}
              <span className="uppercase tracking-[0.2em] text-fg-subtle">
                {member.roles.join(', ')}
              </span>
            </>
          ) : null}
        </p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {[
            { href: '/org', label: 'Organisation' },
            { href: '/legal', label: 'Legal' },
            { href: '/content', label: 'Content' },
            { href: '/consults', label: 'Requests' },
            { href: '/ama', label: 'Questions' },
            { href: '/people', label: 'People' },
            { href: '/live', label: 'Live' },
            { href: '/stream', label: 'Stream' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-line bg-surface px-5 py-2 font-mono text-label uppercase text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {needsAttention > 0 ? (
          <Link
            href="/legal"
            className="mt-6 flex items-center gap-3 rounded-lg border border-accent-line bg-accent-soft px-4 py-3 transition-colors hover:border-accent/60"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="text-body-sm text-fg">
              {needsAttention} {needsAttention === 1 ? 'renewal needs' : 'renewals need'} attention
            </span>
            <span className="ml-auto font-mono text-label uppercase text-accent">Review →</span>
          </Link>
        ) : null}
      </header>

      <div className="mt-12">
        <DashboardClient
          connectors={connectors}
          cards={cards}
          totals={totals}
          canRefresh={member.roles.length > 0}
        />
      </div>
    </main>
  );
}
