/**
 * YouTube adapter — resumable upload against the Data API v3.
 *
 * Two constraints shape this file:
 *
 *  1. **Unaudited projects cannot publish.** Every video uploaded via `videos.insert`
 *     from a project that has not passed Google's API compliance audit is forced to
 *     private, regardless of what `privacyStatus` we send. The upload still works and the
 *     metadata still lands, so this is worth running now — the adapter reports the
 *     situation rather than pretending the video is live.
 *  2. **An upload costs ~1600 of the default 10,000 daily quota units**, so roughly six
 *     uploads a day before `quotaExceeded`. That error is retryable, but not today —
 *     quota resets at midnight Pacific.
 */
import type { ChannelAdapter, PublishContext, PublishResult } from '../types';
import { PublishError } from '../types';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const UPLOAD_URL =
  'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';

const TITLE_LIMIT = 100;
const DESCRIPTION_LIMIT = 5000;

/** Exchanges the stored refresh token for a short-lived access token. */
async function accessToken(): Promise<string> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new PublishError('YouTube OAuth credentials are not configured.', false);
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !body.access_token) {
    // invalid_grant means the refresh token was revoked or expired — re-consent is the
    // only fix, so retrying is pointless and hides the real problem.
    const permanent = body.error === 'invalid_grant';
    throw new PublishError(
      `YouTube auth failed: ${body.error_description ?? body.error ?? res.status}` +
        (permanent ? ' — re-run the OAuth consent to mint a new refresh token.' : ''),
      !permanent && res.status >= 500
    );
  }

  return body.access_token;
}

function deriveTitle(ctx: PublishContext): string {
  const raw =
    ctx.draft.title?.trim() ||
    ctx.caption.split('\n').find((l) => l.trim())?.trim() ||
    'Untitled';
  // YouTube rejects < and > outright.
  const clean = raw.replace(/[<>]/g, '');
  return clean.length > TITLE_LIMIT ? `${clean.slice(0, TITLE_LIMIT - 1)}…` : clean;
}

export const youtubeAdapter: ChannelAdapter = {
  channel: 'youtube',
  label: 'YouTube',
  acceptsVideo: true,
  acceptsImages: false,
  acceptsTextOnly: false,

  preflight() {
    if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
      return 'YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET are not set.';
    }
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
      return 'YOUTUBE_REFRESH_TOKEN is not set — run the OAuth consent once.';
    }
    return null;
  },

  validate(ctx) {
    const video = ctx.media.find((m) => m.kind === 'video');
    if (!video) return 'YouTube needs a video.';
    if (!video.bytes) return 'Video size is unknown, so a resumable upload cannot start.';
    return null;
  },

  async publish(ctx: PublishContext): Promise<PublishResult> {
    const video = ctx.media.find((m) => m.kind === 'video')!;
    const token = await accessToken();

    const privacy =
      (ctx.options.privacy as string | undefined) ??
      process.env.YOUTUBE_DEFAULT_PRIVACY ??
      'private';

    const metadata = {
      snippet: {
        title: deriveTitle(ctx),
        description: ctx.caption.slice(0, DESCRIPTION_LIMIT),
        tags: (ctx.draft.tags ?? []).slice(0, 30),
        categoryId: process.env.YOUTUBE_CATEGORY_ID ?? '22', // People & Blogs
      },
      status: {
        privacyStatus: privacy,
        selfDeclaredMadeForKids: false,
      },
    };

    // ── 1. Open the resumable session ────────────────────────────────────────
    const init = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': video.mime ?? 'video/mp4',
        'X-Upload-Content-Length': String(video.bytes),
      },
      body: JSON.stringify(metadata),
    });

    if (!init.ok) {
      const text = await init.text();
      const quota = text.includes('quotaExceeded');
      throw new PublishError(
        quota
          ? 'YouTube daily upload quota exhausted (~6 uploads/day). Resets at midnight Pacific.'
          : `YouTube rejected the upload session (${init.status}): ${text.slice(0, 300)}`,
        init.status >= 500
      );
    }

    const session = init.headers.get('location');
    if (!session) throw new PublishError('YouTube returned no resumable session URL.', true);

    // ── 2. Stream the bytes from storage straight through ────────────────────
    const source = await fetch(video.public_url);
    if (!source.ok || !source.body) {
      throw new PublishError(`Could not read the video from storage (${source.status}).`, true);
    }

    const upload = await fetch(session, {
      method: 'PUT',
      headers: {
        'Content-Type': video.mime ?? 'video/mp4',
        'Content-Length': String(video.bytes),
      },
      body: source.body,
      // Required by undici to send a stream body without buffering it first.
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    if (!upload.ok) {
      const text = await upload.text();
      throw new PublishError(
        `YouTube upload failed (${upload.status}): ${text.slice(0, 300)}`,
        upload.status >= 500 || upload.status === 408
      );
    }

    const result = (await upload.json()) as {
      id?: string;
      status?: { privacyStatus?: string; uploadStatus?: string; rejectionReason?: string };
    };

    if (!result.id) throw new PublishError('YouTube returned no video id.', true);

    if (result.status?.rejectionReason) {
      throw new PublishError(`YouTube rejected the video: ${result.status.rejectionReason}`, false);
    }

    const actualPrivacy = result.status?.privacyStatus;
    const forcedPrivate = privacy !== 'private' && actualPrivacy === 'private';

    ctx.log('uploaded to youtube', { videoId: result.id, privacy: actualPrivacy });

    return {
      remoteId: result.id,
      remoteUrl: `https://www.youtube.com/watch?v=${result.id}`,
      note: forcedPrivate
        ? 'Uploaded as PRIVATE — Google forces this until the project passes its API compliance audit. Flip it to public in YouTube Studio.'
        : undefined,
    };
  },
};
