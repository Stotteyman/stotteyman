'use client';

import { useEffect, useState, useRef } from 'react';

interface PortfolioMenuProps {
  onNavigate: (page: string) => void;
  respectMotionPreference: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  description: string;
}

const menuItems: MenuItem[] = [
  { id: 'about', label: 'Who am I', description: 'Learn about my story' },
  { id: 'socials', label: 'My Socials', description: 'Connect with me' },
  { id: 'blog', label: 'Blog', description: 'Read my thoughts' },
  { id: 'stream', label: 'Livestream', description: 'Watch the live Kick stream' },
  { id: 'projects', label: 'Projects', description: 'See my work' },
  { id: 'contact', label: 'Contact', description: 'Get in touch' },
];

export default function PortfolioMenu({ onNavigate, respectMotionPreference }: PortfolioMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : menuItems.length - 1
          );
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < menuItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onNavigate(menuItems[selectedIndex].id);
          break;
        case 'Escape':
          e.preventDefault();
          // Could go back to intro or close menu
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onNavigate]);

  const handleItemClick = (item: MenuItem) => {
    if (item.id === 'blog') {
      window.location.href = '/blog';
    } else if (item.id === 'stream') {
      window.location.href = '/stream';
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-transparent to-gray-800/20" />
      </div>

      {/* Main Menu */}
      <div 
        ref={menuRef}
        className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Menu Items */}
        <div className="space-y-2 min-w-[400px]">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-8 py-6 transition-all duration-300 ${
                index === selectedIndex
                  ? 'text-white bg-white/5 border-l-4 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/2'
              }`}
              aria-label={`${item.label} - ${item.description}`}
            >
              <div className="flex flex-col">
                <span className="text-xl font-light tracking-wide">{item.label}</span>
                <span className="text-sm text-gray-500 mt-1">{item.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-12 text-gray-600 text-sm text-center space-y-1">
          <p>Use ↑↓ or WASD to navigate</p>
          <p>Press Enter to select</p>
        </div>
      </div>
    </div>
  );
}
