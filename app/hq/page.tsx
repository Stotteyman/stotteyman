import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createSupabaseServiceClient, getHqMember } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'HQ',
  robots: { index: false, follow: false },
};

// Live business data — never cache this page.
export const dynamic = 'force-dynamic';

function Branch({
  nodes,
  childrenOf,
  depth = 0,
}: {
  nodes: EntityRow[];
  childrenOf: (id: string) => EntityRow[];
  depth?: number;
}) {
  if (!nodes.length) return null;
  return (
    <ul className={depth === 0 ? 'grid gap-2' : 'mt-2 grid gap-2 border-l border-white/10 pl-4'}>
      {nodes.map((n) => {
        const kids = childrenOf(n.id);
        return (
          <li key={n.id}>
            <div className="flex flex-wrap items-baseline gap-3">
              <span
                className={
                  depth === 0
                    ? 'text-base font-semibold text-white'
                    : 'text-sm font-medium text-white/90'
                }
              >
                {n.name}
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.18em] text-white/30">
                {n.kind}
              </span>
              {n.status !== 'active' ? (
                <span className="text-[0.6rem] uppercase tracking-[0.18em] text-amber-300/70">
                  {n.status}
                </span>
              ) : null}
              {n.domain ? <span className="text-xs text-white/30">{n.domain}</span> : null}
            </div>
            <Branch nodes={kids} childrenOf={childrenOf} depth={depth + 1} />
          </li>
        );
      })}
    </ul>
  );
}

type EntityRow = {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  kind: string;
  status: string;
  tagline: string | null;
  domain: string | null;
  sort_order: number;
};

export default async function HqHomePage() {
  const member = await getHqMember();
  // Belt and braces: middleware already gates this, but a server component that
  // renders business data should never rely solely on an upstream check.
  if (!member) redirect('/hq/no-access');

  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from('entities')
    .select('id, parent_id, slug, name, kind, status, tagline, domain, sort_order')
    .order('sort_order');

  const entities = (data ?? []) as EntityRow[];
  const roots = entities.filter((e) => e.parent_id === null);
  const childrenOf = (id: string) => entities.filter((e) => e.parent_id === id);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="border-b border-white/10 pb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Private</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">HQ</h1>
        <p className="mt-3 text-sm text-white/60">
          Signed in as {member.display_name ?? member.email}
          {member.roles.length ? (
            <>
              {' · '}
              <span className="uppercase tracking-[0.2em] text-white/40">
                {member.roles.join(', ')}
              </span>
            </>
          ) : null}
        </p>

        <nav className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/hq/org"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            Organisation
          </Link>
          <Link
            href="/hq/people"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            People
          </Link>
        </nav>
      </header>

      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">
            Business hierarchy · {entities.length} entities
          </h2>
          <Link href="/hq/org" className="text-xs text-white/40 underline hover:text-white/70">
            Edit tree
          </Link>
        </div>

        {/* Recursive, so it does not silently truncate as the tree deepens. */}
        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <Branch nodes={roots.filter((r) => r.kind !== 'external')} childrenOf={childrenOf} />
        </div>

        {roots.some((r) => r.kind === 'external') ? (
          <>
            <h2 className="mt-10 text-xs uppercase tracking-[0.3em] text-white/40">
              External relationships
            </h2>
            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <Branch
                nodes={roots.filter((r) => r.kind === 'external')}
                childrenOf={childrenOf}
              />
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
