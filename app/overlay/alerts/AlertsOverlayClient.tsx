'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Donation alert browser source.
 *
 * One alert on screen at a time, shown for the configured duration, then
 * acknowledged. The acknowledgement happens AFTER the animation rather than on
 * receipt, so a browser source that reloads mid-alert replays it instead of
 * silently swallowing a real donation.
 */

type Alert = {
  id: string;
  kind: 'donation' | 'song' | 'test' | 'custom';
  donor_name: string | null;
  amount_cents: number | null;
  currency: string;
  message: string | null;
  speak: boolean;
};

type EventsPayload = {
  alerts: Alert[];
  alertsDurationMs: number;
  alertsSoundUrl: string | null;
  alertsReadMessage: boolean;
};

function formatAmount(cents: number | null, currency: string): string | null {
  if (cents == null || cents <= 0) return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
      maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export default function AlertsOverlayClient({ overlayKey }: { overlayKey: string }) {
  const [current, setCurrent] = useState<Alert | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);

  // A ref guard, not state: two poll ticks can overlap and both try to start an
  // alert, which would cut the first one short.
  const busy = useRef(false);
  const settingsRef = useRef<{ durationMs: number; soundUrl: string | null }>({
    durationMs: 7000,
    soundUrl: null,
  });

  const acknowledge = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/overlay/events/?key=${encodeURIComponent(overlayKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId: id }),
        });
      } catch {
        /* it stays queued and replays; better than losing it */
      }
    },
    [overlayKey]
  );

  /** Plays the alert sound, then speaks the message. Never rejects. */
  const playAudio = useCallback(
    async (alert: Alert) => {
      const { soundUrl } = settingsRef.current;

      if (soundUrl) {
        try {
          const sound = new Audio(soundUrl);
          await sound.play();
          await new Promise<void>((resolve) => {
            sound.onended = () => resolve();
            sound.onerror = () => resolve();
            // Never let a stuck sound hold the alert open.
            setTimeout(resolve, 4000);
          });
        } catch {
          /* autoplay refused or the file is missing — show the alert regardless */
        }
      }

      if (!alert.speak || !alert.message) return;
      try {
        const res = await fetch(`/api/overlay/tts/?key=${encodeURIComponent(overlayKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'alert', text: alert.message }),
        });
        if (res.status !== 200) return;
        const url = URL.createObjectURL(await res.blob());
        const voice = new Audio(url);
        await voice.play();
        await new Promise<void>((resolve) => {
          voice.onended = () => resolve();
          voice.onerror = () => resolve();
        });
        URL.revokeObjectURL(url);
      } catch {
        /* speaking is a bonus; the visual alert is the guarantee */
      }
    },
    [overlayKey]
  );

  const run = useCallback(
    async (alert: Alert) => {
      busy.current = true;
      setLeaving(false);
      setCurrent(alert);

      // The visual sits for at least the configured duration, and longer if the
      // audio runs past it — an alert that vanishes mid-sentence looks broken.
      const minimum = new Promise((r) => setTimeout(r, settingsRef.current.durationMs));
      await Promise.all([minimum, playAudio(alert)]);

      setLeaving(true);
      await new Promise((r) => setTimeout(r, 320)); // matches the CSS exit animation
      setCurrent(null);
      await acknowledge(alert.id);
      busy.current = false;
    },
    [acknowledge, playAudio]
  );

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await fetch(`/api/overlay/events/?key=${encodeURIComponent(overlayKey)}`, {
          cache: 'no-store',
        });
        if (res.status === 401) {
          if (!stopped) setFatal('Overlay key rejected');
          return;
        }
        if (res.ok) {
          const data = (await res.json()) as EventsPayload;
          settingsRef.current = {
            durationMs: data.alertsDurationMs ?? 7000,
            soundUrl: data.alertsSoundUrl,
          };
          if (!busy.current && data.alerts.length) void run(data.alerts[0]);
        }
      } catch {
        /* transient — try again on the next tick */
      }
      if (!stopped) timer = setTimeout(tick, 3000);
    };

    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [overlayKey, run]);

  if (fatal) {
    return (
      <div style={{ padding: 16, fontFamily: 'monospace', color: '#ff5555', fontSize: 14 }}>
        {fatal}
      </div>
    );
  }

  if (!current) return null;

  const amount = formatAmount(current.amount_cents, current.currency);
  const name = current.donor_name?.trim() || 'Someone';

  return (
    <div className="overlay-alert">
      <div className={`overlay-alert__card${leaving ? ' overlay-alert--out' : ''}`}>
        <div className="overlay-alert__headline">
          <span className="overlay-alert__name">{name}</span>
          {current.kind === 'song' ? ' requested a song' : ' donated'}
          {amount && <span className="overlay-alert__amount">{amount}</span>}
        </div>
        {current.message && <div className="overlay-alert__message">{current.message}</div>}
      </div>
    </div>
  );
}
