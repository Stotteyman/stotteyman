import type { Metadata } from 'next';
import { Orbitron, Fira_Code } from 'next/font/google';
import Providers from '@/components/providers';
import './globals.css';

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const firaCode = Fira_Code({ 
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Stotteyman - Life is what you make it',
    template: '%s | Stotteyman',
  },
  description: 'Life is what you make it. A minimal, interactive portfolio showcasing creative work, thoughts, and projects.',
  keywords: [
    'portfolio',
    'creative technologist',
    'design',
    'development',
    'minimal design',
    'interactive portfolio',
    'life is what you make it',
    'stotteyman',
    'creative work',
    'digital art',
    'web development',
    'design thinking',
  ],
  authors: [{ name: 'Gary Lee McCullouch Jr' }],
  creator: 'Gary Lee McCullouch Jr',
  publisher: 'Gary Lee McCullouch Jr',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://stotteyman.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Stotteyman - Life is what you make it',
    description: 'Life is what you make it. A minimal, interactive portfolio showcasing creative work, thoughts, and projects.',
    siteName: 'Stotteyman',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Stotteyman - Life is what you make it',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stotteyman - Life is what you make it',
    description: 'Life is what you make it. A minimal, interactive portfolio showcasing creative work, thoughts, and projects.',
    images: ['/og-image.svg'],
    creator: '@stotteyman',
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${firaCode.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased bg-black text-white h-screen overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Stotteyman",
              "description": "Life is what you make it. A minimal, interactive portfolio showcasing creative work, thoughts, and projects.",
              "url": "https://stotteyman.com",
              "applicationCategory": "Portfolio",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Person",
                "name": "Gary Lee McCullouch Jr"
              },
              "keywords": "portfolio, creative technologist, design, development, minimal design, interactive portfolio, life is what you make it",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "1.0.0",
              "datePublished": "2024-01-01",
              "dateModified": new Date().toISOString().split('T')[0]
            })
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
