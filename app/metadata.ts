import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://stotteyman.com'),
  alternates: { canonical: '/' },
  title: 'Gary Lee McCullouch Jr. | Startup Genius & Visionary Investor',
  description: 'Explore people-first ventures crafted by Gary Lee McCullouch Jr., a startup genius blending heart and intelligence to drive transformative investments.',
  keywords: 'startup genius, visionary investor, Gary Lee McCullouch Jr., people-first innovation, venture capital, community building',
  authors: [{ name: 'Gary Lee McCullouch Jr.' }],
  openGraph: {
    title: 'Gary Lee McCullouch Jr. | Startup Genius & Visionary Investor',
    description: 'People-first ventures and visionary investments.',
    url: 'https://stotteyman.com',
    siteName: 'Stotteyman Enterprises',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gary Lee McCullouch Jr. | Startup Genius & Visionary Investor',
    description: 'People-first ventures and visionary investments.',
    images: ['/og'],
  },
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000'/%3E%3Ctext x='32' y='44' font-size='40' text-anchor='middle' fill='%23fff' font-family='sans-serif'%3EG%3C/text%3E%3C/svg%3E",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

