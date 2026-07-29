/**
 * The distribution queue.
 *
 * Every channel is an independent unit of work. Instagram rejecting a caption must not
 * roll back the blog post, re-post to Discord, or block YouTube — so a run settles each
 * distribution on its own and only rolls the draft's summary status up at the end.
 */
import { getAdapter } from './adapters';
import { ensureMediaIngested } from './discord/compose';
import { reportToDiscord } from './discord/report';
import { studioClient } from './supabase';
import type {
  Channel,
  PublishContext,
  StudioDistribution,
  StudioDraft,
  StudioMedia,
} from './types';
import { PublishError, backoffSeconds } from './types';

export type QueueOutcome = {
  distributionId: string;
  channel: Channel;
  status: 'succeeded' | 'failed' | 'retrying';
  url?: string | null;
  error?: string | null;
  note?: string | null;
};

/** Creates the per-channel rows for a draft. Idempotent via unique(draft_id, channel). */
export async function queueDraft(
  draftId: string,
  channels: Channel[],
  captions: Partial<Record<Channel, string>> = {}
): Promise<number> {
  if (!channels.length) return 0;
  const supabase = studioClient();

  const rows = channels.map((channel) => ({
    draft_id: draftId,
    channel,
    caption: captions[channel] ?? null,
    status: 'pending' as const,
  }));

  const { data, error } = await supabase
    .from('distributions')
    .upsert(rows, { onConflict: 'draft_id,channel', ignoreDuplicates: true })
    .select('id');

  if (error) throw new Error(`Could not queue distributions: ${error.message}`);

  await supabase.from('drafts').update({ status: 'queued' }).eq('id', draftId);
  return data?.length ?? 0;
}

async function loadDraft(draftId: string): Promise<{ draft: StudioDraft; media: StudioMedia[] }> {
  const supabase = studioClient();

  const { data: draft, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('id', draftId)
    .single();
  if (error || !draft) throw new Error(`Draft ${draftId} not found: ${error?.message}`);

  // Copies Discord attachments into Storage on first use. Idempotent, so the second and
  // subsequent channels for the same draft just read what the first one stored.
  const { media, errors } = await ensureMediaIngested(draftId);
  if (errors.length && !media.length) {
    throw new PublishError(`Media could not be ingested: ${errors.join(' ')}`, false);
  }

  return { draft: draft as StudioDraft, media };
}

async function settle(
  row: StudioDistribution,
  patch: Record<string, unknown>
): Promise<void> {
  const supabase = studioClient();
  await supabase.from('distributions').update(patch).eq('id', row.id);
}

/** Runs one already-claimed distribution to completion, failure, or a scheduled retry. */
export async function runDistribution(row: StudioDistribution): Promise<QueueOutcome> {
  const adapter = getAdapter(row.channel);

  if (!adapter) {
    await settle(row, {
      status: 'failed',
      error: `No adapter for channel "${row.channel}".`,
      completed_at: new Date().toISOString(),
    });
    return { distributionId: row.id, channel: row.channel, status: 'failed', error: 'no adapter' };
  }

  const notReady = adapter.preflight();
  if (notReady) {
    // Missing configuration will not fix itself on a retry.
    await settle(row, {
      status: 'failed',
      error: notReady,
      completed_at: new Date().toISOString(),
    });
    return { distributionId: row.id, channel: row.channel, status: 'failed', error: notReady };
  }

  const logs: string[] = [];

  try {
    const { draft, media } = await loadDraft(row.draft_id);

    const ctx: PublishContext = {
      draft,
      media,
      caption: row.caption ?? draft.body ?? '',
      options: row.options ?? {},
      log: (message, detail) => {
        logs.push(message);
        console.info(`[studio:${row.channel}] ${message}`, detail ?? '');
      },
    };

    const invalid = adapter.validate?.(ctx);
    if (invalid) throw new PublishError(invalid, false);

    const result = await adapter.publish(ctx);

    await settle(row, {
      status: 'succeeded',
      remote_id: result.remoteId ?? null,
      remote_url: result.remoteUrl ?? null,
      error: result.note ?? null,
      completed_at: new Date().toISOString(),
    });

    return {
      distributionId: row.id,
      channel: row.channel,
      status: 'succeeded',
      url: result.remoteUrl,
      note: result.note ?? null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const retryable = err instanceof PublishError ? err.retryable : true;
    const exhausted = row.attempts >= row.max_attempts;

    if (retryable && !exhausted) {
      const wait = backoffSeconds(row.attempts);
      await settle(row, {
        status: 'pending',
        error: message,
        next_attempt_at: new Date(Date.now() + wait * 1000).toISOString(),
      });
      console.warn(`[studio:${row.channel}] retrying in ${wait}s — ${message}`);
      return { distributionId: row.id, channel: row.channel, status: 'retrying', error: message };
    }

    await settle(row, {
      status: 'failed',
      error: message,
      completed_at: new Date().toISOString(),
    });
    console.error(`[studio:${row.channel}] failed — ${message}`);
    return { distributionId: row.id, channel: row.channel, status: 'failed', error: message };
  }
}

/**
 * Rolls the draft's summary status up from its distributions.
 *
 * `done` means nothing is still in flight — not that everything succeeded. A draft with
 * one failed channel and three successes is finished, and saying otherwise would leave it
 * looking stuck forever.
 */
export async function rollUpDraft(draftId: string): Promise<StudioDistribution[]> {
  const supabase = studioClient();

  const { data } = await supabase.from('distributions').select('*').eq('draft_id', draftId);
  const rows = (data ?? []) as StudioDistribution[];
  if (!rows.length) return rows;

  const inFlight = rows.some((r) => r.status === 'pending' || r.status === 'processing');
  const anySucceeded = rows.some((r) => r.status === 'succeeded');

  const status = inFlight ? 'publishing' : anySucceeded ? 'done' : 'failed';
  await supabase.from('drafts').update({ status }).eq('id', draftId);

  return rows;
}

/** Claims and runs up to `limit` due distributions. Safe to run concurrently. */
export async function drainQueue(limit = 5): Promise<QueueOutcome[]> {
  const supabase = studioClient();

  await supabase.rpc('requeue_stalled_distributions', { p_older_than: '20 minutes' });

  const { data, error } = await supabase.rpc('claim_distributions', { p_limit: limit });
  if (error) throw new Error(`Could not claim distributions: ${error.message}`);

  const claimed = (data ?? []) as StudioDistribution[];
  if (!claimed.length) return [];

  // Sequential on purpose: several adapters upload the same large video, and running
  // them in parallel inside one function multiplies peak memory by the fan-out.
  const outcomes: QueueOutcome[] = [];
  for (const row of claimed) {
    outcomes.push(await runDistribution(row));
  }

  for (const draftId of new Set(claimed.map((r) => r.draft_id))) {
    const rows = await rollUpDraft(draftId);
    // Reporting is best-effort: a Discord outage must not fail a publish that worked.
    await reportToDiscord(draftId, rows).catch((err) =>
      console.warn('[studio] could not report to Discord', err)
    );
  }

  return outcomes;
}
