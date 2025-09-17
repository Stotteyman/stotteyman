import { Metadata } from 'next';
import BlogPage from '@/components/BlogPage';

export const metadata: Metadata = {
  title: 'Blog | Stotteyman',
  description: 'Thoughts on design, technology, and the creative process by Gary Lee McCullouch Jr.',
  keywords: [
    'blog',
    'design',
    'technology',
    'creative process',
    'digital minimalism',
    'web development',
    'Gary Lee McCullouch Jr',
    'Stotteyman'
  ],
  openGraph: {
    title: 'Blog | Stotteyman',
    description: 'Thoughts on design, technology, and the creative process by Gary Lee McCullouch Jr.',
    type: 'website',
    url: '/blog',
    images: [
      {
        url: '/og-blog.svg',
        width: 1200,
        height: 630,
        alt: 'Stotteyman Blog - Thoughts on design and technology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Stotteyman',
    description: 'Thoughts on design, technology, and the creative process by Gary Lee McCullouch Jr.',
    images: ['/og-blog.svg'],
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function Blog() {
  return <BlogPage />;
}
