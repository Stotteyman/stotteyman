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
      disallow: ['/_next/', '/hq', '/hq/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
