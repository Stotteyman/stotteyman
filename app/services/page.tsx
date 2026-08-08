import type { Metadata } from 'next';
import Link from 'next/link';

import SiteShell from '@/components/SiteShell';
import { loadCopy } from '@/lib/site-copy';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Game and server development, web platforms, community and Discord systems, and brand work.',
};

// Content is edited from HQ; re-render periodically rather than pinning it at build time.
export const revalidate = 300;

type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  detail: string | null;
  deliverables: string[];
  starting_at: string | null;
  cta_label: string | null;
  sort_order: number;
};

export default async function ServicesPage() {
  const supabase = createSupabaseAnonClient();
  const copy = await loadCopy();
  const { data } = await supabase
    .from('public_services')
    .select('id, slug, title, summary, detail, deliverables, starting_at, cta_label, sort_order')
    .order('sort_order');

  const services = (data ?? []) as unknown as Service[];

  return (
    <SiteShell
      eyebrow={copy('services.eyebrow', 'Services')}
      title={copy('services.title', 'What I build, and what it looks like to hire me for it.')}
      intro={copy('services.intro', 'Four things I do well.')}
    >
      <div className="grid gap-5">
        {services.map((s) => (
          <article
            key={s.id}
            className="rounded-xl border border-line bg-surface p-6 md:p-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold text-fg">{s.title}</h2>
              {s.starting_at ? (
                <span className="text-label uppercase text-fg-subtle">
                  {s.starting_at}
                </span>
              ) : null}
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-fg-muted">{s.summary}</p>
            {s.detail ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-fg-subtle">{s.detail}</p>
            ) : null}

            {s.deliverables.length ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {s.deliverables.map((d) => (
                  <li
                    key={d}
                    className="rounded-full border border-line bg-bg-raised px-3 py-1.5 text-xs text-fg-muted"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            ) : null}

            <Link
              href="/consult/"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-line bg-surface-hover px-5 py-2.5 text-sm text-fg transition-all duration-300 hover:border-line-strong"
            >
              {s.cta_label ?? 'Start a conversation'}
            </Link>
          </article>
        ))}

        {services.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-fg-faint">
            Services are being updated. Get in touch and ask.
          </p>
        ) : null}
      </div>

      <section className="mt-12 rounded-xl border border-line bg-surface p-8">
        <h2 className="text-xl font-semibold text-fg">{copy('services.collab_title', 'Open to collaborations')}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-fg-muted">
          {copy(
            'services.collab_body',
            'Beyond client work I am actively interested in building things with other people — co-founding, revenue shares, and joint projects.'
          )}
        </p>
        <Link
          href="/consult/"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-line bg-surface-hover px-6 py-3 text-sm text-fg transition-all duration-300 hover:border-line-strong"
        >
          Pitch a collaboration
        </Link>
      </section>
    </SiteShell>
  );
}
