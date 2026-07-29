/**
 * Facebook Page adapter.
 *
 * Three different endpoints depending on the payload — Meta has no single "post this"
 * call. Text goes to /feed, one photo to /photos, several photos become unpublished
 * uploads stitched together by a /feed post, and video goes to /videos.
 */
import type { ChannelAdapter, PublishContext, PublishResult } from '../types';
import { PublishError } from '../types';
import { graphPost, metaToken } from './meta';

function pageId(): string {
  const id = process.env.META_PAGE_ID;
  if (!id) throw new PublishError('META_PAGE_ID is not set.', false);
  return id;
}

export const facebookAdapter: ChannelAdapter = {
  channel: 'facebook',
  label: 'Facebook Page',
  acceptsVideo: true,
  acceptsImages: true,
  acceptsTextOnly: true,

  preflight() {
    if (!process.env.META_PAGE_ACCESS_TOKEN) return 'META_PAGE_ACCESS_TOKEN is not set.';
    if (!process.env.META_PAGE_ID) return 'META_PAGE_ID is not set.';
    return null;
  },

  validate(ctx) {
    if (!ctx.caption.trim() && !ctx.media.length) return 'Nothing to post.';
    return null;
  },

  async publish(ctx: PublishContext): Promise<PublishResult> {
    const token = metaToken();
    const page = pageId();
    const message = ctx.caption.trim();

    const videos = ctx.media.filter((m) => m.kind === 'video');
    const images = ctx.media.filter((m) => m.kind === 'image');

    // Video wins when both are present: Facebook cannot mix video and photos in one post.
    if (videos.length) {
      const video = videos[0];
      if (videos.length > 1) {
        ctx.log('facebook takes one video per post; extra videos skipped', {
          skipped: videos.length - 1,
        });
      }

      const body = (await graphPost(
        `/${page}/videos`,
        { file_url: video.public_url, description: message },
        token,
        'Facebook video post'
      )) as { id?: string };

      return {
        remoteId: body.id ?? null,
        remoteUrl: body.id ? `https://www.facebook.com/${body.id}` : null,
        note: videos.length > 1 ? 'Only the first video was posted.' : undefined,
      };
    }

    if (images.length === 1) {
      const body = (await graphPost(
        `/${page}/photos`,
        { url: images[0].public_url, message },
        token,
        'Facebook photo post'
      )) as { id?: string; post_id?: string };

      const id = body.post_id ?? body.id ?? null;
      return { remoteId: id, remoteUrl: id ? `https://www.facebook.com/${id}` : null };
    }

    if (images.length > 1) {
      // Upload each photo unpublished, then attach them all to one feed post.
      const mediaFbids: string[] = [];
      for (const image of images.slice(0, 10)) {
        const body = (await graphPost(
          `/${page}/photos`,
          { url: image.public_url, published: 'false' },
          token,
          'Facebook photo upload'
        )) as { id?: string };
        if (body.id) mediaFbids.push(body.id);
      }

      if (!mediaFbids.length) {
        throw new PublishError('No photos uploaded successfully.', true);
      }

      const params: Record<string, string> = { message };
      mediaFbids.forEach((id, index) => {
        params[`attached_media[${index}]`] = JSON.stringify({ media_fbid: id });
      });

      const body = (await graphPost(
        `/${page}/feed`,
        params,
        token,
        'Facebook multi-photo post'
      )) as { id?: string };

      return {
        remoteId: body.id ?? null,
        remoteUrl: body.id ? `https://www.facebook.com/${body.id}` : null,
      };
    }

    const body = (await graphPost(
      `/${page}/feed`,
      { message, link: ctx.draft.link_url ?? undefined },
      token,
      'Facebook post'
    )) as { id?: string };

    return {
      remoteId: body.id ?? null,
      remoteUrl: body.id ? `https://www.facebook.com/${body.id}` : null,
    };
  },
};
