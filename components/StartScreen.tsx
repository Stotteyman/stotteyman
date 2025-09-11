'use client';

import { useEffect, useState } from 'react';

interface StartScreenProps {
  onStart: () => void;
  respectMotionPreference: boolean;
}

export default function StartScreen({ onStart, respectMotionPreference }: StartScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tapHintVisible, setTapHintVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Show tap hint after title appears
    const hintTimer = setTimeout(() => {
      setTapHintVisible(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(hintTimer);
    };
  }, []);

  const handleInteraction = () => {
    onStart();
  };

  return (
    <div className="relative w-full h-screen bg-dark-900 overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute inset-0 scanlines opacity-20" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: respectMotionPreference 
                ? 'none' 
                : `flicker ${2 + Math.random() * 3}s infinite linear`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold neon-glow mb-8 font-display">
          STOTTEYMAN
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-neon-cyan font-mono mb-12 opacity-90">
          AI-Powered Digital Mentor
        </p>

        {/* Interactive Area */}
        <div 
          className="cursor-pointer group"
          onClick={handleInteraction}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleInteraction();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Start the experience"
        >
          {/* Tap/Click Hint */}
          <div className={`transition-all duration-1000 ${tapHintVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-center space-x-4 mb-8">
              {/* Finger Tap Icon */}
              <div className="relative">
                <div className="w-12 h-12 border-2 border-neon-cyan rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-6 h-6 bg-neon-cyan rounded-full animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-pink rounded-full animate-bounce" />
              </div>
              
              {/* Text */}
              <div className="text-neon-cyan font-mono text-lg">
                Tap / Click / Press Enter
              </div>
            </div>
          </div>

          {/* Glowing Button */}
          <div className="relative">
            <div className="btn-neon text-xl px-8 py-4 group-hover:scale-105 transition-all duration-300">
              Enter the Matrix
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 btn-neon text-xl px-8 py-4 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300" />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-gray-400 font-mono text-sm space-y-2">
          <p>Use keyboard, mouse, touch, or gamepad</p>
          <p>Press ESC to go back at any time</p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-neon-cyan opacity-20"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animation: respectMotionPreference 
                ? 'none' 
                : `glow-pulse ${3 + i}s infinite ease-in-out`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanlines opacity-30" />
    </div>
  );
}
