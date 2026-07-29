/**
 * Discord interactions endpoint — the Studio composer's front door.
 *
 * Runs as an ordinary route handler rather than a gateway bot: a message context-menu
 * command is a plain signed HTTPS callback, so "drop a clip in #studio and publish it"
 * needs no always-on process and no second host.
 *
 * Discord gives us three seconds to respond, so everything here is a signature check
 * plus at most one database write. No downloads, no external APIs.
 */
import { NextResponse } from 'next/server';

import { channelStatuses } from '@/lib/studio/adapters';
import {
  composeDraft,
  previewMedia,
  type DiscordAttachment,
  type PendingMedia,
} from '@/lib/studio/discord/compose';
import {
  BUTTON_STYLE,
  MESSAGE_FLAGS,
  buildComposer,
  composerSummary,
  defaultSelection,
  selectedFromComponents,
  type DiscordComponent,
} from '@/lib/studio/discord/ui';
import { verifyDiscordSignature } from '@/lib/studio/discord/verify';
import { queueDraft } from '@/lib/studio/queue';
import { studioClient } from '@/lib/studio/supabase';
import type { Channel } from '@/lib/studio/types';

// node:crypto and the Supabase service key both need the Node runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InteractionType = { PING: 1, APPLICATION_COMMAND: 2, MESSAGE_COMPONENT: 3 } as const;
const CallbackType = {
  PONG: 1,
  CHANNEL_MESSAGE: 4,
  DEFERRED_UPDATE: 6,
  UPDATE_MESSAGE: 7,
} as const;

type Interaction = {
  type: number;
  data?: {
    name?: string;
    custom_id?: string;
    target_id?: string;
    options?: { name: string; value: unknown }[];
    resolved?: {
      messages?: Record<
        string,
        { content?: string; attachments?: DiscordAttachment[]; author?: { username?: string } }
      >;
      attachments?: Record<string, DiscordAttachment>;
    };
  };
  guild_id?: string;
  channel_id?: string;
  token?: string;
  message?: { components?: DiscordComponent[] };
  member?: { user?: { id?: string; username?: string; global_name?: string } };
  user?: { id?: string; username?: string; global_name?: string };
};

function ephemeral(content: string) {
  return NextResponse.json({
    type: CallbackType.CHANNEL_MESSAGE,
    data: { content, flags: MESSAGE_FLAGS.ephemeral },
  });
}

/**
 * Only named Discord users may publish.
 *
 * Command-level permissions in the Developer Portal can be changed by any guild admin,
 * and this endpoint speaks for every connected account — so the allowlist is enforced
 * here too, where a guild setting cannot reach it.
 */
function isAuthorised(interaction: Interaction): boolean {
  const allow = (process.env.STUDIO_DISCORD_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allow.length) return false;
  const userId = interaction.member?.user?.id ?? interaction.user?.id;
  return !!userId && allow.includes(userId);
}

function userLabel(interaction: Interaction): string | null {
  const user = interaction.member?.user ?? interaction.user;
  return user?.global_name ?? user?.username ?? null;
}

/** Flips one button's style in place, leaving disabled state and layout untouched. */
function toggleComponents(
  components: DiscordComponent[],
  customId: string
): { components: DiscordComponent[]; selected: Channel[] } {
  const next = components.map((row) => ({
    ...row,
    components: (row.components ?? []).map((button) =>
      button.custom_id === customId
        ? {
            ...button,
            style:
              button.style === BUTTON_STYLE.success
                ? BUTTON_STYLE.secondary
                : BUTTON_STYLE.success,
          }
        : button
    ),
  }));

  const selected = selectedFromComponents(next);

  // Keep the publish button's label and enabled state in step with the selection.
  for (const row of next) {
    for (const button of row.components ?? []) {
      if (button.custom_id?.startsWith('studio:send:')) {
        button.label = selected.length ? `Publish to ${selected.length}` : 'Publish';
        button.disabled = selected.length === 0;
      }
    }
  }

  return { components: next, selected };
}

/** Greys out every control once publishing starts, so nothing is double-submitted. */
function freezeComponents(components: DiscordComponent[]): DiscordComponent[] {
  return components.map((row) => ({
    ...row,
    components: (row.components ?? []).map((button) => ({ ...button, disabled: true })),
  }));
}

async function handleDistribute(interaction: Interaction) {
  const targetId = interaction.data?.target_id;
  const message = targetId ? interaction.data?.resolved?.messages?.[targetId] : undefined;

  if (!message) return ephemeral('Could not read that message.');

  const attachments = message.attachments ?? [];
  if (!message.content?.trim() && !attachments.length) {
    return ephemeral('That message has no text and no attachments — nothing to publish.');
  }

  const { draft, pending, warnings } = await composeDraft({
    guildId: interaction.guild_id ?? null,
    channelId: interaction.channel_id ?? null,
    messageId: targetId ?? null,
    authorLabel: userLabel(interaction),
    body: message.content ?? '',
    attachments,
    interactionToken: interaction.token ?? null,
  });

  return respondWithComposer(draft.id, pending, message.content ?? '', warnings);
}

