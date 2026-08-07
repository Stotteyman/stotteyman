import 'server-only';

import crypto from 'node:crypto';

/**
 * Minimal Stripe client over REST.
 *
 * Deliberately not the Stripe SDK: Stotteyman Enterprises is a Stripe
 * *Organization*, so one `sk_org_live_…` key acts as any sub-account by sending a
 * `Stripe-Context` header — and the SDK has no way to set it. The read-only
 * revenue connector already talks to Stripe this way; this is the write side.
 *
 * Falls back to a plain per-account secret key when no org key is configured, so
 * donations can be switched on before the org plumbing exists.
 */

const STRIPE_VERSION = '2025-08-27.basil';

type StripeAuth = { key: string; context?: string };

/** Resolves whichever credential is configured, or null if donations are not wired up. */
export function stripeAuth(): StripeAuth | null {
  const direct = process.env.STRIPE_SECRET_KEY;
  if (direct) return { key: direct };

  const orgKey = process.env.STRIPE_ORG_KEY;
  const account = process.env.STRIPE_ACCOUNT_STOTTEYMAN;
  // An org key with no context 400s on every call, so treat that as unconfigured
  // rather than letting it fail at request time.
  if (orgKey && account) return { key: orgKey, context: account };

  return null;
}

export function stripeConfigured(): boolean {
  return stripeAuth() !== null;
}

/** Flattens nested objects into Stripe's bracket form: metadata[donation_id]=… */
function toForm(payload: Record<string, unknown>, prefix = ''): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === 'object' && !Array.isArray(value)) {
      parts.push(...toForm(value as Record<string, unknown>, name));
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object') {
          parts.push(...toForm(item as Record<string, unknown>, `${name}[${i}]`));
        } else {
          parts.push(`${encodeURIComponent(`${name}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

export async function stripePost<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const auth = stripeAuth();
  if (!auth) throw new Error('Stripe is not configured');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${auth.key}`,
    'Stripe-Version': STRIPE_VERSION,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (auth.context) headers['Stripe-Context'] = auth.context;

  const res = await fetch(`https://api.stripe.com${path}`, {
    method: 'POST',
    headers,
    body: toForm(payload).join('&'),
    signal: AbortSignal.timeout(15000),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe ${res.status}: ${body?.error?.message ?? 'unknown error'}`);
  }
  return body as T;
}

/**
 * Verifies a Stripe webhook signature.
 *
 * FAILS CLOSED: no secret configured means every event is rejected. Accepting
 * unsigned events "until the secret is set" is exactly how a donation endpoint
 * ends up firing alerts for payments that never happened.
 */
export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  toleranceSeconds = 300
): { ok: true } | { ok: false; reason: string } {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return { ok: false, reason: 'STRIPE_WEBHOOK_SECRET is not set' };
  if (!signatureHeader) return { ok: false, reason: 'missing stripe-signature header' };

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => {
      const i = kv.indexOf('=');
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    })
  ) as Record<string, string>;

  const timestamp = parts.t;
  const supplied = parts.v1;
  if (!timestamp || !supplied) return { ok: false, reason: 'malformed signature header' };

  // Reject replays of a genuinely-signed old event.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) {
    return { ok: false, reason: 'timestamp outside tolerance' };
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'signature mismatch' };
  }

  return { ok: true };
}
