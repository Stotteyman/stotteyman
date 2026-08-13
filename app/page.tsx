import type { Metadata } from 'next';
import Link from 'next/link';

import ProjectVisual from '@/components/ProjectVisual';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import Section, { Container, SectionHeader } from '@/components/ui/Section';
import { siteConfig } from '@/lib/site-content';
import { loadCopy } from '@/lib/site-copy';
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
  image_url: string | null;
  sort_order: number;
};

type Service = { id: string; slug: string; title: string; summary: string; sort_order: number };

/**
 * The four guided flows, in the order a visitor is most likely to want them.
 *
 * Hard-coded rather than table-driven on purpose: each one is a route with bespoke
 * steps, so a row in a database could never do anything except go out of date.
 */
const FLOWS = [
  {
    href: '/build/',
    step: '01',
    label: 'Server builder',
    hint: 'Pick a game, player count and mods. Get a spec sheet and a price.',
    audience: 'For communities',
  },
  {
    href: '/consult/',
    step: '02',
    label: 'Start a project',
    hint: 'Four steps to a scoped brief, a budget band and a reply from me.',
    audience: 'For clients',
  },
  {
    href: '/follow/',
    step: '03',
    label: 'Get connected',
    hint: 'Discord, Kick and alerts set up in one pass instead of four links.',
    audience: 'For viewers',
  },
  {
    href: '/donate/',
    step: '04',
    label: 'Support the stream',
    hint: 'Tips, song requests and shoutouts, with the amount up to you.',
    audience: 'For supporters',
  },
] as const;

/**
 * Paint one phrase of the headline in the accent colour.
 *
 * The headline stays a SINGLE `site_copy` row. Splitting it into lead/accent/tail keys
 * would have silently orphaned the version already edited in HQ, leaving the hard-coded
 * fallback on the live homepage — the copy layer only helps if editing it still wins.
 * If the phrase is not present the headline simply renders plain, which is the correct
 * behaviour the moment someone rewrites the sentence.
 */
function accentuate(headline: string, phrase: string) {
  const at = phrase ? headline.indexOf(phrase) : -1;
  if (at < 0) return headline;
  return (
    <>
      {headline.slice(0, at)}
      <span className="text-accent">{phrase}</span>
      {headline.slice(at + phrase.length)}
    </>
  );
}

/**
 * Live status, straight from the Kick edge function the stream stack already uses.
 *
 * Never allowed to break the page: a homepage that 500s because a third party is slow
 * is a worse outcome than a missing pill, so every failure path returns false.
 */
