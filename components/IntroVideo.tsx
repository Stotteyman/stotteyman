'use client';

import { useEffect, useRef, useState } from 'react';

interface IntroVideoProps {
  onComplete: () => void;
  onSkip: () => void;
  canSkip: boolean;
  respectMotionPreference?: boolean;
}

export default function IntroVideo({ 
  onComplete, 
  onSkip, 
  canSkip, 
  respectMotionPreference = false
}: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(canSkip);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  
  // Use respectMotionPreference to control animations
  // const shouldAnimate = !respectMotionPreference;

  useEffect(() => {
    // Since video files are empty, show static intro for 3 seconds then advance
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowSkipButton(true);
      
      // Auto-advance after 3 seconds
      setTimeout(() => {
        onComplete();
      }, 3000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    // Mark intro as seen in localStorage
    localStorage.setItem('stotteyman_intro_seen', 'true');
    onSkip();
  };

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setNeedsUserInteraction(false);
    } catch (error) {
      console.error('Failed to play video:', error);
      // If video still can't play, skip to next screen
      onComplete();
    }
  };


  return (
    <div className="relative w-full h-screen bg-dark-900 overflow-hidden">
      {/* Static Intro Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        {/* Animated background elements */}
        <div className="absolute inset-0">
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
        
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-bg opacity-20" />
        
        {/* Scanline effect */}
        <div className="absolute inset-0 scanlines opacity-30" />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-neon-cyan font-mono">Loading Experience...</p>
          </div>
        </div>
      )}

      {/* Play Button (if autoplay failed) */}
      {needsUserInteraction && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={handlePlay}
            className="btn-neon px-8 py-4 text-xl font-display"
            aria-label="Play intro video"
          >
            ▶ Play Video
          </button>
        </div>
      )}

      {/* Skip Button */}
      {showSkipButton && (
        <div className="absolute top-8 right-8 z-20">
          <button
            onClick={handleSkip}
            className="btn-neon px-4 py-2 text-sm font-mono"
            aria-label="Skip intro video"
          >
            Skip Intro
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-800">
        <div 
          className="h-full bg-neon-cyan transition-all duration-300"
          style={{
            width: videoRef.current 
              ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%`
              : '0%'
          }}
        />
      </div>

      {/* Subtitles/Overlay Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl md:text-8xl font-bold neon-glow mb-4 font-display">
            STOTTEYMAN
          </h1>
          <p className="text-xl md:text-2xl text-neon-cyan font-mono">
            Enter the Digital Realm
          </p>
        </div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanlines opacity-30" />
      
      {/* CRT Bloom Effect */}
      <div className="absolute inset-0 crt-bloom opacity-20" />
    </div>
  );
}
