import 'server-only';

import { runConnector, type ConnectorResult } from './types';

type Site = {
  id: string;
  name: string;
  url: string;
  ssl: boolean;
  custom_domain: string | null;
  account_type?: string;
  published_deploy?: { id: string; state: string; created_at: string; branch: string } | null;
};

/**
 * Deploy health across every Netlify site.
 *
 * Also surfaces `account_type` — sites on the dead "Restricted Team" report as healthy
 * by every other measure while serving nothing, so it is the one field that actually
 * distinguishes a live site from a zombie.
 */
export async function fetchNetlify(
  entities: { slug: string; netlify_site_id: string | null }[]
): Promise<ConnectorResult> {
  return runConnector('netlify', async (signal) => {
    const token = process.env.NETLIFY_API_TOKEN;
    if (!token) {
      return {
        notConfigured: true,
        error: 'NETLIFY_API_TOKEN not set',
        summary: {},
        entityMetrics: {},
      };
    }

    const res = await fetch('https://api.netlify.com/api/v1/sites?per_page=100', {
      headers: { Authorization: `Bearer ${token}` },
      signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Netlify ${res.status}: ${(await res.text()).slice(0, 200)}`);

    const sites = (await res.json()) as Site[];

    const shaped = sites.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      ssl: s.ssl,
      customDomain: s.custom_domain,
      accountType: s.account_type ?? null,
      restricted: s.account_type === 'Restricted Team',
      deployState: s.published_deploy?.state ?? 'none',
      deployedAt: s.published_deploy?.created_at ?? null,
      branch: s.published_deploy?.branch ?? null,
    }));

    const byId = new Map(shaped.map((s) => [s.id, s]));
    const entityMetrics: Record<string, Record<string, unknown>> = {};
    for (const e of entities) {
      if (!e.netlify_site_id) continue;
      const site = byId.get(e.netlify_site_id);
      if (site) entityMetrics[e.slug] = { ...site };
    }

    return {
      summary: {
        totalSites: shaped.length,
        failed: shaped.filter((s) => s.deployState === 'error').map((s) => s.name),
        noSsl: shaped.filter((s) => s.customDomain && !s.ssl).map((s) => s.name),
        restricted: shaped.filter((s) => s.restricted).map((s) => s.name),
        mostRecentDeploy:
          shaped
            .filter((s) => s.deployedAt)
            .sort((a, b) => (a.deployedAt! < b.deployedAt! ? 1 : -1))[0] ?? null,
      },
      entityMetrics,
    };
  });
}
