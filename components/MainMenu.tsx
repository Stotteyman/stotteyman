'use client';

import { useEffect, useState, useRef } from 'react';
import { useGamepad } from '@/hooks/useGamepad';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  onBack: () => void;
  respectMotionPreference: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  action: () => void;
  disabled?: boolean;
}

export default function MainMenu({ onPlay, onSettings, onBack, respectMotionPreference }: MainMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isButtonPressed, getAxisValue, BUTTONS, AXES } = useGamepad();

  const menuItems: MenuItem[] = [
    { id: 'play', label: 'Play', action: onPlay },
    { id: 'option1', label: 'Option 1', action: () => console.log('Option 1 clicked'), disabled: true },
    { id: 'option2', label: 'Option 2', action: () => console.log('Option 2 clicked'), disabled: true },
    { id: 'option3', label: 'Option 3', action: () => console.log('Option 3 clicked'), disabled: true },
    { id: 'settings', label: 'Settings', action: onSettings },
  ];

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
          const selectedItem = menuItems[selectedIndex];
          if (selectedItem && !selectedItem.disabled) {
            selectedItem.action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, menuItems, onBack]);

  // Gamepad navigation
  useEffect(() => {
    const leftStickY = getAxisValue(AXES.LEFT_Y);
    const dPadUp = isButtonPressed(BUTTONS.UP);
    const dPadDown = isButtonPressed(BUTTONS.DOWN);
    const confirmButton = isButtonPressed(BUTTONS.A);
    const backButton = isButtonPressed(BUTTONS.B);

    // D-pad navigation
    if (dPadUp) {
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : menuItems.length - 1
      );
    }
    if (dPadDown) {
      setSelectedIndex(prev => 
        prev < menuItems.length - 1 ? prev + 1 : 0
      );
    }

    // Left stick navigation
    if (leftStickY < -0.5) {
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : menuItems.length - 1
      );
    }
    if (leftStickY > 0.5) {
      setSelectedIndex(prev => 
        prev < menuItems.length - 1 ? prev + 1 : 0
      );
    }

    // Confirm selection
    if (confirmButton) {
      const selectedItem = menuItems[selectedIndex];
      if (selectedItem && !selectedItem.disabled) {
        selectedItem.action();
      }
    }

    // Back button
    if (backButton) {
      onBack();
    }
  }, [isButtonPressed, getAxisValue, BUTTONS, AXES, selectedIndex, menuItems, onBack]);

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.action();
    }
  };

  return (
    <div className="relative w-full h-screen bg-dark-900 overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute inset-0 scanlines opacity-20" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: respectMotionPreference 
                ? 'none' 
                : `flicker ${3 + Math.random() * 4}s infinite linear`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main Menu */}
      <div 
        ref={menuRef}
        className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold neon-glow mb-16 font-display text-center">
          MAIN MENU
        </h1>

        {/* Menu Items */}
        <div className="space-y-4 min-w-[300px]">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all duration-300 font-mono text-lg ${
                index === selectedIndex
                  ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-lg shadow-neon-cyan/50'
                  : item.disabled
                  ? 'border-gray-600 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  : 'border-neon-cyan/50 bg-transparent text-white hover:border-neon-cyan hover:bg-neon-cyan/5 hover:text-neon-cyan'
              }`}
              disabled={item.disabled}
              aria-label={item.label}
            >
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                {item.disabled && (
                  <span className="text-xs text-gray-500">Coming Soon</span>
                )}
                {index === selectedIndex && (
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-12 text-gray-400 font-mono text-sm text-center space-y-2">
          <p>Use ↑↓ or WASD to navigate</p>
          <p>Press Enter or A button to select</p>
          <p>Press ESC or B button to go back</p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-neon-cyan opacity-10"
            style={{
              left: `${10 + i * 10}%`,
              top: `${20 + i * 8}%`,
              animation: respectMotionPreference 
                ? 'none' 
                : `glow-pulse ${4 + i}s infinite ease-in-out`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanlines opacity-30" />
    </div>
  );
}
