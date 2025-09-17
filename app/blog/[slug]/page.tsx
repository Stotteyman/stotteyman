import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/BlogPostPage';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog-data';

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Stotteyman',
    };
  }

  return {
    title: `${post.title} | Stotteyman Blog`,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      post.category.toLowerCase(),
      'blog',
      'Gary Lee McCullouch Jr',
      'Stotteyman',
      'design',
      'technology',
      'creative process'
    ],
    authors: [{ name: 'Gary Lee McCullouch Jr' }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['Gary Lee McCullouch Jr'],
      tags: post.tags,
      url: `/blog/${post.slug}`,
      images: [
        {
          url: '/og-image.svg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: ['/og-image.svg'],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    other: {
      'article:author': 'Gary Lee McCullouch Jr',
      'article:published_time': post.date,
      'article:section': post.category,
      'article:tag': post.tags.join(', '),
    },
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  return <BlogPostPage slug={slug} />;
}