async function isLiveOnKick(): Promise<boolean> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  try {
    const res = await fetch(`${base}/functions/v1/kick-chatroom?slug=stotteyman`, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 120 },
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { isLive?: boolean };
    return Boolean(body.isLive);
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const supabase = createSupabaseAnonClient();
  const copy = await loadCopy();
  const [{ data: projectRows }, { data: serviceRows }, live] = await Promise.all([
    supabase
      .from('public_projects')
      .select(
        'id, slug, title, summary, role, status, link, external, featured, image_url, sort_order'
      )
      .order('sort_order'),
    supabase
      .from('public_services')
      .select('id, slug, title, summary, sort_order')
      .order('sort_order'),
    isLiveOnKick(),
  ]);

  const projects = (projectRows ?? []) as unknown as Project[];
  const services = (serviceRows ?? []) as unknown as Service[];

  const featured = projects.filter((p) => p.featured);
  const [lead, ...rest] = featured.length ? featured : projects;
  const secondary = (featured.length ? rest : projects.slice(1)).slice(0, 3);

  const liveCount = projects.filter((p) => p.status === 'active').length;
  const shippedCount = projects.filter((p) => p.status === 'shipped').length;

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:text-accent-ink"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="content" className="relative">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[44rem] bg-grid-hairline [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[70rem] -translate-x-1/2 rounded-full opacity-40 blur-[130px]"
            style={{
              background:
                'radial-gradient(ellipse at center, rgb(255 122 26 / 0.28), transparent 68%)',
            }}
          />

          <Container>
            <section className="relative py-20 md:py-28">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-label uppercase text-accent">
                  {copy('home.eyebrow', 'Builder & operator')}
                </p>
                <span aria-hidden className="h-3 w-px bg-line-strong" />
                <Link
                  href="/stream/"
                  className="group flex items-center gap-2 font-mono text-label uppercase text-fg-subtle transition-colors duration-fast hover:text-fg"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      live ? 'animate-pulse bg-[#53FC18] shadow-[0_0_8px_#53FC18]' : 'bg-fg-faint'
                    }`}
                  />
                  {live ? 'Live on Kick now' : 'Streams on Kick'}
                  <span className="text-fg-faint transition-transform duration-fast group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>

              <h1 className="mt-8 max-w-[16ch] text-display-2xl font-medium text-fg">
                {accentuate(
                  copy(
                    'home.headline',
                    'I build multiplayer worlds, the platforms around them, and the systems that keep them running.'
                  ),
                  copy('home.headline_accent', 'multiplayer worlds')
                )}
              </h1>

              <p className="mt-9 max-w-prose text-body-lg text-fg-muted">
                {copy(
                  'home.intro',
                  'Game servers, community platforms, storefronts, and internal tooling — designed, engineered, and operated.'
                )}
              </p>

              <div className="mt-11 flex flex-wrap gap-3">
                <Button href="/work/" variant="primary" size="lg">
                  {copy('home.cta_primary', 'See the work')}
                </Button>
                <Button href="/build/" variant="secondary" size="lg">
                  Spec a server
                </Button>
              </div>

              {/* Counts, not adjectives. Every number here is a row in the database,
                  so the page cannot quietly start overstating the track record. */}
              <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                {[
                  { k: 'Running now', v: String(liveCount) },
                  { k: 'Shipped', v: String(shippedCount) },
                  { k: 'Disciplines', v: String(services.length || '—') },
                  { k: 'Availability', v: 'Open' },
                ].map((s) => (
                  <div key={s.k} className="bg-bg px-5 py-5">
                    <dt className="font-mono text-label uppercase text-fg-subtle">{s.k}</dt>
                    <dd className="mt-2 text-display-md font-medium text-fg">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </Container>
        </div>

        <Container>
          {/* ── Selected work ───────────────────────────────────────────────── */}
          {lead ? (
            <Section>
              <SectionHeader eyebrow="Selected work" action={{ href: '/work/', label: 'All projects' }} />

              <Reveal className="mt-8">
                <Link
                  href={lead.link}
                  {...(lead.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group grid overflow-hidden rounded-xl border border-line bg-bg-raised transition-colors duration-base hover:border-line-strong lg:grid-cols-2"
                >
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[24rem]">
                    <ProjectVisual
                      slug={lead.slug}
                      title={lead.title}
                      imageUrl={lead.image_url}
                      density="feature"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-7 md:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-label uppercase text-accent">Flagship</span>
                      <Badge status={lead.status} />
                    </div>
                    <h3 className="mt-5 text-display-md font-medium text-fg">{lead.title}</h3>
                    {lead.summary ? (
                      <p className="mt-4 max-w-prose text-body text-fg-muted">{lead.summary}</p>
                    ) : null}
                    {lead.role ? (
                      <p className="mt-6 font-mono text-label uppercase text-fg-subtle">{lead.role}</p>
                    ) : null}
                    <span className="mt-7 inline-flex items-center gap-2 text-body-sm text-fg transition-colors duration-fast group-hover:text-accent">
                      Read the case
                      <span className="transition-transform duration-fast group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>

              {secondary.length ? (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {secondary.map((p, i) => (
                    <Reveal key={p.id} delay={i * 60}>
                      <Link
                        href={p.link}
                        {...(p.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg-raised transition-colors duration-base hover:border-line-strong"
                      >
                        <div className="relative aspect-[16/9]">
                          <ProjectVisual slug={p.slug} title={p.title} imageUrl={p.image_url} />
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <h3 className="text-title font-medium text-fg">{p.title}</h3>
                            <Badge status={p.status} />
                          </div>
                          {p.summary ? (
                            <p className="mt-3 text-body-sm text-fg-muted">{p.summary}</p>
                          ) : null}
                          {p.role ? (
                            <p className="mt-auto pt-5 font-mono text-label uppercase text-fg-subtle">
                              {p.role}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </Section>
          ) : null}

          {/* ── Capability ──────────────────────────────────────────────────── */}
          {services.length ? (
            <Section>
              <SectionHeader eyebrow="What I do" action={{ href: '/services/', label: 'Details' }} />
              <ul className="mt-8">
                {services.map((s, i) => (
                  <Reveal key={s.id} delay={i * 50}>
                    <li>
                      <Link
                        href={`/services/#${s.slug}`}
                        className="group grid gap-3 border-t border-line py-7 transition-colors duration-fast hover:bg-surface md:grid-cols-[5rem_1fr_auto] md:items-baseline md:gap-8 md:px-3"
                      >
                        <span className="font-mono text-label uppercase text-fg-faint transition-colors duration-fast group-hover:text-accent">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>
                          <span className="block text-title font-medium text-fg">{s.title}</span>
                          <span className="mt-2 block max-w-prose text-body-sm text-fg-muted">
                            {s.summary}
                          </span>
                        </span>
                        <span className="text-body-sm text-fg-faint transition-all duration-fast group-hover:translate-x-1 group-hover:text-accent">
                          →
                        </span>
                      </Link>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </Section>
          ) : null}

          {/* ── Guided flows ────────────────────────────────────────────────── */}
          <Section>
            <SectionHeader eyebrow="Start here" />
            <p className="mt-5 max-w-prose text-body-lg text-fg-muted">
              Four guided routes through this site. Each one asks a few questions and ends
              somewhere useful — a spec, a quote, a connected account, or a reply from me.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {FLOWS.map((f, i) => (
                <Reveal key={f.href} delay={i * 60}>
                  <Link
                    href={f.href}
                    className="group flex h-full flex-col rounded-xl border border-line bg-bg-raised p-6 transition-all duration-base hover:-translate-y-0.5 hover:border-accent-line hover:bg-accent-soft"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-label uppercase text-accent">{f.step}</span>
                      <span className="font-mono text-label uppercase text-fg-faint">{f.audience}</span>
                    </div>
                    <h3 className="mt-6 text-title font-medium text-fg">{f.label}</h3>
                    <p className="mt-2.5 text-body-sm text-fg-muted">{f.hint}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-body-sm text-fg-subtle transition-colors duration-fast group-hover:text-accent">
                      Begin
                      <span className="transition-transform duration-fast group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ── Closing ─────────────────────────────────────────────────────── */}
          <Section size="lg" divide={false}>
            <h2 className="max-w-3xl text-display-lg font-medium text-fg">
              {copy(
                'home.closing',
                'If you are building something that needs a technical partner rather than a contractor, that is worth a conversation.'
              )}
            </h2>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/consult/" variant="primary" size="lg">
                Start a project
              </Button>
              <Button href={`mailto:${siteConfig.email}`} variant="secondary" size="lg">
                {siteConfig.email}
              </Button>
            </div>
            <p className="mt-9 flex items-center gap-2.5 text-body-sm text-fg-muted">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
              {copy('home.availability', 'Open to collaborations and new projects')}
            </p>
          </Section>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