async function handlePostCommand(interaction: Interaction) {
  const options = interaction.data?.options ?? [];
  const text = options.find((o) => o.name === 'text')?.value as string | undefined;

  const resolved = interaction.data?.resolved?.attachments ?? {};
  const attachments = options
    .filter((o) => o.name.startsWith('media'))
    .map((o) => resolved[String(o.value)])
    .filter(Boolean) as DiscordAttachment[];

  if (!text?.trim() && !attachments.length) {
    return ephemeral('Give me some text or a file to publish.');
  }

  const { draft, pending, warnings } = await composeDraft({
    guildId: interaction.guild_id ?? null,
    channelId: interaction.channel_id ?? null,
    messageId: null,
    authorLabel: userLabel(interaction),
    body: text ?? '',
    attachments,
    interactionToken: interaction.token ?? null,
  });

  return respondWithComposer(draft.id, pending, text ?? '', warnings);
}

function respondWithComposer(
  draftId: string,
  pending: PendingMedia[],
  body: string,
  warnings: string[]
) {
  const media = previewMedia(pending, draftId);
  const statuses = channelStatuses();
  const selected = defaultSelection(media, statuses);

  return NextResponse.json({
    type: CallbackType.CHANNEL_MESSAGE,
    data: {
      content: composerSummary(media, body, statuses, warnings),
      components: buildComposer(draftId, media, selected, statuses),
      flags: MESSAGE_FLAGS.ephemeral,
    },
  });
}

async function handleComponent(interaction: Interaction) {
  const customId = interaction.data?.custom_id ?? '';
  const [, action, draftId] = customId.split(':');
  const components = interaction.message?.components ?? [];

  if (action === 'tgl') {
    const { components: next } = toggleComponents(components, customId);
    return NextResponse.json({
      type: CallbackType.UPDATE_MESSAGE,
      data: { components: next },
    });
  }

  if (action === 'cancel') {
    await studioClient().from('drafts').update({ status: 'cancelled' }).eq('id', draftId);
    return NextResponse.json({
      type: CallbackType.UPDATE_MESSAGE,
      data: { content: '🗑️ Cancelled.', components: [] },
    });
  }

  if (action === 'send') {
    const selected = selectedFromComponents(components);
    if (!selected.length) {
      return NextResponse.json({
        type: CallbackType.UPDATE_MESSAGE,
        data: { content: 'Pick at least one channel first.', components },
      });
    }

    await studioClient()
      .from('drafts')
      .update({ interaction_token: interaction.token ?? null })
      .eq('id', draftId);

    await queueDraft(draftId, selected);

    // The queue is drained by the worker, not here — an upload must not run inside a
    // request Discord expects to answer in three seconds.
    void triggerWorker();

    return NextResponse.json({
      type: CallbackType.UPDATE_MESSAGE,
      data: {
        content: `🚀 Queued for **${selected.length}** channel${selected.length > 1 ? 's' : ''}: ${selected.join(', ')}.\n_Results will appear here as each one lands._`,
        components: freezeComponents(components),
      },
    });
  }

  return NextResponse.json({ type: CallbackType.DEFERRED_UPDATE });
}

/** Nudges the worker so a publish starts now rather than on the next cron tick. */
async function triggerWorker(): Promise<void> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? '').replace(/\/$/, '');
  const secret = process.env.STUDIO_WORKER_SECRET;
  if (!site || !secret) return;

  try {
    await fetch(`${site}/.netlify/functions/studio-worker-background`, {
      method: 'POST',
      headers: { 'x-studio-secret': secret },
      body: '{}',
    });
  } catch {
    // Best effort. The scheduled worker will pick the job up regardless.
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const valid = verifyDiscordSignature(
    rawBody,
    request.headers.get('x-signature-ed25519'),
    request.headers.get('x-signature-timestamp')
  );
  // Discord probes the endpoint with deliberately bad signatures and rejects it unless
  // they get a 401, so this must stay a hard failure.
  if (!valid) return new NextResponse('invalid request signature', { status: 401 });

  const interaction = JSON.parse(rawBody) as Interaction;

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: CallbackType.PONG });
  }

  if (!isAuthorised(interaction)) {
    return ephemeral('You are not authorised to publish through Studio.');
  }

  try {
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const name = interaction.data?.name;
      if (name === 'Distribute') return await handleDistribute(interaction);
      if (name === 'post') return await handlePostCommand(interaction);
      return ephemeral(`Unknown command: ${name}`);
    }

    if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
      return await handleComponent(interaction);
    }
  } catch (err) {
    console.error('[studio:interactions]', err);
    return ephemeral(`Something broke: ${err instanceof Error ? err.message : String(err)}`);
  }

  return NextResponse.json({ type: CallbackType.DEFERRED_UPDATE });
}
