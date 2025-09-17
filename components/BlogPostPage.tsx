'use client';

import { useEffect, useState } from 'react';
import { getBlogPostBySlug, type BlogPost } from '@/lib/blog-data';
import Link from 'next/link';

interface BlogPostPageProps {
  slug: string;
}

export default function BlogPostPage({ slug }: BlogPostPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const foundPost = getBlogPostBySlug(slug);
    setPost(foundPost || null);
    
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Post not found</h1>
          <Link
            href="/blog"
            className="text-gray-400 hover:text-white transition-colors duration-300 font-mono text-sm"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/blog"
                className="text-gray-400 hover:text-white transition-colors duration-300 font-mono text-sm"
              >
                ← Back to Blog
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-light tracking-wide">Blog</h1>
              <p className="text-gray-400 text-sm font-mono mt-1">Stotteyman</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs text-gray-500 font-mono">
                {new Date(post.date).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-600 font-mono">
                {post.category}
              </span>
              <span className="text-xs text-gray-600 font-mono">
                {Math.ceil(post.content.split(' ').length / 200)} min read
              </span>
            </div>
            
            <h1 className="text-4xl font-light mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-400 mb-8">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-600 font-mono bg-gray-800 px-3 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div 
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Post Footer */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 font-mono text-sm">
                  Written by Gary Lee McCullouch Jr
                </p>
                <p className="text-gray-500 font-mono text-xs">
                  Published on {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
              <Link
                href="/blog"
                className="text-gray-400 hover:text-white transition-colors duration-300 font-mono text-sm"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

