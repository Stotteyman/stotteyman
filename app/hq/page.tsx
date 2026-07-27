import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createSupabaseServiceClient, getHqMember } from '@/lib/supabase/server';

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
      </header>

      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">
          Business hierarchy · {entities.length} entities
        </h2>

        <div className="mt-6 grid gap-4">
          {roots.map((root) => (
            <div
              key={root.id}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="text-lg font-semibold text-white">{root.name}</h3>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/35">
                  {root.kind}
                </span>
              </div>
              {root.tagline ? (
                <p className="mt-2 text-sm text-white/50">{root.tagline}</p>
              ) : null}

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {childrenOf(root.id).map((child) => {
                  const grandchildren = childrenOf(child.id);
                  return (
                    <div
                      key={child.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-white">{child.name}</span>
                        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-white/35">
                          {child.status}
                        </span>
                      </div>
                      {child.domain ? (
                        <p className="mt-1 text-xs text-white/40">{child.domain}</p>
                      ) : null}
                      {grandchildren.length ? (
                        <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
                          {grandchildren.map((g) => (
                            <li key={g.id} className="text-xs text-white/50">
                              {g.name}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
