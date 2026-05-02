import type { Metadata } from 'next';
import EbzClient from './EbzClient';

export const metadata: Metadata = {
  title: '#FreeEBZ Petition | Reinstate EBZ on Kick',
  description:
    'Read the case for EBZ\'s reinstatement on Kick, review the petition, and add your signature in support of reversing his wrongful ban and clearing false accusations that damaged his reputation and livelihood.',
  keywords: [
    'EBZ',
    'Free EBZ',
    'reinstate EBZ',
    'EBZ Kick petition',
    'Kick ban appeal',
    'wrongful ban petition',
    'Kick community petition',
    'EBZ false accusations',
    'Kick reinstatement',
    'sign petition for EBZ',
  ],
  alternates: {
    canonical: '/ebz',
  },
  openGraph: {
    title: '#FreeEBZ Petition | Reinstate EBZ on Kick',
    description:
      'A detailed petition page calling for EBZ to be reinstated on Kick, correcting false accusations and documenting why supporters are demanding fair treatment and accountability.',
    url: '/ebz',
    siteName: 'Stotteyman',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/ebz-preview.jpg',
        width: 1080,
        height: 810,
        alt: 'EBZ standing outdoors and smiling for a portrait photo used as the petition preview image.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '#FreeEBZ Petition | Reinstate EBZ on Kick',
    description:
      'Support the petition to reinstate EBZ on Kick, challenge false accusations, and help spread the case for fair treatment.',
    images: ['/ebz-preview.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function EbzPage() {
  return <EbzClient />;
}
