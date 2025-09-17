'use client';

import { useEffect, useState } from 'react';

interface AboutPageProps {
  onBack: () => void;
  respectMotionPreference: boolean;
}

export default function AboutPage({ onBack, respectMotionPreference }: AboutPageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <div className="h-full w-full bg-black flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 relative z-10">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors duration-300 z-10"
          aria-label="Go back to menu"
        >
          ← Back
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`max-w-4xl mx-auto px-8 py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-wide">
            Who am I
          </h1>
          <div className="w-24 h-px bg-white mx-auto"></div>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <p className="text-lg md:text-xl text-center">
            I'm a creative technologist passionate about building meaningful digital experiences. 
            I believe in the power of technology to connect, inspire, and transform.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-4">
              <h3 className="text-xl text-white font-light">Background</h3>
              <p className="text-gray-400">
                With a background in both design and development, I bridge the gap between 
                beautiful aesthetics and functional technology. Every project is an opportunity 
                to create something that matters.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl text-white font-light">Philosophy</h3>
              <p className="text-gray-400">
                Life is what you make it. I approach every challenge with curiosity, 
                creativity, and a commitment to continuous learning and growth.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Press ESC to go back
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
