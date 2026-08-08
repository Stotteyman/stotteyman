import { ImageResponse } from 'next/og';

import { OG_SIZE, ogCard } from '@/lib/og-card';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

/** Per-post share card, so a shared link shows the post's own title. */

export const alt = 'Stotteyman — writing';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function PostOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createSupabaseAnonClient();
  const { data } = await supabase
    .from('public_posts')
    .select('title, date')
    .eq('slug', slug)
    .maybeSingle();

  const post = data as { title?: string; date?: string } | null;

  const date = post?.date
    ? new Date(post.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : undefined;

  return new ImageResponse(
    ogCard({
      eyebrow: 'Writing',
      // A missing post still has to produce a valid image — this route renders before
      // the page decides to 404, so it must never throw.
      headline: post?.title ?? 'Stotteyman',
      footerLeft: 'stotteyman.com',
      footerRight: date,
    }),
    size
  );
}
