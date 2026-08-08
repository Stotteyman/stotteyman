import type { Metadata } from 'next';

import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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
  sort_order: number;
};

type Service = { id: string; slug: string; title: string; summary: string; sort_order: number };

export default async function HomePage() {
  const supabase = createSupabaseAnonClient();
  const copy = await loadCopy();
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
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:text-accent-ink"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="content" className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-grid-hairline [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />

        <Container>
          <Section size="lg">
            <p className="font-mono text-label uppercase text-accent">
              {copy('home.eyebrow', 'Builder & operator')}
            </p>
            <h1 className="mt-6 max-w-4xl text-display-xl font-medium text-fg">
              {copy(
                'home.headline',
                'I build multiplayer worlds, the platforms around them, and the systems that keep them running.'
              )}
            </h1>
            <p className="mt-7 max-w-prose text-body-lg text-fg-muted">
              {copy(
                'home.intro',
                'Game servers, community platforms, storefronts, and internal tooling — designed, engineered, and operated.'
              )}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/work/" variant="primary" size="lg">
                {copy('home.cta_primary', 'See the work')}
              </Button>
              <Button href="/consult/" variant="secondary" size="lg">
                {copy('home.cta_secondary', 'Work with me')}
              </Button>
            </div>

            {/* Not a Badge: this string is a sentence, and an 11px uppercase mono pill
                breaks its border apart the moment it wraps on a narrow screen. */}
            <p className="mt-9 flex items-center gap-2.5 text-body-sm text-fg-muted">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
              {copy('home.availability', 'Open to collaborations and new projects')}
            </p>
          </Section>

          {featured.length ? (
            <Section>
              <SectionHeader eyebrow="Selected work" action={{ href: '/work/', label: 'All projects' }} />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {featured.map((p) => (
                  <Card key={p.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="text-title font-medium text-fg">{p.title}</h3>
                      <Badge status={p.status} />
                    </div>
                    {p.summary ? (
                      <p className="mt-3 text-body-sm text-fg-muted">{p.summary}</p>
                    ) : null}
                    {p.role ? (
                      <p className="mt-4 font-mono text-label uppercase text-fg-subtle">{p.role}</p>
                    ) : null}
                  </Card>
                ))}
              </div>
            </Section>
          ) : null}

          {services.length ? (
            <Section>
              <SectionHeader eyebrow="What I do" action={{ href: '/services/', label: 'Details' }} />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {services.map((s) => (
                  <Card key={s.id} padding="sm">
                    <h3 className="text-body font-medium text-fg">{s.title}</h3>
                    <p className="mt-2 text-body-sm text-fg-muted">{s.summary}</p>
                  </Card>
                ))}
              </div>
            </Section>
          ) : null}

          <Section size="lg" divide={false}>
            <h2 className="max-w-3xl text-display-md font-medium text-fg">
              {copy(
                'home.closing',
                'If you are building something that needs a technical partner rather than a contractor, that is worth a conversation.'
              )}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/consult/" variant="primary" size="lg">
                Start a conversation
              </Button>
              <Button href={`mailto:${siteConfig.email}`} variant="secondary" size="lg">
                {siteConfig.email}
              </Button>
            </div>
          </Section>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
