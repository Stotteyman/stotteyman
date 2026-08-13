import type { Metadata } from 'next';

import SiteShell from '@/components/SiteShell';

import BuildClient from './BuildClient';

export const metadata: Metadata = {
  title: 'Server builder',
  description:
    'Spec a multiplayer game server in five steps — game, player count, the systems behind it and who runs it. Get sizing back immediately and a price from me after.',
};

export default function BuildPage() {
  return (
    <SiteShell
      eyebrow="Server builder"
      title="Tell me what you want running, and I will tell you what it takes."
      intro="Five questions. You get hardware sizing straight away, and a build-and-run price from me once I have read it."
    >
      <BuildClient />

      <div className="mt-16 grid gap-5 border-t border-line pt-12 md:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-body font-medium text-fg">What you get back</h2>
          <ol className="mt-4 grid gap-3 text-body-sm text-fg-muted">
            <li>
              <span className="text-fg">1.</span> Sizing immediately — memory, cores and
              whether it needs a database.
            </li>
            <li>
              <span className="text-fg">2.</span> A written build scope from me, usually
              within a couple of days.
            </li>
            <li>
              <span className="text-fg">3.</span> Two numbers: what it costs to build, and
              what it costs per month to keep alive.
            </li>
          </ol>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-body font-medium text-fg">Why the sizing is not a guess</h2>
          <p className="mt-4 text-body-sm text-fg-muted">
            I run a persistent Arma Reforger server with an economy, banking and an in-game
            phone. The numbers here come from what those workloads actually consume with
            players on them, not from a vendor&rsquo;s empty-server minimum.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-line p-6">
          <h2 className="text-body font-medium text-fg">Straight answer</h2>
          <p className="mt-4 text-body-sm text-fg-subtle">
            If a managed host does what you need for less than I would charge to build it,
            I will say so. Most communities do not need a custom build — the ones that do
            usually know why already.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
