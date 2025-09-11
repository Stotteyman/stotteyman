import type { Metadata } from 'next';
import { Orbitron, Fira_Code } from 'next/font/google';
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
    default: 'Stotteyman - AI-Powered Digital Mentor',
    template: '%s | Stotteyman',
  },
  description: 'An immersive, game-like experience featuring an AI-powered wireframe talking head that learns and adapts. Built with Next.js, Three.js, and cutting-edge web technologies.',
  keywords: [
    'AI',
    'mentor',
    'game',
    'interactive',
    'wireframe',
    '3D',
    'Next.js',
    'Three.js',
    'WebGL',
    'WebAudio',
    'TTS',
    'gamepad',
    'accessibility',
  ],
  authors: [{ name: 'Stotteyman Enterprises' }],
  creator: 'Stotteyman Enterprises',
  publisher: 'Stotteyman Enterprises',
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
    title: 'Stotteyman - AI-Powered Digital Mentor',
    description: 'An immersive, game-like experience featuring an AI-powered wireframe talking head that learns and adapts.',
    siteName: 'Stotteyman',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Stotteyman - AI-Powered Digital Mentor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stotteyman - AI-Powered Digital Mentor',
    description: 'An immersive, game-like experience featuring an AI-powered wireframe talking head that learns and adapts.',
    images: ['/og-image.jpg'],
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased bg-dark-900 text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
