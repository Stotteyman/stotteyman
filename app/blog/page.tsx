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
    // Image comes from app/opengraph-image.tsx. The previous `/og-blog.svg` was never
    // rendered by any social platform — SVG Open Graph images are not supported.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Writing | Stotteyman',
    description: 'Short public notes on mindset, proof of work, visibility, and the projects currently moving forward.',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
