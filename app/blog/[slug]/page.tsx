import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import SiteShell from '@/components/SiteShell';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

export const revalidate = 300;

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  tags: string[];
  cover_url: string | null;
  date: string;
};

async function getPost(slug: string): Promise<Post | null> {
  const supabase = createSupabaseAnonClient();
  const { data } = await supabase
    .from('public_posts')
    .select('slug, title, excerpt, body, tags, cover_url, date')
    .eq('slug', slug)
    .maybeSingle();
  return (data as unknown as Post) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.date,
    },
  };
}

/**
 * Minimal markdown rendering: paragraphs, headings, and lists.
 *
 * Deliberately not `dangerouslySetInnerHTML` — post bodies are written in HQ, and even
 * trusted input should not get a path to inject script into every reader's page. This
 * splits to plain React nodes instead, so nothing in a post can execute.
 */
function renderBody(body: string) {
  const blocks = body.split(/\n{2,}/).filter((b) => b.trim());

  return blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="mt-10 text-xl font-medium text-white">
          {trimmed.slice(4)}
        </h3>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-12 text-2xl font-medium text-white">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (/^[-*]\s/m.test(trimmed) && trimmed.split('\n').every((l) => /^[-*]\s/.test(l.trim()))) {
      return (
        <ul key={i} className="mt-6 grid gap-2 pl-5">
          {trimmed.split('\n').map((line, j) => (
            <li key={j} className="list-disc text-base leading-8 text-gray-300">
              {line.trim().replace(/^[-*]\s/, '')}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-6 text-base leading-8 text-gray-300">
        {trimmed}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const date = new Date(post.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SiteShell eyebrow={date} title={post.title} intro={post.excerpt ?? ''}>
      <article className="max-w-3xl">
        {post.tags.length ? (
          <ul className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}

        {post.body ? (
          renderBody(post.body)
        ) : (
          <p className="mt-6 text-base leading-8 text-gray-400">
            This entry has no body yet.
          </p>
        )}

        <Link
          href="/blog/"
          className="mt-14 inline-block text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white"
        >
          ← All writing
        </Link>
      </article>
    </SiteShell>
  );
}
