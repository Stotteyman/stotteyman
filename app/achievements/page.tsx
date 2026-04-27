import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import { achievements, activeProjects } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Documented wins, visible contributions, and the projects that deserve clear credit.',
};

export default function AchievementsPage() {
  return (
    <SiteShell
      eyebrow="Achievements"
      title="The work deserves a place where it is clearly named, described, and connected to results."
      intro="This page is a durable record of what has been built and what those efforts are intended to create. It is designed to preserve contribution instead of letting it get flattened or forgotten."
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          {achievements.map((achievement) => (
            <article key={achievement.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
              <p className="text-sm uppercase tracking-[0.35em] text-neon-cyan/80">Documented contribution</p>
              <h2 className="mt-4 text-3xl font-light text-white">{achievement.title}</h2>
              <p className="mt-4 text-sm leading-7 text-gray-300">{achievement.summary}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-gray-400">
                <span className="text-white">Why it matters:</span> {achievement.impact}
              </div>
            </article>
          ))}
        </section>

        <aside className="card-neon h-fit">
          <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">Active surfaces</p>
          <div className="mt-5 space-y-4">
            {activeProjects.map((project) => (
              <div key={project.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-light text-white">{project.title}</h3>
                  <span className="text-xs uppercase tracking-[0.3em] text-neon-green/80">{project.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-400">{project.description}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}