import type { Metadata } from 'next';
import Link from 'next/link';

import { navigationItems, siteConfig } from '@/lib/site-content';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

export const metadata: Metadata = {
  title: 'Stotteyman — Builder & operator',
  description:
    'I design, build, and run multiplayer game servers, community platforms, and the software that keeps them going. Open to consultations and collaborations.',
  openGraph: {
    title: 'Stotteyman — Builder & operator',
    description:
      'Game servers, community platforms, storefronts, and internal tooling — designed, engineered, and operated.',
  },
};

export const revalidate = 300;

type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  role: string | null;
  status: string;
  link: string;
  external: boolean;
  featured: boolean;
  sort_order: number;
};

type Service = { id: string; slug: string; title: string; summary: string; sort_order: number };

const STATUS_LABEL: Record<string, string> = {
  active: 'Live',
  shipped: 'Shipped',
  in_progress: 'In development',
};

export default async function HomePage() {
  const supabase = createSupabaseAnonClient();
  const [{ data: projectRows }, { data: serviceRows }] = await Promise.all([
    supabase
      .from('public_projects')
      .select('id, slug, title, summary, role, status, link, external, featured, sort_order')
      .order('sort_order'),
    supabase
      .from('public_services')
      .select('id, slug, title, summary, sort_order')
      .order('sort_order'),
  ]);

  const projects = (projectRows ?? []) as unknown as Project[];
  const services = (serviceRows ?? []) as unknown as Service[];
  const featured = projects.filter((p) => p.featured).slice(0, 4);

  return (
    <main className="relative min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,140,0,0.13),transparent),radial-gradient(ellipse_60%_40%_at_85%_110%,rgba(0,255,255,0.06),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern bg-grid opacity-[0.04]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-6 py-8">
          <span className="text-sm uppercase tracking-[0.45em] text-neon-orange/80">
            {siteConfig.name}
          </span>
          <nav aria-label="Primary" className="flex flex-wrap gap-2">
            {navigationItems
              .filter((i) => i.href !== '/')
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-300 transition-all duration-300 hover:border-neon-orange/60 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </header>

        <section className="border-b border-white/10 py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.35em] text-neon-cyan/80">
            {siteConfig.person}
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-light leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            I build multiplayer worlds, the platforms around them, and the systems that keep
            them running.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-gray-300">
            Game servers, community platforms, storefronts, and internal tooling — designed,
            engineered, and operated. Currently running a live Arma Reforger roleplay server and
            a group of businesses under Stotteyman Enterprises.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/work/"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.02]"
            >
              See the work
            </Link>
            <Link
              href="/consult/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm text-white transition-colors duration-300 hover:border-white/50"
            >
              Work with me
            </Link>
          </div>

          <p className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/25 bg-emerald-400/5 px-4 py-2 text-xs text-emerald-200/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Open to collaborations and new projects
          </p>
        </section>

        {featured.length ? (
          <section className="border-b border-white/10 py-16">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Selected work</h2>
              <Link href="/work/" className="text-xs text-white/40 underline hover:text-white/70">
                All projects
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {featured.map((p) => (
                <article
                  key={p.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/25"
                >
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <h3 className="text-xl font-medium text-white">{p.title}</h3>
                    <span className="text-[0.6rem] uppercase tracking-[0.18em] text-white/35">
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                  {p.summary ? (
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{p.summary}</p>
                  ) : null}
                  {p.role ? (
                    <p className="mt-4 text-[0.65rem] uppercase tracking-[0.18em] text-white/30">
                      {p.role}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {services.length ? (
          <section className="border-b border-white/10 py-16">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">What I do</h2>
              <Link
                href="/services/"
                className="text-xs text-white/40 underline hover:text-white/70"
              >
                Details
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-base font-medium text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{s.summary}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="py-16">
          <h2 className="max-w-3xl text-2xl font-light leading-snug text-white md:text-3xl">
            If you are building something that needs a technical partner rather than a
            contractor, that is worth a conversation.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/consult/"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.02]"
            >
              Start a conversation
            </Link>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm text-white transition-colors duration-300 hover:border-white/50"
            >
              {siteConfig.email}
            </a>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-gray-500">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>{siteConfig.person}</p>
            <p>{siteConfig.location}</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
