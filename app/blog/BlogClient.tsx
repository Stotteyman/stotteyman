'use client';

import SiteShell from '@/components/SiteShell';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Post = {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

function Skeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-[1.75rem] border border-white/10 bg-white/5" />
      ))}
    </div>
  );
}

export default function BlogClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, slug, title, date, excerpt')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setPosts(data as Post[]);
        setLoading(false);
      });
  }, []);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SiteShell
      eyebrow="Writing"
      title="Notes that explain the work instead of hiding it."
      intro="Short-form writing that adds context, preserves intent, and makes the direction of the work easier to understand."
    >
      {loading ? (
        <Skeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-neon-orange/60 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-neon-cyan/80">{fmt(post.date)}</p>
              <h2 className="mt-4 text-2xl font-light text-white">{post.title}</h2>
              <p className="mt-4 text-sm leading-7 text-gray-400">{post.excerpt}</p>
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
