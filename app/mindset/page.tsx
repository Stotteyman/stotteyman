import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import { mindsetPrinciples } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Mindset',
  description: 'The principles, posture, and operating style behind the Stotteyman portfolio and public work.',
};

export default function MindsetPage() {
  return (
    <SiteShell
      eyebrow="Mindset"
      title="The work starts with how I think about ownership, proof, and momentum."
      intro="This page explains the mindset behind the site. It is not just a portfolio of outcomes. It is also a record of intent, consistency, and the standards I expect from my own work."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {mindsetPrinciples.map((principle) => (
          <article key={principle.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
            <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">Principle</p>
            <h2 className="mt-4 text-3xl font-light text-white">{principle.title}</h2>
            <p className="mt-4 text-sm leading-7 text-gray-400">{principle.body}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}