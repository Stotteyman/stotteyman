import 'server-only';

/**
 * YouTube link handling for song requests.
 *
 * Titles come from oEmbed, which needs no API key and no quota — the Data API is
 * reserved for live-chat polling, where every call is charged against a 10,000/day
 * budget. oEmbed also fails cleanly for private, deleted and region-blocked videos,
 * which is exactly the validation a request queue needs: if we cannot read the
 * title, the viewer cannot queue the song.
 */

/** Accepts watch, youtu.be, shorts, embed and live URLs, plus a bare id. */
export function parseYouTubeId(input: string): string | null {
  const raw = (input || '').trim();
  if (!raw) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (!['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'].includes(host)) {
    return null;
  }

  const candidate =
    host === 'youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v') ??
        url.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/)?.[1] ??
        '';

  const id = candidate.split('/')[0];
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export type YouTubeVideo = {
  videoId: string;
  title: string;
  author: string | null;
  durationSeconds: number | null;
};

/**
 * Looks up a video's title. Returns null when the video is not publicly playable,
 * which the caller must treat as a rejected request rather than a soft warning.
 */
export async function lookupYouTubeVideo(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`
      )}&format=json`,
      { signal: AbortSignal.timeout(8000), cache: 'no-store' }
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { title?: string; author_name?: string };
    if (!body.title) return null;

    return {
      videoId,
      title: body.title,
      author: body.author_name ?? null,
      // oEmbed does not carry duration. Length is enforced at play time instead of
      // rejecting the request here, since the alternative costs Data API quota on
      // every submission including the spam.
      durationSeconds: null,
    };
  } catch {
    return null;
  }
}
