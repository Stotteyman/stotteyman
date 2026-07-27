import type { Metadata } from 'next';
import Link from 'next/link';

import SiteShell from '@/components/SiteShell';
import { loadCopy } from '@/lib/site-copy';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Builder and operator — game servers, community platforms, storefronts, and the tooling that keeps them running.',
};

export const revalidate = 300;

type Principle = { id: string; title: string; body: string };

export default async function AboutPage() {
  const copy = await loadCopy();
  const supabase = createSupabaseAnonClient();
  const { data } = await supabase
    .from('public_mindset_principles')
    .select('id, title, body, sort_order')
    .order('sort_order');

  const principles = (data ?? []) as unknown as Principle[];

  return (
    <SiteShell
      eyebrow={copy('about.eyebrow', 'About')}
      title={copy('about.title', 'I build things, then I keep them running.')}
      intro={copy(
        'about.intro',
        'Most of what I do sits in the gap between making something and operating it.'
      )}
    >
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="max-w-3xl">
          <p className="text-base leading-8 text-gray-300">
            {copy(
              'about.story',
              'I started building because I wanted things that did not exist yet.'
            )}
          </p>

          <h2 className="mt-12 text-2xl font-light text-white">
            {copy('about.approach_title', 'How I work')}
          </h2>
          <p className="mt-4 text-base leading-8 text-gray-300">
            {copy(
              'about.approach',
              'I care about the unglamorous parts: persistence that does not lose data, auth that cannot be talked around, admin tools that make the day-to-day survivable.'
            )}
          </p>

          <h2 className="mt-12 text-2xl font-light text-white">
            {copy('about.now_title', 'What I am doing now')}
          </h2>
          <p className="mt-4 text-base leading-8 text-gray-300">
            {copy(
              'about.now',
              'Running a live Arma Reforger roleplay server, building out the platforms across the group, and taking on selected consulting and collaboration work.'
            )}
          </p>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/work/"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm text-white transition-all duration-300 hover:border-white/40"
            >
              See the work
            </Link>
            <Link
              href="/consult/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white"
            >
              Work with me
            </Link>
          </div>
        </div>

        {principles.length ? (
          <aside className="self-start">
            <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">How I think</h2>
            <div className="mt-5 grid gap-3">
              {principles.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-sm font-medium text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{p.body}</p>
                </div>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </SiteShell>
  );
}
