import type { Metadata } from 'next';

import SiteShell from '@/components/SiteShell';

import ConsultClient from './ConsultClient';

export const metadata: Metadata = {
  title: 'Work with me',
  description:
    'Request a consultation, a meeting, or a collaboration. Game and server development, web platforms, Discord systems, and brand work.',
};

export default function ConsultPage() {
  return (
    <SiteShell
      eyebrow="Work with me"
      title="Open to consultations, collaborations, and interesting problems."
      intro="Tell me what you are building and where it is stuck. I read every request personally — there is no form-filling gauntlet and no sales sequence on the other side of this."
    >
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ConsultClient />

        <aside className="grid gap-5 self-start">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-white">What happens next</h2>
            <ol className="mt-4 grid gap-3 text-sm leading-relaxed text-white/55">
              <li>
                <span className="text-white/80">1.</span> I read it and reply — usually within a
                couple of days.
              </li>
              <li>
                <span className="text-white/80">2.</span> If it looks like a fit, we get on a
                call and work out the shape of it.
              </li>
              <li>
                <span className="text-white/80">3.</span> You get a written scope and a price
                before anyone commits to anything.
              </li>
            </ol>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-white">Good fits</h2>
            <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-white/55">
              <li>Multiplayer game servers and custom gameplay systems</li>
              <li>Web platforms that need real auth, billing, and admin tooling</li>
              <li>Communities that have outgrown manual Discord management</li>
              <li>Projects where you want a partner, not just a contractor</li>
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-dashed border-white/10 p-6">
            <h2 className="text-sm font-semibold text-white">Straight answer</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              If it is not something I can do well, I will tell you that rather than take the
              work. A bad fit costs us both more than a short email does.
            </p>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
