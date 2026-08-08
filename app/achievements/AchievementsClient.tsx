'use client';

import Link from 'next/link';
import SiteShell from '@/components/SiteShell';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Achievement = {
  id: string;
  title: string;
  summary: string;
  impact: string;
};

type Project = {
  id: string;
  title: string;
  status: string;
  description: string;
  link: string;
  external: boolean;
};

export default function AchievementsClient() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('public_achievements').select('*').order('sort_order'),
      supabase.from('public_projects').select('*').order('sort_order'),
    ]).then(([a, p]) => {
      if (a.data) setAchievements(a.data as Achievement[]);
      if (p.data) setProjects(p.data as Project[]);
      setLoading(false);
    });
  }, []);

  return (
    <SiteShell
      eyebrow="Achievements"
      title="The work deserves a place where it is clearly named, described, and connected to results."
      intro="A durable record of what has been built and what those efforts are intended to create — to preserve contribution instead of letting it get flattened or forgotten."
    >
      {loading ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-xl border border-line bg-surface" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-xl border border-line bg-surface" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            {achievements.map((a) => (
              <article key={a.id} className="rounded-xl border border-line bg-surface p-7">
                <p className="text-label uppercase text-accent">Documented contribution</p>
                <h2 className="mt-4 text-3xl font-light text-fg">{a.title}</h2>
                <p className="mt-4 text-sm leading-7 text-fg-muted">{a.summary}</p>
                <div className="mt-5 rounded-lg border border-line bg-bg-raised p-4 text-sm leading-7 text-fg-subtle">
                  <span className="text-fg">Why it matters:</span> {a.impact}
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-lg border border-line bg-surface p-6 h-fit">
            <p className="text-label uppercase text-accent">Active surfaces</p>
            <div className="mt-5 space-y-4">
              {projects.map((p) => (
                <div key={p.id} className="rounded-lg border border-line bg-bg-raised p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-light text-fg">{p.title}</h3>
                    <span className="text-label uppercase text-ok">{p.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-fg-subtle">{p.description}</p>
                  {p.external ? (
                    <a href={p.link} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-label uppercase text-fg-subtle transition-colors hover:text-accent">
                      Visit →
                    </a>
                  ) : (
                    <Link href={p.link} className="mt-3 inline-block font-mono text-label uppercase text-fg-subtle transition-colors hover:text-accent">
                      Visit →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </SiteShell>
  );
}
