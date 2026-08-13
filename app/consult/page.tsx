import type { Metadata } from 'next';

import SiteShell from '@/components/SiteShell';
import { loadCopy } from '@/lib/site-copy';

import ConsultClient from './ConsultClient';

export const metadata: Metadata = {
  title: 'Work with me',
  description:
    'Request a consultation, a meeting, or a collaboration. Game and server development, web platforms, Discord systems, and brand work.',
};

export default async function ConsultPage() {
  const copy = await loadCopy();
  return (
    <SiteShell
      eyebrow={copy('consult.eyebrow', 'Work with me')}
      title={copy('consult.title', 'Open to consultations, collaborations, and interesting problems.')}
      intro={copy('consult.intro', 'Tell me what you are building and where it is stuck. I read every request personally.')}
    >
      {/* The wizard owns its own two-column rail, so it gets the full width here —
          nesting it inside another sidebar layout crushed the step panel. */}
      <ConsultClient />

      <div className="mt-16 border-t border-line pt-12">
        <aside className="grid gap-5 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-sm font-semibold text-fg">What happens next</h2>
            <ol className="mt-4 grid gap-3 text-sm leading-relaxed text-fg-muted">
              <li>
                <span className="text-fg">1.</span> I read it and reply — usually within a
                couple of days.
              </li>
              <li>
                <span className="text-fg">2.</span> If it looks like a fit, we get on a
                call and work out the shape of it.
              </li>
              <li>
                <span className="text-fg">3.</span> You get a written scope and a price
                before anyone commits to anything.
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-sm font-semibold text-fg">Good fits</h2>
            <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-fg-muted">
              <li>Multiplayer game servers and custom gameplay systems</li>
              <li>Web platforms that need real auth, billing, and admin tooling</li>
              <li>Communities that have outgrown manual Discord management</li>
              <li>Projects where you want a partner, not just a contractor</li>
            </ul>
          </div>

          <div className="rounded-lg border border-dashed border-line p-6">
            <h2 className="text-sm font-semibold text-fg">Straight answer</h2>
            <p className="mt-3 text-sm leading-relaxed text-fg-subtle">
              {copy(
                'consult.straight_answer',
                'If it is not something I can do well, I will tell you that rather than take the work.'
              )}
            </p>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
