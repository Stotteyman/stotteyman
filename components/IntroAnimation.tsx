'use client';

import { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
  respectMotionPreference: boolean;
}

export default function IntroAnimation({ onComplete, respectMotionPreference }: IntroAnimationProps) {
  const [phase, setPhase] = useState<'title' | 'subtitle' | 'complete'>('title');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial fade in
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Phase transitions (but don't auto-complete)
    const phase1Timer = setTimeout(() => {
      setPhase('subtitle');
    }, 2000);

    const phase2Timer = setTimeout(() => {
      setPhase('complete');
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
    };
  }, []);

  const handleClick = () => {
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Skip intro animation"
    >
      <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Main Title */}
        <div className={`transition-all duration-1000 ${
          phase === 'title' || phase === 'subtitle' || phase === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light text-white mb-4 tracking-wider">
            Stotteyman
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`transition-all duration-1000 delay-500 ${
          phase === 'subtitle' || phase === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide">
            Life is what you make it
          </p>
        </div>

        {/* Click hint */}
        <div className={`mt-8 transition-all duration-1000 delay-1000 ${
          phase === 'subtitle' || phase === 'complete' ? 'opacity-100' : 'opacity-0'
        }`}>
          <p className="text-sm text-gray-500 font-light animate-pulse">
            Click anywhere or press Enter/Space to continue
          </p>
        </div>
      </div>

      {/* Subtle background animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900/10 animate-pulse" />
      </div>
    </div>
  );
}
