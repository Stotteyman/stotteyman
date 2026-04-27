import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import { writingEntries } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Short public notes on mindset, proof of work, visibility, and the projects currently moving forward.',
  keywords: [
    'blog',
    'writing',
    'mindset',
    'portfolio notes',
    'public work',
    'Gary Lee McCullouch Jr',
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
  return (
    <SiteShell
      eyebrow="Writing"
      title="Notes that explain the work instead of hiding it."
      intro="This section keeps short-form writing close to the rest of the portfolio. It is here to add context, preserve intent, and make the direction of the work easier to understand."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {writingEntries.map((entry) => (
          <article
            key={entry.slug}
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-neon-orange/60 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-neon-cyan/80">{entry.date}</p>
            <h2 className="mt-4 text-2xl font-light text-white">{entry.title}</h2>
            <p className="mt-4 text-sm leading-7 text-gray-400">{entry.excerpt}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
