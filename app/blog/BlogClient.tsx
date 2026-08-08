'use client';

import Link from 'next/link';

import SiteShell from '@/components/SiteShell';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Post = {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  youtube_id: string | null;
};

function Skeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-xl border border-line bg-surface" />
      ))}
    </div>
  );
}

export default function BlogClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('public_posts')
      .select('id, slug, title, date, excerpt, youtube_id')
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
            <Link
              key={post.id}
              href={`/blog/${post.slug}/`}
              className="block rounded-xl border border-line bg-surface p-6 transition-all duration-300 hover:border-accent-line hover:bg-surface-hover"
            >
              <p className="flex items-center gap-3 text-label uppercase text-accent">
                {fmt(post.date)}
                {post.youtube_id ? (
                  <span className="rounded-full border border-line px-2 py-0.5 text-fg-subtle">
                    ▶ Video
                  </span>
                ) : null}
              </p>
              <h2 className="mt-4 text-2xl font-light text-fg">{post.title}</h2>
              <p className="mt-4 text-sm leading-7 text-fg-subtle">{post.excerpt}</p>
              <span className="mt-5 inline-block text-label uppercase text-fg-subtle">
                Read →
              </span>
            </Link>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
