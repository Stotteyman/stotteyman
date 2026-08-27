import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stotteyman.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /hq is the private business console. Also enforced by an X-Robots-Tag
      // header from middleware and `robots: noindex` metadata on every HQ route —
      // robots.txt alone is a request, not a control.
      // /ama/q/ holds one private page per paid question, addressed by a token that
      // travels through Stripe's success URL. The pages are already `noindex`; this is
      // the second layer, so a crawler never fetches one in the first place.
      disallow: ['/_next/', '/hq', '/hq/', '/ama/q/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
