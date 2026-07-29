/**
 * Instagram adapter.
 *
 * Always two steps: build a media *container*, then publish it. Containers for video are
 * processed asynchronously by Meta and must be polled to FINISHED before publishing —
 * see `waitForContainer`. Instagram also cannot post text alone; media is mandatory.
 */
import type { ChannelAdapter, PublishContext, PublishResult, StudioMedia } from '../types';
import { PublishError } from '../types';
import { graphGet, graphPost, metaToken, waitForContainer } from './meta';

const CAPTION_LIMIT = 2200;
const CAROUSEL_MAX = 10;

function igUserId(): string {
  const id = process.env.META_IG_USER_ID;
  if (!id) throw new PublishError('META_IG_USER_ID is not set.', false);
  return id;
}

function containerParams(item: StudioMedia, extra: Record<string, string> = {}) {
  return item.kind === 'video'
    ? { media_type: 'REELS', video_url: item.public_url, ...extra }
    : { image_url: item.public_url, ...extra };
}

async function permalink(mediaId: string, token: string): Promise<string | null> {
  try {
    const body = (await graphGet(
      `/${mediaId}`,
      { fields: 'permalink' },
      token,
      'Instagram permalink'
    )) as { permalink?: string };
    return body.permalink ?? null;
  } catch {
    // The post already succeeded; failing to fetch its URL must not fail the publish.
    return null;
  }
}

export const instagramAdapter: ChannelAdapter = {
  channel: 'instagram',
  label: 'Instagram',
  acceptsVideo: true,
  acceptsImages: true,
  acceptsTextOnly: false,

  preflight() {
    if (!process.env.META_PAGE_ACCESS_TOKEN) return 'META_PAGE_ACCESS_TOKEN is not set.';
    if (!process.env.META_IG_USER_ID) return 'META_IG_USER_ID is not set.';
    return null;
  },

  validate(ctx) {
    if (!ctx.media.length) return 'Instagram needs at least one photo or video.';
    if (ctx.caption.length > CAPTION_LIMIT) {
      return `Caption is ${ctx.caption.length} characters; Instagram allows ${CAPTION_LIMIT}.`;
    }
    return null;
  },

  async publish(ctx: PublishContext): Promise<PublishResult> {
    const token = metaToken();
    const user = igUserId();
    const caption = ctx.caption.trim();
    const items = ctx.media.slice(0, CAROUSEL_MAX);

    let creationId: string;

    if (items.length === 1) {
      const body = (await graphPost(
        `/${user}/media`,
        containerParams(items[0], { caption }),
        token,
        'Instagram container'
      )) as { id?: string };

      if (!body.id) throw new PublishError('Instagram returned no container id.', true);
      creationId = body.id;

      if (items[0].kind === 'video') await waitForContainer(creationId, token, ctx.log);
    } else {
      // Carousel: every child is built and processed first, then wrapped in a parent.
      const childIds: string[] = [];
      for (const item of items) {
        const body = (await graphPost(
          `/${user}/media`,
          containerParams(item, { is_carousel_item: 'true' }),
          token,
          'Instagram carousel child'
        )) as { id?: string };
        if (!body.id) throw new PublishError('Instagram returned no child container id.', true);
        childIds.push(body.id);
      }

      for (const childId of childIds) {
        await waitForContainer(childId, token, ctx.log);
      }

      const parent = (await graphPost(
        `/${user}/media`,
        { media_type: 'CAROUSEL', children: childIds.join(','), caption },
        token,
        'Instagram carousel'
      )) as { id?: string };

      if (!parent.id) throw new PublishError('Instagram returned no carousel id.', true);
      creationId = parent.id;
      await waitForContainer(creationId, token, ctx.log);
    }

    const published = (await graphPost(
      `/${user}/media_publish`,
      { creation_id: creationId },
      token,
      'Instagram publish'
    )) as { id?: string };

    if (!published.id) throw new PublishError('Instagram publish returned no media id.', true);

    ctx.log('published to instagram', { mediaId: published.id });

    return {
      remoteId: published.id,
      remoteUrl: await permalink(published.id, token),
      note:
        ctx.media.length > CAROUSEL_MAX
          ? `Only the first ${CAROUSEL_MAX} items were posted.`
          : undefined,
    };
  },
};
