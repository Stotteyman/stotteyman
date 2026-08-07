'use client';

import { useEffect, useState } from 'react';

/**
 * "Now playing" widget for the song-request queue.
 *
 * Purely a display: it shows what the control panel says is playing and never
 * decides anything itself. Kept as its own browser source so it can be positioned
 * independently of the centred donation alerts.
 */

type NowPlaying = {
  id: string;
  video_id: string;
  title: string | null;
  requested_by: string | null;
  amount_cents: number;
};

export default function SongOverlayClient({ overlayKey }: { overlayKey: string }) {
  const [song, setSong] = useState<NowPlaying | null>(null);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await fetch(`/api/overlay/events/?key=${encodeURIComponent(overlayKey)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = (await res.json()) as { nowPlaying: NowPlaying | null; queuedSongs: number };
          if (!stopped) {
            setSong(data.nowPlaying);
            setQueued(data.queuedSongs ?? 0);
          }
        }
      } catch {
        /* keep the last known state on screen rather than blanking the widget */
      }
      if (!stopped) timer = setTimeout(tick, 5000);
    };

    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [overlayKey]);

  if (!song) return null;

  return (
    <div className="overlay-song">
      <div className="overlay-song__bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="overlay-song__label">
          NOW PLAYING{queued > 0 ? ` · ${queued} QUEUED` : ''}
        </div>
        <div className="overlay-song__title">{song.title ?? song.video_id}</div>
        {song.requested_by && <div className="overlay-song__by">requested by {song.requested_by}</div>}
      </div>
    </div>
  );
}
