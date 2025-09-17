'use client';

import { useEffect, useState } from 'react';
import { getAllBlogPosts, type BlogPost } from '@/lib/blog-data';
import Link from 'next/link';

const blogPosts = getAllBlogPosts();

export default function BlogPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors duration-300 font-mono text-sm"
              >
                ← Back to Site
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-4">Thoughts & Ideas</h2>
            <p className="text-gray-400 font-mono text-sm max-w-2xl mx-auto">
              Exploring design, technology, and the creative process through written words and digital experiences.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group block transition-all duration-500 hover:scale-105 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-white transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-600 font-mono">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-light mb-3 group-hover:text-white transition-colors duration-300">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-600 font-mono bg-gray-800 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-gray-500 text-xs font-mono">
                    Read more →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {blogPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-light text-gray-400 mb-2">No posts yet</h3>
              <p className="text-gray-500 font-mono">
                Check back soon for thoughts on design and technology.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

