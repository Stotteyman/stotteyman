import type { Metadata } from 'next';

import SiteShell from '@/components/SiteShell';
import { amaPriceCents } from '@/lib/ama/store';
import { loadCopy } from '@/lib/site-copy';
import { stripeConfigured } from '@/lib/stream/stripe';

import AskForm from './AskForm';

export const metadata: Metadata = {
  title: 'Ask me anything',
  description:
    'Ask me any question you like for $5. Answered personally — usually within five to ten minutes during business hours.',
};

// The price and whether the card rail is live both come from env, so this must not be
// baked into a static prerender at build time.
export const dynamic = 'force-dynamic';

export default async function AmaPage() {
  const copy = await loadCopy();
  const priceCents = amaPriceCents();
  const price = `$${(priceCents / 100).toFixed(2)}`;

  return (
    <SiteShell
      eyebrow={copy('ama.eyebrow', 'Ask me anything')}
      title={copy('ama.title', 'Ask any question you like. ' + price + ' a pop.')}
      intro={copy(
        'ama.intro',
        'No topic list, no qualifying, no discovery call. Ask the question, pay ' +
          price +
          ', and I answer it myself — usually in five to ten minutes, and inside the hour during business hours.'
      )}
    >
      <AskForm priceCents={priceCents} cardEnabled={stripeConfigured()} />

      <div className="mt-16 border-t border-line pt-12">
        <aside className="grid gap-5 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-sm font-semibold text-fg">How fast, honestly</h2>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {copy(
                'ama.speed',
                'Most questions get answered in five to ten minutes. During business hours it should never be more than an hour. Ask at three in the morning and it waits until I am up — the answer still comes.'
              )}
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-sm font-semibold text-fg">What you can ask</h2>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              Anything. Game servers and modding, running a business, web platforms,
              Stripe and payments, streaming, Discord communities, what I would do in
              your situation. If I do not know, I say so and you get your {price} back.
            </p>
          </div>

          <div className="rounded-lg border border-dashed border-line p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-semibold text-fg">Instant answers</h2>
              <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-fg-faint">
                Coming soon
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-fg-subtle">
              Soon you will be able to tap once and get an immediate answer, read out in my
              voice, while the real one is being written. Not switched on yet — I would
              rather ship it when it is good than have it confidently tell you something
              wrong. For now every answer is written by me.
            </p>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
