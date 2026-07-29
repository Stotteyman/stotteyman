/**
 * Blog adapter — writes a row into `stotteyman.posts`, the table that already drives
 * /blog and the public_posts view. Publishing to the website is therefore a database
 * insert, not an HTTP call, and cannot fail for network reasons.
 */
import { studioClient } from '../supabase';
import type { ChannelAdapter, PublishContext, PublishResult, StudioMedia } from '../types';
import { PublishError } from '../types';

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60)
      .replace(/^-|-$/g, '') || 'post'
  );
}

function deriveTitle(ctx: PublishContext): string {
  if (ctx.draft.title?.trim()) return ctx.draft.title.trim();
  const firstLine = ctx.caption.split('\n').find((l) => l.trim().length > 0)?.trim() ?? '';
  if (!firstLine) return 'Untitled';
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}…` : firstLine;
}

/** Appends anything not used as the cover, so no uploaded media silently vanishes. */
function bodyWithMedia(ctx: PublishContext, cover: StudioMedia | undefined): string {
  const extras = ctx.media.filter((m) => m.id !== cover?.id);
  if (!extras.length) return ctx.caption;

  const blocks = extras.map((m) =>
    m.kind === 'image'
      ? `![](${m.public_url})`
      : `<video controls playsinline src="${m.public_url}"></video>`
  );
  return `${ctx.caption}\n\n${blocks.join('\n\n')}`;
}

/** Finds a free slug. Bounded rather than a while(true) against a live table. */
async function uniqueSlug(base: string): Promise<string> {
  const supabase = studioClient();
  for (let n = 0; n < 50; n += 1) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (error) throw new PublishError(`Slug lookup failed: ${error.message}`, true);
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export const blogAdapter: ChannelAdapter = {
  channel: 'blog',
  label: 'Website blog',
  acceptsVideo: true,
  acceptsImages: true,
  acceptsTextOnly: true,

  preflight() {
    if (!process.env.SUPABASE_SERVICE_KEY) return 'SUPABASE_SERVICE_KEY is not set.';
    return null;
  },

  validate(ctx) {
    if (!ctx.caption.trim() && !ctx.media.length) return 'A blog post needs text or media.';
    return null;
  },

  async publish(ctx: PublishContext): Promise<PublishResult> {
    const supabase = studioClient();
    const title = deriveTitle(ctx);
    const slug = await uniqueSlug(slugify(title));
    const cover = ctx.media.find((m) => m.kind === 'image');

    const excerptSource = ctx.caption.replace(/\s+/g, ' ').trim();
    const excerpt =
      excerptSource.length > 200 ? `${excerptSource.slice(0, 197)}…` : excerptSource || null;

    const { data, error } = await supabase
      .from('posts')
      .insert({
        slug,
        title,
        excerpt,
        body: bodyWithMedia(ctx, cover),
        tags: ctx.draft.tags ?? [],
        cover_url: cover?.public_url ?? null,
        published: true,
        published_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single();

    if (error) {
      // A unique violation means a racing insert took the slug; that is worth retrying.
      throw new PublishError(`Blog insert failed: ${error.message}`, error.code === '23505');
    }

    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stotteyman.com').replace(/\/$/, '');
    ctx.log('blog post created', { slug: data.slug });

    return { remoteId: data.id, remoteUrl: `${site}/blog/${data.slug}` };
  },
};
