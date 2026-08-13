import type { MetadataRoute } from 'next';

import { createSupabaseAnonClient } from '@/lib/supabase/client';

/**
 * Sitemap.
 *
 * Two things were wrong with the previous version. It omitted `/donate`, `/company` and
 * **every blog post**, so the only pages with real editorial content were invisible to
 * crawlers. And every entry carried `lastModified: new Date()` under `force-static`,
 * which froze all twelve URLs to the build timestamp and told search engines the whole
 * site changed at the same instant — a signal that is worse than sending none.
 *
 * Posts now come from the database with their own dates, so this revalidates instead of
 * being pinned at build.
 */
export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://stotteyman.com';

type StaticRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

const ROUTES: StaticRoute[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/work', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.95, changeFrequency: 'monthly' },
  { path: '/consult', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/build', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/company', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/mindset', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/achievements', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/follow', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/events', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/stream', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/donate', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; date: string; updated_at?: string | null }[] = [];

  // A sitemap that throws takes the whole route down; an incomplete one is recoverable.
  try {
    const supabase = createSupabaseAnonClient();
    const { data } = await supabase
      .from('public_posts')
      .select('slug, date')
      .order('date', { ascending: false });
    posts = (data ?? []) as typeof posts;
  } catch {
    posts = [];
  }

  const newestPost = posts[0]?.date ? new Date(posts[0].date) : undefined;

  return [
    ...ROUTES.map((r) => ({
      url: `${BASE}${r.path}`,
      priority: r.priority,
      changeFrequency: r.changeFrequency,
      // Only the index of the writing section genuinely moves with the posts.
      ...(r.path === '/blog' && newestPost ? { lastModified: newestPost } : {}),
    })),
    ...posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
