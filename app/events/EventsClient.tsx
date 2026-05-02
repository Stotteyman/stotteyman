'use client';

import Link from 'next/link';
import SiteShell from '@/components/SiteShell';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Event = {
  id: string;
  title: string;
  time_window: string;
  description: string;
  cta_label: string;
  cta_href: string;
  cta_external: boolean;
};

const ctaClass =
  'mt-6 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white transition-all duration-300 hover:border-neon-orange/60 hover:bg-neon-orange/10';

export default function EventsClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setEvents(data as Event[]);
        setLoading(false);
      });
  }, []);

  return (
    <SiteShell
      eyebrow="Events"
      title="Scheduled motion, public checkpoints, and places to tune in."
      intro="The ongoing schedule — live sessions, milestone updates, and community touchpoints — kept visible and easy to follow."
    >
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-[1.75rem] border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <article key={event.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-[0.35em] text-neon-green/80">{event.time_window}</p>
                  <h2 className="mt-4 text-3xl font-light text-white">{event.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-gray-400">{event.description}</p>
                </div>

                {event.cta_external ? (
                  <a href={event.cta_href} target="_blank" rel="noreferrer" className={ctaClass}>
                    {event.cta_label}
                  </a>
                ) : (
                  <Link href={event.cta_href} className={ctaClass}>
                    {event.cta_label}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
