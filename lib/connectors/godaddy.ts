import 'server-only';

import { runConnector, type ConnectorResult } from './types';

type Domain = {
  domain: string;
  status: string;
  expires: string;
  renewAuto: boolean;
  locked: boolean;
};

/**
 * Domain portfolio and expiry warnings.
 *
 * Auth is `Bearer <PAT>` — the older `sso-key KEY:SECRET` form 401s against this
 * account's token.
 */
export async function fetchGoDaddy(
  entities: { slug: string; domain: string | null }[]
): Promise<ConnectorResult> {
  return runConnector('godaddy', async (signal) => {
    const pat = process.env.GODADDY_PAT;
    if (!pat) {
      return { notConfigured: true, error: 'GODADDY_PAT not set', summary: {}, entityMetrics: {} };
    }

    const res = await fetch('https://api.godaddy.com/v1/domains?limit=500', {
      headers: { Authorization: `Bearer ${pat}` },
      signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`GoDaddy ${res.status}: ${(await res.text()).slice(0, 200)}`);

    const all = (await res.json()) as Domain[];
    const active = all.filter((d) => d.status === 'ACTIVE');
    const now = Date.now();
    const daysUntil = (iso: string) => Math.floor((new Date(iso).getTime() - now) / 86_400_000);

    const domains = active
      .map((d) => ({
        domain: d.domain,
        expires: d.expires,
        daysUntilExpiry: daysUntil(d.expires),
        renewAuto: d.renewAuto,
        locked: d.locked,
      }))
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    // Attribute each domain to the entity that declares it.
    const entityMetrics: Record<string, Record<string, unknown>> = {};
    for (const e of entities) {
      if (!e.domain) continue;
      const host = e.domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const apex = host.split('.').slice(-2).join('.');
      const match = domains.find((d) => d.domain === apex || d.domain === host);
      if (match) {
        entityMetrics[e.slug] = {
          domain: match.domain,
          expires: match.expires,
          daysUntilExpiry: match.daysUntilExpiry,
          renewAuto: match.renewAuto,
        };
      }
    }

    return {
      summary: {
        totalDomains: active.length,
        // Anything inside 60 days is worth surfacing even with auto-renew on:
        // auto-renew silently fails when the card on file has expired.
        expiringSoon: domains.filter((d) => d.daysUntilExpiry <= 60),
        autoRenewOff: domains.filter((d) => !d.renewAuto).map((d) => d.domain),
        nextExpiry: domains[0] ?? null,
      },
      entityMetrics,
    };
  });
}
