import type { Metadata } from 'next'

export const metadata: Metadata = {
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
        url: '/og-image.svg',
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
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/favicon.svg',
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

