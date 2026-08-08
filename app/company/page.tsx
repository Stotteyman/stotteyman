import type { Metadata } from 'next';

import SiteShell from '@/components/SiteShell';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/Section';
import { siteConfig } from '@/lib/site-content';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

export const metadata: Metadata = {
  title: 'Company',
  description:
    'Stotteyman Enterprises LLC — the group structure behind the game studios, web platforms, storefronts, and community businesses.',
};

export const revalidate = 300;

type Entity = {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  kind: string;
  status: string;
  tagline: string | null;
  description: string | null;
  domain: string | null;
  sort_order: number;
};

const KIND_LABEL: Record<string, string> = {
  holding: 'Holding company',
  business: 'Business',
  product: 'Product',
  service: 'Service',
  property: 'Property',
};

/** Strips scheme and any path so a stored URL still renders as a clean hostname. */
const host = (d: string) => d.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

type Node = Entity & { children: Node[] };

function buildTree(rows: Entity[]): Node[] {
  const byId = new Map<string, Node>(rows.map((r) => [r.id, { ...r, children: [] }]));
  const roots: Node[] = [];

  for (const node of byId.values()) {
    // A row whose parent was filtered out (a client, an archived business) would
    // otherwise vanish entirely, so it is promoted to a root rather than dropped.
    const parent = node.parent_id ? byId.get(node.parent_id) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortRec = (nodes: Node[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}

function TreeBranch({ nodes, depth = 0 }: { nodes: Node[]; depth?: number }) {
  return (
    <ul className={depth === 0 ? 'grid gap-2' : 'mt-2 grid gap-2 border-l border-line pl-5'}>
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span
              className={
                depth === 0
                  ? 'text-body font-medium text-fg'
                  : depth === 1
                    ? 'text-body-sm font-medium text-fg'
                    : 'text-body-sm text-fg-muted'
              }
            >
              {node.domain ? (
                <a
                  href={`https://${host(node.domain)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline decoration-line underline-offset-4 transition-colors hover:decoration-accent hover:text-accent"
                >
                  {node.name}
                </a>
              ) : (
                node.name
              )}
            </span>
            <span className="font-mono text-label uppercase text-fg-faint">
              {KIND_LABEL[node.kind] ?? node.kind}
            </span>
            {node.status !== 'active' ? <Badge status={node.status} /> : null}
          </div>
          {node.children.length ? <TreeBranch nodes={node.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

export default async function CompanyPage() {
  const supabase = createSupabaseAnonClient();
  const { data } = await supabase
    .from('public_entities')
    .select('id, parent_id, slug, name, kind, status, tagline, description, domain, sort_order')
    .order('sort_order');

  /**
   * Clients are `kind: 'external'` and are deliberately excluded.
   *
   * They sit outside the ownership tree by design, and publishing a client list
   * without each client's agreement is not ours to do.
   */
  const owned = ((data ?? []) as unknown as Entity[]).filter((e) => e.kind !== 'external');
  const tree = buildTree(owned);

  const withSites = owned.filter((e) => e.domain && e.kind !== 'holding');

  return (
    <SiteShell
      eyebrow="Company"
      title={siteConfig.legalName}
      intro="A holding company for a group of game studios, web platforms, storefronts, and community businesses — most of them built in-house and all of them operated in-house."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': `${siteConfig.siteUrl}/#organization`,
            name: siteConfig.legalName,
            legalName: siteConfig.legalName,
            url: `${siteConfig.siteUrl}/company/`,
            email: siteConfig.email,
            subOrganization: owned
              .filter((e) => e.kind !== 'holding')
              .map((e) => ({
                '@type': 'Organization',
                name: e.name,
                ...(e.domain ? { url: `https://${host(e.domain)}` } : {}),
                ...(e.tagline ? { description: e.tagline } : {}),
              })),
          }),
        }}
      />

      <div className="grid gap-16">
        <section>
          <SectionHeader eyebrow="Group structure" />
          <p className="mt-5 max-w-prose text-body-sm text-fg-muted">
            Ownership runs top-down. Anything with a live site links straight to it.
          </p>
          <div className="mt-7 rounded-lg border border-line bg-surface p-6 md:p-8">
            {tree.length ? (
              <TreeBranch nodes={tree} />
            ) : (
              <p className="text-body-sm text-fg-subtle">Structure is being updated.</p>
            )}
          </div>
        </section>

        {withSites.length ? (
          <section>
            <SectionHeader eyebrow="Businesses and products" />
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {withSites.map((e) => (
                <Card key={e.id} href={`https://${host(e.domain!)}`} external>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-title font-medium text-fg">{e.name}</h3>
                    <Badge status={e.status} />
                  </div>
                  {e.tagline || e.description ? (
                    <p className="mt-3 text-body-sm text-fg-muted">
                      {e.tagline ?? e.description}
                    </p>
                  ) : null}
                  <p className="mt-4 font-mono text-label uppercase text-fg-subtle">
                    {host(e.domain!)} ↗
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHeader eyebrow="Enquiries" />
          <p className="mt-5 max-w-prose text-body-sm text-fg-muted">
            Partnership, acquisition, or supplier enquiries for any business in the group go
            to{' '}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-accent underline underline-offset-4"
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
