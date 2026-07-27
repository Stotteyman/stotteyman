import type { Metadata } from 'next';
import Link from 'next/link';

import SiteShell from '@/components/SiteShell';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected work — multiplayer game servers, community platforms, storefronts, and internal tooling.',
};

export const revalidate = 300;

type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  role: string | null;
  status: string;
  link: string;
  external: boolean;
  featured: boolean;
  sort_order: number;
  entity_name: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Live',
  shipped: 'Shipped',
  in_progress: 'In development',
  archived: 'Archived',
};

export default async function WorkPage() {
  const supabase = createSupabaseAnonClient();
  const { data } = await supabase
    .from('public_projects')
    .select(
      'id, slug, title, summary, body, role, status, link, external, featured, sort_order, entity_name'
    )
    .order('sort_order');

  const projects = (data ?? []) as unknown as Project[];
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <SiteShell
      eyebrow="Work"
      title="Things I have designed, built, and kept running."
      intro="Multiplayer game servers, community platforms, storefronts, and the internal tooling that keeps them all manageable. Most of these are live and still being worked on."
    >
      {featured.length ? (
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Selected</h2>
          <div className="mt-6 grid gap-5">
            {featured.map((p) => (
              <article
                key={p.id}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/25 md:p-8"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="text-2xl font-semibold text-white">{p.title}</h3>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-white/50">
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                  {p.entity_name ? (
                    <span className="text-xs text-white/30">{p.entity_name}</span>
                  ) : null}
                </div>

                {p.summary ? (
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/70">
                    {p.summary}
                  </p>
                ) : null}
                {p.body ? (
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/45">{p.body}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {p.role ? (
                    <span className="text-xs uppercase tracking-[0.18em] text-white/35">
                      {p.role}
                    </span>
                  ) : null}
                  {p.link ? (
                    <a
                      href={p.link}
                      target={p.external ? '_blank' : undefined}
                      rel={p.external ? 'noreferrer noopener' : undefined}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white transition-colors hover:border-white/40"
                    >
                      Visit
                      <span aria-hidden="true" className="text-white/40">
                        ↗
                      </span>
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {rest.length ? (
        <section className="mt-14">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Also built</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rest.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/25"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-lg font-medium text-white">{p.title}</h3>
                  <span className="text-[0.6rem] uppercase tracking-[0.18em] text-white/35">
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </div>
                {p.summary ? (
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{p.summary}</p>
                ) : null}
                {p.link ? (
                  <a
                    href={p.link}
                    target={p.external ? '_blank' : undefined}
                    rel={p.external ? 'noreferrer noopener' : undefined}
                    className="mt-4 inline-block text-xs uppercase tracking-[0.18em] text-white/45 underline-offset-4 hover:text-white hover:underline"
                  >
                    Visit ↗
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {projects.length === 0 ? (
        <p className="rounded-[1.5rem] border border-dashed border-white/10 p-10 text-center text-sm text-white/35">
          Portfolio is being updated.
        </p>
      ) : null}

      <section className="mt-14 rounded-[1.75rem] border border-white/10 bg-white/5 p-8">
        <h2 className="text-xl font-semibold text-white">Want something like this built?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
          I take on consulting, contract builds, and collaborations. If you have a project
          that needs the same treatment, tell me about it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/consult/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm text-white transition-all duration-300 hover:border-white/40"
          >
            Start a conversation
          </Link>
          <Link
            href="/services/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white"
          >
            See services
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
