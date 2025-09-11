'use client';

import { useState, useEffect, useRef } from 'react';
import { playUISound, speakText, stopSpeech } from './AudioBus';

interface DialogueProps {
  message: string;
  options: string[];
  emotion?: {
    arousal: number;
    valence: number;
  };
  onOptionSelect: (option: string) => void;
  isSpeaking?: boolean;
  respectMotionPreference?: boolean;
  className?: string;
}

export default function Dialogue({
  message,
  options,
  emotion = { arousal: 0.5, valence: 0.5 },
  onOptionSelect,
  isSpeaking = false,
  respectMotionPreference = false,
  className = ''
}: DialogueProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const messageRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Typewriter effect for message
  useEffect(() => {
    if (!message) return;

    setDisplayedMessage('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedMessage(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30); // Adjust speed as needed

    return () => clearInterval(interval);
  }, [message]);

  // Show dialogue with animation
  useEffect(() => {
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
            prev > 0 ? prev - 1 : options.length - 1
          );
          playUISound('hover');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          playUISound('hover');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (options[selectedIndex]) {
            onOptionSelect(options[selectedIndex]);
            playUISound('confirm');
          }
          break;
        case 'Escape':
          e.preventDefault();
          playUISound('back');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, options, onOptionSelect]);

  // Auto-speak message when it changes
  useEffect(() => {
    if (message && !respectMotionPreference) {
      // Stop any ongoing speech
      stopSpeech();
      
      // Speak the message after a short delay
      const timer = setTimeout(() => {
        speakText(message);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [message, respectMotionPreference]);

  // Emotion-based styling
  const getEmotionColor = () => {
    const { arousal, valence } = emotion;
    const hue = (valence * 120) / 360; // 0-120 degrees (red to green)
    const saturation = 80;
    const lightness = 30 + arousal * 40;
    return `hsl(${hue * 360}, ${saturation}%, ${lightness}%)`;
  };

  const handleOptionClick = (option: string) => {
    onOptionSelect(option);
    playUISound('confirm');
  };

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Message Display */}
      <div 
        ref={messageRef}
        className={`flex-1 p-6 bg-dark-800/90 border border-neon-cyan/30 rounded-lg mb-4 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          borderColor: getEmotionColor(),
        }}
      >
        <div className="flex items-start space-x-4">
          {/* Speaker indicator */}
          <div 
            className="w-3 h-3 rounded-full mt-2 animate-pulse"
            style={{ backgroundColor: getEmotionColor() }}
          />
          
          {/* Message content */}
          <div className="flex-1">
            <div className="text-white font-mono text-lg leading-relaxed">
              {displayedMessage}
              {isSpeaking && (
                <span className="inline-block w-2 h-6 bg-neon-cyan ml-2 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div 
        ref={optionsRef}
        className={`space-y-2 transition-all duration-500 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 font-mono text-sm ${
              index === selectedIndex
                ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-lg shadow-neon-cyan/50'
                : 'border-neon-cyan/50 bg-transparent text-white hover:border-neon-cyan hover:bg-neon-cyan/5 hover:text-neon-cyan'
            }`}
            style={{
              borderColor: index === selectedIndex ? getEmotionColor() : undefined,
            }}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {index === selectedIndex && (
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: getEmotionColor() }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-gray-400 font-mono text-xs text-center">
        Use ↑↓ or WASD to navigate • Press Enter to select • Press ESC to go back
      </div>
    </div>
  );
}
