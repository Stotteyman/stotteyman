import type { Metadata } from 'next';
import { Orbitron, Fira_Code } from 'next/font/google';
import { siteConfig } from '@/lib/site-content';
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
    default: 'Stotteyman',
    template: '%s | Stotteyman',
  },
  description:
    'Stotteyman — Live streaming on Kick, content on YouTube, community on Discord. The official hub for everything Stotteyman.',
  keywords: [
    'Stotteyman',
    'Kick livestream',
    'YouTube',
    'Discord',
    'Facebook',
    'content creator',
    'streaming',
    'portfolio',
    'achievements',
    'livestream',
    'events',
    'social links',
    'contact',
    'interactive portfolio',
    'stotteyman',
    'Gary Lee McCullouch Jr',
  ],
  authors: [{ name: siteConfig.person }],
  creator: siteConfig.person,
  publisher: siteConfig.person,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: `${siteConfig.name} | Public portfolio`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} portfolio`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Public portfolio`,
    description: siteConfig.description,
    images: ['/og-image.svg'],
    creator: siteConfig.socialHandle,
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
              "@type": "Person",
              "name": siteConfig.person,
              "alternateName": siteConfig.name,
              "description": siteConfig.description,
              "url": siteConfig.siteUrl,
              "applicationCategory": "Portfolio",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "sameAs": [
                "https://kick.com/stotteyman",
                "https://discord.gg/9zbyfPyp3E",
                "https://github.com/stotteyman",
                "https://twitter.com/stotteyman",
                "https://linkedin.com/in/stotteyman",
                "https://instagram.com/stotteyman"
              ],
              "keywords": "portfolio, mindset, achievements, livestream, events, contact, public work",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "1.0.0",
              "datePublished": "2024-01-01",
              "dateModified": new Date().toISOString().split('T')[0]
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
