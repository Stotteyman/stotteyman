import type { Metadata } from 'next';
import Link from 'next/link';
import SiteShell from '@/components/SiteShell';
import { upcomingEvents } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming live sessions, checkpoints, and community touchpoints connected to the Stotteyman brand.',
};

export default function EventsPage() {
  return (
    <SiteShell
      eyebrow="Events"
      title="Scheduled motion, public checkpoints, and places to tune in."
      intro="Even without a database yet, the site should make current activity obvious. This page keeps the ongoing schedule visible and easy to update until event data eventually moves into Supabase."
    >
      <div className="space-y-6">
        {upcomingEvents.map((event) => {
          const ctaClassName =
            'mt-6 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white transition-all duration-300 hover:border-neon-orange/60 hover:bg-neon-orange/10';

          return (
            <article key={event.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-[0.35em] text-neon-green/80">{event.window}</p>
                  <h2 className="mt-4 text-3xl font-light text-white">{event.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-gray-400">{event.description}</p>
                </div>

                {event.cta.external ? (
                  <a href={event.cta.href} target="_blank" rel="noreferrer" className={ctaClassName}>
                    {event.cta.label}
                  </a>
                ) : (
                  <Link href={event.cta.href} className={ctaClassName}>
                    {event.cta.label}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </SiteShell>
  );
}