'use client';

import { useState, useEffect, useRef } from 'react';
import { useGamepad } from '@/hooks/useGamepad';
import WireHead from './WireHead';
import Dialogue from './Dialogue';
import { playUISound } from './AudioBus';

interface MobileGameShellProps {
  playerId?: string;
  sessionId?: string;
  onBack: () => void;
  respectMotionPreference?: boolean;
}

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  emotion?: {
    arousal: number;
    valence: number;
  };
  timestamp: Date;
}

export default function MobileGameShell({ 
  playerId, 
  sessionId, 
  onBack, 
  respectMotionPreference = false 
}: MobileGameShellProps) {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState({ arousal: 0.5, valence: 0.5 });
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showWireHead, setShowWireHead] = useState(true);
  
  const { isButtonPressed, BUTTONS } = useGamepad();
  const gameShellRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        // Call AI endpoint to get initial message
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            history: [],
            choice: 'start',
            playerId,
            sessionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentMessage(data.reply);
          setCurrentOptions(data.options);
          setCurrentEmotion(data.emotion);
          
          // Add to conversation history
          setConversation([{
            role: 'assistant',
            content: data.reply,
            emotion: data.emotion,
            timestamp: new Date(),
          }]);
        } else {
          // Fallback message
          setCurrentMessage("Welcome to the digital realm, code warrior. I'm Stotteyman, your AI mentor. What brings you here today?");
          setCurrentOptions([
            "I want to learn something new",
            "Help me with a coding problem",
            "Tell me about your world",
            "I'm just exploring"
          ]);
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        // Fallback message
        setCurrentMessage("Welcome to the digital realm, code warrior. I'm Stotteyman, your AI mentor. What brings you here today?");
        setCurrentOptions([
          "I want to learn something new",
          "Help me with a coding problem", 
          "Tell me about your world",
          "I'm just exploring"
        ]);
      }
    };

    initConversation();
  }, [playerId, sessionId]);

  // Show game shell with animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Gamepad controls
  useEffect(() => {
    if (isButtonPressed(BUTTONS.B)) {
      onBack();
      playUISound('back');
    }
  }, [isButtonPressed, BUTTONS.B, onBack]);

  const handleOptionSelect = async (option: string) => {
    if (isLoading) return;

    setIsLoading(true);
    playUISound('confirm');

    // Add user message to conversation
    const userTurn: ConversationTurn = {
      role: 'user',
      content: option,
      timestamp: new Date(),
    };

    const newConversation = [...conversation, userTurn];
    setConversation(newConversation);

    try {
      // Call AI endpoint
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: newConversation.map(turn => ({
            role: turn.role,
            content: turn.content,
            emotion: turn.emotion,
            timestamp: turn.timestamp,
          })),
          choice: option,
          playerId,
          sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentMessage(data.reply);
        setCurrentOptions(data.options);
        setCurrentEmotion(data.emotion);

        // Add AI response to conversation
        const aiTurn: ConversationTurn = {
          role: 'assistant',
          content: data.reply,
          emotion: data.emotion,
          timestamp: new Date(),
        };

        setConversation([...newConversation, aiTurn]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setCurrentMessage("I'm having trouble processing that. Could you try again?");
      setCurrentOptions([
        "Try again",
        "Ask something else",
        "Go back to menu"
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={gameShellRef}
      className={`relative w-full h-screen bg-dark-900 overflow-hidden flex flex-col ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-1000`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute inset-0 scanlines opacity-20" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-dark-800/90 border-b border-neon-cyan/30">
        <h1 className="text-lg font-bold font-mono text-neon-cyan">Stotteyman</h1>
        <button
          onClick={onBack}
          className="btn-neon px-3 py-1 text-sm font-mono"
          aria-label="Go back to menu"
        >
          ← Back
        </button>
      </div>

      {/* Wireframe Head Section */}
      {showWireHead && (
        <div className="h-48 bg-dark-800/50 border-b border-neon-cyan/30 relative">
          <WireHead
            emotion={currentEmotion}
            isBreathing={!isLoading}
            respectMotionPreference={respectMotionPreference}
            className="w-full h-full"
          />
          
          {/* Toggle Button */}
          <button
            onClick={() => setShowWireHead(!showWireHead)}
            className="absolute top-2 right-2 w-8 h-8 bg-dark-800/90 border border-neon-cyan/50 rounded-full flex items-center justify-center text-neon-cyan text-xs font-mono"
            aria-label="Toggle wireframe head"
          >
            {showWireHead ? '−' : '+'}
          </button>

          {/* Emotion Indicator */}
          <div className="absolute bottom-2 left-2 bg-dark-800/90 border border-neon-cyan/50 rounded-lg p-2">
            <div className="text-xs font-mono text-neon-cyan mb-1">Emotion</div>
            <div className="flex space-x-2">
              <div className="text-xs text-gray-400">A:</div>
              <div className="w-12 h-1 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon-cyan transition-all duration-300"
                  style={{ width: `${currentEmotion.arousal * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-400">V:</div>
              <div className="w-12 h-1 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon-pink transition-all duration-300"
                  style={{ width: `${currentEmotion.valence * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute bottom-2 right-2 bg-dark-800/90 border border-neon-cyan/50 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <div className="spinner w-3 h-3" />
                <span className="text-xs font-mono text-neon-cyan">Processing...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogue Section */}
      <div className="flex-1 p-4 overflow-hidden">
        <Dialogue
          message={currentMessage}
          options={currentOptions}
          emotion={currentEmotion}
          onOptionSelect={handleOptionSelect}
          isSpeaking={isLoading}
          respectMotionPreference={respectMotionPreference}
          className="w-full h-full"
        />
      </div>

      {/* Conversation History (Collapsible) */}
      {conversation.length > 1 && (
        <div className="bg-dark-800/90 border-t border-neon-cyan/30 p-2">
          <details className="text-xs">
            <summary className="font-mono text-neon-cyan cursor-pointer mb-2">
              Recent Messages ({conversation.length})
            </summary>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {conversation.slice(-5).map((turn, index) => (
                <div key={index} className="text-xs text-gray-400">
                  <span className="text-neon-cyan">
                    {turn.role === 'user' ? 'You' : 'Stotteyman'}:
                  </span>{' '}
                  {turn.content.slice(0, 60)}...
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Floating Elements (Reduced for mobile) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: respectMotionPreference 
                ? 'none' 
                : `flicker ${3 + Math.random() * 2}s infinite linear`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanlines opacity-20" />
    </div>
  );
}
