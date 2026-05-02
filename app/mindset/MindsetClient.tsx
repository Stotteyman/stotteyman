'use client';

import SiteShell from '@/components/SiteShell';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Principle = {
  id: string;
  title: string;
  body: string;
};

export default function MindsetClient() {
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('mindset_principles')
      .select('id, title, body')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setPrinciples(data as Principle[]);
        setLoading(false);
      });
  }, []);

  return (
    <SiteShell
      eyebrow="Mindset"
      title="The work starts with how I think about ownership, proof, and momentum."
      intro="The principles behind this site — not just a portfolio of outcomes, but a record of intent, consistency, and the standards I hold my own work to."
    >
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-[1.75rem] border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {principles.map((p) => (
            <article key={p.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
              <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">Principle</p>
              <h2 className="mt-4 text-3xl font-light text-white">{p.title}</h2>
              <p className="mt-4 text-sm leading-7 text-gray-400">{p.body}</p>
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
