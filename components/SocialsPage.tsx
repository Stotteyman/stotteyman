'use client';

import { useEffect, useState } from 'react';

interface SocialsPageProps {
  onBack: () => void;
  respectMotionPreference: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  description: string;
}

const socialLinks: SocialLink[] = [
  {
    platform: 'Twitter',
    url: 'https://twitter.com/stotteyman',
    description: 'Follow my thoughts and updates'
  },
  {
    platform: 'GitHub',
    url: 'https://github.com/stotteyman',
    description: 'Check out my code and projects'
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/stotteyman',
    description: 'Connect professionally'
  },
  {
    platform: 'Instagram',
    url: 'https://instagram.com/stotteyman',
    description: 'See my creative side'
  },
  {
    platform: 'Email',
    url: 'mailto:hello@stotteyman.com',
    description: 'Send me a message'
  }
];

export default function SocialsPage({ onBack, respectMotionPreference }: SocialsPageProps) {
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

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
            My Socials
          </h1>
          <div className="w-24 h-px bg-white mx-auto"></div>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {socialLinks.map((social, index) => (
            <button
              key={social.platform}
              onClick={() => handleLinkClick(social.url)}
              className="w-full text-left p-6 hover:bg-white/5 transition-all duration-300 group"
              aria-label={`Visit my ${social.platform}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl text-white font-light group-hover:text-gray-300 transition-colors">
                    {social.platform}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{social.description}</p>
                </div>
                <div className="text-gray-500 group-hover:text-white transition-colors">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Press ESC to go back
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
