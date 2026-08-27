import 'server-only';

import crypto from 'node:crypto';

import { createSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * Storage layer for Ask Me Anything.
 *
 * Every read and write goes through the service client, because the table has no
 * `anon` grant at all — the asker's authority is their token, checked here, not an
 * RLS policy. That is deliberate: the anon key ships inside the browser bundle, so
 * any policy permissive enough to let an asker read their own row would also let a
 * stranger read everyone's.
 */

export const AMA_TABLE = 'ama_questions';

/** Price of one question, in cents. Overridable so it can be changed without a deploy. */
export function amaPriceCents(): number {
  const raw = Number(process.env.AMA_PRICE_CENTS);
  return Number.isFinite(raw) && raw >= 100 ? Math.round(raw) : 500;
}

export type AmaStatus = 'pending' | 'paid' | 'answered' | 'refunded' | 'expired';

export type AmaRow = {
  id: string;
  public_token: string;
  question: string;
  asker_name: string | null;
  asker_email: string | null;
  status: AmaStatus;
  amount_cents: number;
  currency: string;
  provider_ref: string | null;
  answer: string | null;
  answered_at: string | null;
  instant_answer: InstantAnswer | null;
  instant_answer_at: string | null;
  internal_notes: string | null;
  notified_at: string | null;
  paid_at: string | null;
  created_at: string;
};

export type InstantAnswer = {
  summary: string;
  source: string;
  sourceUrl: string | null;
  links: { title: string; url: string }[];
  generatedAt: string;
};

/**
 * 32 bytes of entropy, base64url.
 *
 * This is the whole access control for a question — it appears in the Stripe success
 * URL and is the only thing between a stranger and someone else's question. A short
 * id or a sequential number would make the entire queue enumerable.
 */
export function newToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/** One-way hash of the asker's IP, for rate limiting without storing addresses. */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return crypto.createHash('sha256').update(`ama:${ip}`).digest('hex').slice(0, 32);
}

export async function createQuestion(input: {
  question: string;
  askerName: string | null;
  askerEmail: string | null;
  amountCents: number;
  ipHash: string | null;
}): Promise<AmaRow> {
  const admin = createSupabaseServiceClient();
  const { data, error } = await admin
    .from(AMA_TABLE)
    .insert({
      public_token: newToken(),
      question: input.question,
      asker_name: input.askerName,
      asker_email: input.askerEmail,
      amount_cents: input.amountCents,
      status: 'pending',
      ip_hash: input.ipHash,
    })
    .select('*')
    .single();

  if (error) throw new Error(`could not record question: ${error.message}`);
  return data as AmaRow;
}

export async function findByToken(token: string): Promise<AmaRow | null> {
  if (!token || token.length < 20) return null;
  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from(AMA_TABLE)
    .select('*')
    .eq('public_token', token)
    .maybeSingle();
  return (data as AmaRow) ?? null;
}

/**
 * Marks a question paid. Idempotent.
 *
 * The `.eq('status', 'pending')` filter is the guard: Stripe redelivers webhooks as a
 * matter of course, and without it a redelivery would ping Stotteyman's phone a second
 * time for a question he has already read.
 */
export async function markPaid(
  id: string,
  detail: { providerRef?: string | null; email?: string | null }
): Promise<AmaRow | null> {
  const admin = createSupabaseServiceClient();
  const patch: Record<string, unknown> = {
    status: 'paid',
    paid_at: new Date().toISOString(),
  };
  if (detail.providerRef) patch.provider_ref = detail.providerRef;
  // Stripe's own email is better than the one typed into our form — it is the address
  // the receipt went to — but never overwrite a given address with nothing.
  if (detail.email) patch.asker_email = detail.email;

  const { data } = await admin
    .from(AMA_TABLE)
    .update(patch)
    .eq('id', id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();

  return (data as AmaRow) ?? null;
}

export async function markExpired(id: string): Promise<void> {
  const admin = createSupabaseServiceClient();
  await admin
    .from(AMA_TABLE)
    .update({ status: 'expired' })
    .eq('id', id)
    .eq('status', 'pending');
}

export async function markNotified(id: string): Promise<void> {
  const admin = createSupabaseServiceClient();
  await admin.from(AMA_TABLE).update({ notified_at: new Date().toISOString() }).eq('id', id);
}

export async function saveInstantAnswer(id: string, answer: InstantAnswer): Promise<void> {
  const admin = createSupabaseServiceClient();
  await admin
    .from(AMA_TABLE)
    .update({ instant_answer: answer, instant_answer_at: answer.generatedAt })
    .eq('id', id);
}

/**
 * Counts questions from one IP in the last hour.
 *
 * Checkout costs nothing to start, so without this a bot can mint unlimited pending
 * rows and fire off unlimited outbound Stripe calls.
 */
export async function recentFromIp(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const admin = createSupabaseServiceClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from(AMA_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);
  return count ?? 0;
}
