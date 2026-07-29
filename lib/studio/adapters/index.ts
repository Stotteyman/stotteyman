/**
 * Adapter registry.
 *
 * A channel that is not listed here cannot be queued, published, or named in an API
 * request — the registry is the whitelist, exactly as `lib/hq/collections.ts` is for
 * content tables.
 */
import type { Channel, ChannelAdapter } from '../types';
import { blogAdapter } from './blog';
import { discordAdapter } from './discord';
import { facebookAdapter } from './facebook';
import { instagramAdapter } from './instagram';
import { youtubeAdapter } from './youtube';

export const ADAPTERS: ChannelAdapter[] = [
  blogAdapter,
  discordAdapter,
  instagramAdapter,
  facebookAdapter,
  youtubeAdapter,
];

export function getAdapter(channel: Channel | string): ChannelAdapter | undefined {
  return ADAPTERS.find((a) => a.channel === channel);
}

export type ChannelStatus = {
  channel: Channel;
  label: string;
  ready: boolean;
  /** Why it is not ready, when it is not. */
  reason: string | null;
  acceptsVideo: boolean;
  acceptsImages: boolean;
  acceptsTextOnly: boolean;
};

/** Configuration state of every channel — drives which buttons appear in Discord. */
export function channelStatuses(): ChannelStatus[] {
  return ADAPTERS.map((adapter) => {
    const reason = adapter.preflight();
    return {
      channel: adapter.channel,
      label: adapter.label,
      ready: reason === null,
      reason,
      acceptsVideo: adapter.acceptsVideo,
      acceptsImages: adapter.acceptsImages,
      acceptsTextOnly: adapter.acceptsTextOnly,
    };
  });
}

/**
 * Whether a channel can handle this particular draft's media shape.
 *
 * Keeps Instagram off a text-only note and YouTube off a photo, rather than queueing
 * work that is certain to fail validation.
 */
export function suitsDraft(
  status: ChannelStatus,
  counts: { images: number; videos: number }
): boolean {
  if (counts.videos > 0 && status.acceptsVideo) return true;
  if (counts.images > 0 && status.acceptsImages) return true;
  if (counts.images === 0 && counts.videos === 0) return status.acceptsTextOnly;
  return false;
}
