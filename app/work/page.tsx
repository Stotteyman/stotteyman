import type { Metadata } from 'next';
import Link from 'next/link';

import SiteShell from '@/components/SiteShell';
import { loadCopy } from '@/lib/site-copy';
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
  const copy = await loadCopy();
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
      eyebrow={copy('work.eyebrow', 'Work')}
      title={copy('work.title', 'Things I have designed, built, and kept running.')}
      intro={copy('work.intro', 'Multiplayer game servers, community platforms, storefronts, and the internal tooling that keeps them all manageable.')}
    >
      {featured.length ? (
        <section>
          <h2 className="text-label uppercase text-fg-subtle">Selected</h2>
          <div className="mt-6 grid gap-5">
            {featured.map((p) => (
              <article
                key={p.id}
                className="group rounded-xl border border-line bg-surface p-6 transition-colors hover:border-line-strong md:p-8"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="text-2xl font-semibold text-fg">{p.title}</h3>
                  <span className="rounded-full border border-line px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-fg-subtle">
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                  {p.entity_name ? (
                    <span className="text-xs text-fg-faint">{p.entity_name}</span>
                  ) : null}
                </div>

                {p.summary ? (
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-fg-muted">
                    {p.summary}
                  </p>
                ) : null}
                {p.body ? (
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-fg-subtle">{p.body}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {p.role ? (
                    <span className="text-label uppercase text-fg-faint">
                      {p.role}
                    </span>
                  ) : null}
                  {p.link ? (
                    <a
                      href={p.link}
                      target={p.external ? '_blank' : undefined}
                      rel={p.external ? 'noreferrer noopener' : undefined}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2 text-sm text-fg transition-colors hover:border-line-strong"
                    >
                      Visit
                      <span aria-hidden="true" className="text-fg-subtle">
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
          <h2 className="text-label uppercase text-fg-subtle">Also built</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rest.map((p) => (
              <article
                key={p.id}
                className="rounded-lg border border-line bg-surface p-5 transition-colors hover:border-line-strong"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-lg font-medium text-fg">{p.title}</h3>
                  <span className="text-[0.6rem] uppercase tracking-[0.18em] text-fg-faint">
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </div>
                {p.summary ? (
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.summary}</p>
                ) : null}
                {p.link ? (
                  <a
                    href={p.link}
                    target={p.external ? '_blank' : undefined}
                    rel={p.external ? 'noreferrer noopener' : undefined}
                    className="mt-4 inline-block text-label uppercase text-fg-subtle underline-offset-4 hover:text-fg hover:underline"
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
        <p className="rounded-lg border border-dashed border-line p-10 text-center text-sm text-fg-faint">
          Portfolio is being updated.
        </p>
      ) : null}

      <section className="mt-14 rounded-xl border border-line bg-surface p-8">
        <h2 className="text-xl font-semibold text-fg">{copy('work.cta_title', 'Want something like this built?')}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-fg-muted">
          {copy(
            'work.cta_body',
            'I take on consulting, contract builds, and collaborations. If you have a project that needs the same treatment, tell me about it.'
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/consult/"
            className="inline-flex items-center justify-center rounded-full border border-line bg-surface-hover px-6 py-3 text-sm text-fg transition-all duration-300 hover:border-line-strong"
          >
            Start a conversation
          </Link>
          <Link
            href="/services/"
            className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm text-fg-muted transition-all duration-300 hover:border-line-strong hover:text-fg"
          >
            See services
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
