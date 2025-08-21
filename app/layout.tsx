import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { FloatingCTA } from '@/components/FloatingCTA'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Stotteyman Enterprises LLC | Visionary Investment Opportunities',
  description: 'Discover cutting-edge ventures led by Gary Lee McCullouch Jr. - from creative studios to cannabis tech, livestream culture to AI innovation.',
  keywords: 'investment, ventures, Gary McCullouch, Orange Duck Studios, Hella Fkn Gas, Wage Society, livestream, cannabis tech',
  authors: [{ name: 'Gary Lee McCullouch Jr.' }],
  openGraph: {
    title: 'Stotteyman Enterprises LLC',
    description: 'Visionary Investment Opportunities',
    url: 'https://stotteyman.com',
    siteName: 'Stotteyman Enterprises',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stotteyman Enterprises LLC',
    description: 'Visionary Investment Opportunities',
    images: ['/og-image.jpg'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans bg-black text-white overflow-x-hidden`}>
        <Navigation />
        <main className="relative">
          {children}
        </main>
        <FloatingCTA />
      </body>
    </html>
  )
}