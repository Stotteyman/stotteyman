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
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMDAwIi8+CiAgPHRleHQgeD0iMzIiIHk9IjQ0IiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+RzwvdGV4dD4KPC9zdmc+Cg==',
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

