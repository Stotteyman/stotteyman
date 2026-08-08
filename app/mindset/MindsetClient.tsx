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
      .from('public_mindset_principles')
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
            <div key={i} className="h-48 animate-pulse rounded-xl border border-line bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {principles.map((p) => (
            <article key={p.id} className="rounded-xl border border-line bg-surface p-7">
              <p className="text-label uppercase text-accent">Principle</p>
              <h2 className="mt-4 text-3xl font-light text-fg">{p.title}</h2>
              <p className="mt-4 text-sm leading-7 text-fg-subtle">{p.body}</p>
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
