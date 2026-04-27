import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import { contactMethods, siteConfig, stackReadiness } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Direct contact methods and the fastest ways to reach Gary Lee McCullouch Jr. through the Stotteyman portfolio.',
};

export default function ContactPage() {
  return (
    <SiteShell
      eyebrow="Contact"
      title="Reach out directly without friction."
      intro="This site does not need a database yet to make contact easy. For now, the contact surface stays simple, direct, and deploy-friendly. When Supabase is added later, these same routes can support stored inquiries and richer updates."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="space-y-4">
          {contactMethods.map((method) => (
            <a
              key={method.label}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel={method.href.startsWith('http') ? 'noreferrer' : undefined}
              className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-6 py-5 transition-all duration-300 hover:border-neon-cyan/60 hover:bg-white/10"
            >
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">{method.label}</p>
                <p className="mt-3 text-base text-white">{method.value}</p>
              </div>
              <span className="text-sm uppercase tracking-[0.2em] text-gray-400">Open</span>
            </a>
          ))}
        </section>

        <aside className="card-neon">
          <p className="text-sm uppercase tracking-[0.35em] text-neon-pink/80">Current setup</p>
          <h2 className="mt-4 text-3xl font-light text-white">Static today, ready for Supabase later.</h2>
          <p className="mt-4 text-sm leading-7 text-gray-400">
            The site is intentionally simple right now: hosting information, direct links, and clear public routes. When you are ready, contact messages, events, stream notices, and writing entries can move into Supabase without redesigning the front end.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-gray-400">
            {stackReadiness.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-gray-400">
            <span className="text-white">Primary email:</span> {siteConfig.email}
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}