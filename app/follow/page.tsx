import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import { socialLinks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Follow',
  description: 'Social platforms, community links, and the fastest ways to keep up with Stotteyman.',
};

export default function FollowPage() {
  return (
    <SiteShell
      eyebrow="Follow"
      title="Everything worth following, in one place."
      intro="This page exists so people do not have to hunt for the right platform. If someone wants updates, stream alerts, code, or community access, the right link is already here."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {socialLinks.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/60 hover:bg-white/10"
          >
            <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">{link.platform}</p>
            <p className="mt-4 text-sm leading-7 text-gray-400">{link.description}</p>
            <span className="mt-6 inline-flex text-sm uppercase tracking-[0.2em] text-white">Open link</span>
          </a>
        ))}
      </div>
    </SiteShell>
  );
}