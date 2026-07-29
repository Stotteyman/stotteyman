/**
 * Stotteyman Studio — shared contracts.
 *
 * Deliberately free of Next.js and `server-only` imports: this module is pulled in by
 * both the Next route handlers and the Netlify background worker, and the latter is
 * bundled outside the Next build.
 */

export const CHANNELS = [
  'blog',
  'discord',
  'facebook',
  'instagram',
  'youtube',
  'tiktok',
  'x',
  'linkedin',
] as const;

export type Channel = (typeof CHANNELS)[number];

export function isChannel(value: string): value is Channel {
  return (CHANNELS as readonly string[]).includes(value);
}

export type StudioDraft = {
  id: string;
  source: 'discord' | 'hq' | 'api';
  author_label: string | null;
  discord_guild_id: string | null;
  discord_channel_id: string | null;
  discord_message_id: string | null;
  title: string | null;
  body: string;
  tags: string[];
  link_url: string | null;
  status: string;
  scheduled_for: string | null;
};

export type StudioMedia = {
  id: string;
  draft_id: string;
  kind: 'image' | 'video';
  storage_path: string;
  public_url: string;
  mime: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  sort_order: number;
};

export type StudioDistribution = {
  id: string;
  draft_id: string;
  channel: Channel;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'skipped' | 'cancelled';
  caption: string | null;
  options: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
  remote_id: string | null;
  remote_url: string | null;
  error: string | null;
};

export type PublishContext = {
  draft: StudioDraft;
  media: StudioMedia[];
  /** Per-channel caption override, already resolved — falls back to the draft body. */
  caption: string;
  options: Record<string, unknown>;
  log: (message: string, detail?: Record<string, unknown>) => void;
};

export type PublishResult = {
  remoteId?: string | null;
  remoteUrl?: string | null;
  /** Surfaced to the user — e.g. "uploaded as private pending audit". */
  note?: string;
};

/**
 * Publishing failure with an explicit retry decision.
 *
 * The distinction is the whole point: a malformed caption rejected with 400 will be
 * rejected identically on every retry, so burning three attempts on it only delays the
 * error reaching the user. A 429 or a 502 is worth retrying.
 */
export class PublishError extends Error {
  constructor(
    message: string,
    public retryable: boolean = false,
    public detail?: unknown
  ) {
    super(message);
    this.name = 'PublishError';
  }
}

export type ChannelAdapter = {
  channel: Channel;
  label: string;
  /** True when this channel handles video. Used to skip nonsensical fan-out. */
  acceptsVideo: boolean;
  acceptsImages: boolean;
  /** Whether the channel can post with no media at all. */
  acceptsTextOnly: boolean;

  /**
   * Configuration check. Returns a human-readable reason when the channel cannot run
   * at all (missing token, unset page id), or null when it is ready. Checked before
   * anything is queued so the user is told up front rather than after a failure.
   */
  preflight: () => string | null;

  /** Content check. A returned string fails the distribution without retrying. */
  validate?: (ctx: PublishContext) => string | null;

  publish: (ctx: PublishContext) => Promise<PublishResult>;
};

/** Exponential backoff with a floor of 30s and a ceiling of 15 minutes. */
export function backoffSeconds(attempt: number): number {
  return Math.min(30 * 2 ** Math.max(0, attempt - 1), 900);
}
