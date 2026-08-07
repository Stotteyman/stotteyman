import { NextResponse } from 'next/server';

import { OverlayAuthError, requireOverlayKey } from '@/lib/stream/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * YouTube live-chat poll, proxied.
 *
 * Kick and Twitch are consumed straight from the overlay page; YouTube cannot be,
 * for two reasons: it needs an API key that must never ship to a browser source,
 * and it has no socket — only a polled REST endpoint.
 *
 * Quota is the constraint that shapes everything here. `search.list` costs 100
 * units against a 10,000/day default, so the broadcast lookup runs at most once
 * every 10 minutes and the message poll (5 units) honours YouTube's own
 * `pollingIntervalMillis` rather than a number we picked.
 */

const LOOKUP_INTERVAL_MS = 600_000;

type PollState = {
  liveChatId?: string | null;
  pageToken?: string | null;
  lastLookup?: number;
  primed?: boolean;
};

async function youtubeApi<T>(endpoint: string, params: Record<string, string>, key: string) {
  const qs = new URLSearchParams({ ...params, key });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${qs}`, {
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`youtube ${endpoint} ${res.status}`);
  return (await res.json()) as T;
}

export async function GET(request: Request) {
  try {
    await requireOverlayKey(request);
  } catch (err) {
    if (err instanceof OverlayAuthError) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Settings unavailable' }, { status: 500 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // Not an error: YouTube is simply not wired up. Saying so explicitly beats an
    // empty array that looks like "nobody is talking".
    return NextResponse.json({ messages: [], pollMs: 60000, reason: 'YOUTUBE_API_KEY not set' });
  }

  const admin = createSupabaseServiceClient();
  const { data: source } = await admin
    .from('stream_chat_sources')
    .select('id, channel, external_id, poll_state')
    .eq('platform', 'youtube')
    .eq('enabled', true)
    .maybeSingle();

  const channelId = source?.external_id;
  if (!source || !channelId) {
    return NextResponse.json({
      messages: [],
      pollMs: 60000,
      reason: 'YouTube source needs the channel ID in external_id',
    });
  }

  const state = (source.poll_state ?? {}) as PollState;
  const saveState = (next: PollState) =>
    admin.from('stream_chat_sources').update({ poll_state: next }).eq('id', source.id);

  try {
    // 1. Find the active broadcast, at most once every LOOKUP_INTERVAL_MS.
    if (!state.liveChatId && Date.now() - (state.lastLookup ?? 0) > LOOKUP_INTERVAL_MS) {
      const search = await youtubeApi<{ items?: { id?: { videoId?: string } }[] }>(
        'search',
        { part: 'id', channelId, eventType: 'live', type: 'video', maxResults: '1' },
        apiKey
      );
      const videoId = search.items?.[0]?.id?.videoId;

      if (!videoId) {
        await saveState({ ...state, liveChatId: null, lastLookup: Date.now() });
        return NextResponse.json({ messages: [], pollMs: 60000, reason: 'not live' });
      }

      const video = await youtubeApi<{
        items?: { liveStreamingDetails?: { activeLiveChatId?: string } }[];
      }>('videos', { part: 'liveStreamingDetails', id: videoId }, apiKey);

      const liveChatId = video.items?.[0]?.liveStreamingDetails?.activeLiveChatId ?? null;
      Object.assign(state, {
        liveChatId,
        pageToken: null,
        lastLookup: Date.now(),
        // Skip the backlog on attach: an overlay replaying an hour of history is
        // worse than showing nothing.
        primed: false,
      });
      await saveState(state);
      if (!liveChatId) return NextResponse.json({ messages: [], pollMs: 60000, reason: 'no chat' });
    }

    if (!state.liveChatId) {
      return NextResponse.json({ messages: [], pollMs: 60000, reason: 'not live' });
    }

    // 2. Poll messages.
    const data = await youtubeApi<{
      items?: {
        id: string;
        snippet?: { displayMessage?: string };
        authorDetails?: {
          displayName?: string;
          isChatOwner?: boolean;
          isChatModerator?: boolean;
          isChatSponsor?: boolean;
        };
      }[];
      nextPageToken?: string;
      pollingIntervalMillis?: number;
    }>(
      'liveChat/messages',
      {
        liveChatId: state.liveChatId,
        part: 'snippet,authorDetails',
        maxResults: '200',
        ...(state.pageToken ? { pageToken: state.pageToken } : {}),
      },
      apiKey
    );

    const wasPrimed = state.primed === true;
    await saveState({ ...state, pageToken: data.nextPageToken ?? null, primed: true });

    const messages = wasPrimed
      ? (data.items ?? []).map((item) => ({
          id: item.id,
          author: item.authorDetails?.displayName ?? 'unknown',
          badges: [
            item.authorDetails?.isChatOwner && 'broadcaster',
            item.authorDetails?.isChatModerator && 'moderator',
            item.authorDetails?.isChatSponsor && 'member',
          ].filter(Boolean) as string[],
          text: item.snippet?.displayMessage ?? '',
        }))
      : [];

    return NextResponse.json({
      messages: messages.filter((m) => m.text),
      pollMs: Math.max(Number(data.pollingIntervalMillis) || 5000, 5000),
    });
  } catch (err) {
    // A 403 here is almost always exhausted quota. Back off hard rather than
    // hammering a key that is already spent for the day.
    await saveState({ ...state, liveChatId: null });
    return NextResponse.json({
      messages: [],
      pollMs: 120000,
      reason: err instanceof Error ? err.message : 'youtube error',
    });
  }
}
