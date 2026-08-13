'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Scroll-in motion for editorial sections.
 *
 * Two rules this respects that most scroll-reveal code does not:
 *
 * 1. **The content is visible before JS runs.** The hidden state is applied from an
 *    effect, not from the server render, so a failed hydration or a blocked bundle
 *    leaves a readable page rather than a blank one. Search engines and readers get
 *    the text either way.
 * 2. **`prefers-reduced-motion` opts out entirely** — no transform, no transition,
 *    no observer. Parallax-style reveals are a genuine vestibular trigger.
 *
 * Only transform and opacity are animated, per the brand's motion rule.
 */

type Props = {
  children: ReactNode;
  /** Stagger within a group, in ms. Keep under ~200 or the last item feels broken. */
  delay?: number;
  className?: string;
};

export default function Reveal({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Anything already on screen at mount stays put: animating the hero in after the
    // browser has already painted it reads as a flicker, not as an entrance.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return;

    setShown(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-slow ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
