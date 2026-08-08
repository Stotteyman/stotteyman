import { ImageResponse } from 'next/og';

import { OG_SIZE, ogCard } from '@/lib/og-card';

/**
 * The site's Open Graph card.
 *
 * This exists because `public/og-image.svg` was referenced as the OG image and **no
 * major platform renders an SVG Open Graph image** — Facebook, X, LinkedIn, Discord,
 * iMessage and Slack all simply showed no preview. Generating a real PNG here is the
 * fix; the file-based convention also keeps the URL and dimensions in sync instead of
 * restating them in metadata.
 */

export const alt = 'Stotteyman — builder and operator';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function OpengraphImage() {
  return new ImageResponse(
    ogCard({
      eyebrow: 'Stotteyman',
      headline: 'Game servers, community platforms, and the software that keeps them running.',
      footerLeft: 'stotteyman.com',
      footerRight: 'Builder & operator',
    }),
    size
  );
}
