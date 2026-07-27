import 'server-only';

import { runConnector, type ConnectorResult } from './types';

/**
 * Stripe revenue, per sub-account.
 *
 * Stotteyman Enterprises LLC is a Stripe *Organization*: one `sk_org_live_…` key acts as
 * any sub-account by sending `Stripe-Context: acct_…`. That is how consolidated revenue
 * works without holding a separate secret key per business.
 *
 * Two hard requirements, both of which 400 if missed:
 *   - `Stripe-Version` must be explicit
 *   - `Stripe-Context` must be set when using an org key
 *
 * Falls back to a per-entity key (`STRIPE_KEY_<SLUG>`) when no org key is present, so a
 * single business can be wired up before the org key exists.
 */
const STRIPE_VERSION = '2025-08-27.basil';

type StripeCall = { key: string; context?: string };

async function stripeGet<T>(path: string, call: StripeCall, signal: AbortSignal): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${call.key}`,
    'Stripe-Version': STRIPE_VERSION,
  };
  if (call.context) headers['Stripe-Context'] = call.context;

  const res = await fetch(`https://api.stripe.com${path}`, { headers, signal, cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Stripe ${res.status} on ${path}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

function envKeyFor(slug: string): string | undefined {
  return process.env[`STRIPE_KEY_${slug.toUpperCase().replace(/-/g, '_')}`];
}

export async function fetchStripe(
  entities: { slug: string; name: string; stripe_account_id: string | null }[]
): Promise<ConnectorResult> {
  return runConnector('stripe', async (signal) => {
    const orgKey = process.env.STRIPE_ORG_KEY;

    const targets = entities
      .map((e) => {
        const perEntity = envKeyFor(e.slug);
        if (perEntity) return { entity: e, call: { key: perEntity } as StripeCall };
        if (orgKey && e.stripe_account_id) {
          return { entity: e, call: { key: orgKey, context: e.stripe_account_id } as StripeCall };
        }
        return null;
      })
      .filter((t): t is { entity: (typeof entities)[number]; call: StripeCall } => t !== null);

    if (targets.length === 0) {
      return {
        notConfigured: true,
        error:
          'No Stripe credentials. Set STRIPE_ORG_KEY (sk_org_live_…) to cover every ' +
          'sub-account via Stripe-Context, or STRIPE_KEY_<SLUG> for a single business.',
        summary: { configuredAccounts: 0 },
        entityMetrics: {},
      };
    }

    const since = Math.floor(Date.now() / 1000) - 30 * 86_400;
    const entityMetrics: Record<string, Record<string, unknown>> = {};
    let grossLast30 = 0;
    let currency = 'usd';
    const failures: { entity: string; error: string }[] = [];

    // Sequential on purpose: Stripe rate-limits, and this is a handful of accounts.
    for (const { entity, call } of targets) {
      try {
        const charges = await stripeGet<{
          data: { amount: number; currency: string; refunded: boolean; amount_refunded: number }[];
        }>(`/v1/charges?limit=100&created[gte]=${since}`, call, signal);

        const net = charges.data
          .filter((c) => !c.refunded)
          .reduce((a, c) => a + (c.amount - (c.amount_refunded ?? 0)), 0);

        const subs = await stripeGet<{ data: { id: string }[] }>(
          '/v1/subscriptions?status=active&limit=100',
          call,
          signal
        );

        if (charges.data[0]?.currency) currency = charges.data[0].currency;
        grossLast30 += net;

        entityMetrics[entity.slug] = {
          account: call.context ?? 'direct-key',
          last30Gross: net / 100,
          currency,
          chargeCount: charges.data.length,
          activeSubscriptions: subs.data.length,
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        failures.push({ entity: entity.slug, error: message });
        entityMetrics[entity.slug] = { account: call.context ?? 'direct-key', error: message };
      }
    }

    return {
      summary: {
        configuredAccounts: targets.length,
        last30Gross: grossLast30 / 100,
        currency,
        failures,
        mode: orgKey ? 'organization-key' : 'per-entity-key',
      },
      entityMetrics,
      ...(failures.length === targets.length
        ? { error: `All ${targets.length} Stripe account(s) failed: ${failures[0]?.error}` }
        : {}),
    };
  });
}
