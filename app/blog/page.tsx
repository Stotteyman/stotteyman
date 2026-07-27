import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Short public notes on mindset, proof of work, visibility, and the projects currently moving forward.',
  keywords: [
    'blog',
    'writing',
    'mindset',
    'portfolio notes',
    'public work',
    'Stotteyman'
  ],
  openGraph: {
    title: 'Writing | Stotteyman',
    description: 'Short public notes on mindset, proof of work, visibility, and the projects currently moving forward.',
    type: 'website',
    url: '/blog',
    images: [
      {
        url: '/og-blog.svg',
        width: 1200,
        height: 630,
        alt: 'Stotteyman writing page',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Writing | Stotteyman',
    description: 'Short public notes on mindset, proof of work, visibility, and the projects currently moving forward.',
    images: ['/og-blog.svg'],
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
