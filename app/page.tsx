import Link from 'next/link';
import SiteShell from '@/components/SiteShell';
import {
  activeProjects,
  homepageSections,
  siteConfig,
  stackReadiness,
  writingEntries,
} from '@/lib/site-content';

export default function HomePage() {
  return (
    <SiteShell
      eyebrow="Interactive portfolio"
      title="A public record of the work, the mindset, and what is next."
      intro="This site is built to make the work easy to follow. It documents who I am, what I am building, the achievements that deserve visibility, and the channels where people can keep up with everything in motion."
    >
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_80px_rgba(255,140,0,0.08)]">
            <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">{siteConfig.title}</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-white md:text-5xl">
              Visibility matters when the work has been overlooked, minimized, or left undocumented.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-300">
              Instead of relying on memory or other people to tell the story correctly, this portfolio keeps the proof visible: shipped pages, active links, written context, livestreams, and a direct line of contact.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/achievements" className="btn-neon">
                View achievements
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan"
              >
                Contact me
              </Link>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {homepageSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-[1.5rem] border border-white/10 bg-[#050505] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon-orange/60 hover:bg-white/5"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-neon-cyan/80">{section.eyebrow}</p>
                <h3 className="mt-4 text-2xl font-light text-white">{section.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">{section.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card-neon">
            <p className="text-sm uppercase tracking-[0.35em] text-neon-green/80">Current focus</p>
            <div className="mt-5 space-y-4">
              {activeProjects.map((project) => (
                <div key={project.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-light text-white">{project.title}</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-neon-orange/80">{project.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{project.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-neon">
            <p className="text-sm uppercase tracking-[0.35em] text-neon-pink/80">Latest writing</p>
            <div className="mt-5 space-y-4">
              {writingEntries.map((entry) => (
                <div key={entry.slug} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{entry.date}</p>
                  <h3 className="mt-2 text-lg font-light text-white">{entry.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{entry.excerpt}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-neon">
            <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">Supabase-ready later</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-gray-400">
              {stackReadiness.map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
