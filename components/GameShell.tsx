'use client';

import { useState, useEffect, useRef } from 'react';
import { useGamepad } from '@/hooks/useGamepad';
import WireHead from './WireHead';
import Dialogue from './Dialogue';
import { playUISound } from './AudioBus';

interface GameShellProps {
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

export default function GameShell({ 
  playerId, 
  sessionId, 
  onBack, 
  respectMotionPreference = false 
}: GameShellProps) {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState({ arousal: 0.5, valence: 0.5 });
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
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
      className={`relative w-full h-screen bg-dark-900 overflow-hidden flex ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-1000`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute inset-0 scanlines opacity-20" />

      {/* Left Panel - 3D Wireframe Head */}
      <div className="w-1/2 h-full relative">
        <div className="absolute inset-0 p-8">
          <div className="w-full h-full bg-dark-800/50 border border-neon-cyan/30 rounded-lg overflow-hidden">
            <WireHead
              emotion={currentEmotion}
              isBreathing={!isLoading}
              respectMotionPreference={respectMotionPreference}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Emotion Indicator */}
        <div className="absolute top-4 left-4 bg-dark-800/90 border border-neon-cyan/50 rounded-lg p-3">
          <div className="text-xs font-mono text-neon-cyan mb-2">Emotion State</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Arousal:</span>
              <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon-cyan transition-all duration-300"
                  style={{ width: `${currentEmotion.arousal * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Valence:</span>
              <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon-pink transition-all duration-300"
                  style={{ width: `${currentEmotion.valence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute bottom-4 left-4 bg-dark-800/90 border border-neon-cyan/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="spinner w-4 h-4" />
              <span className="text-xs font-mono text-neon-cyan">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Dialogue */}
      <div className="w-1/2 h-full relative">
        <div className="absolute inset-0 p-8">
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

        {/* Back Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onBack}
            className="btn-neon px-4 py-2 text-sm font-mono"
            aria-label="Go back to menu"
          >
            ← Back
          </button>
        </div>

        {/* Conversation History */}
        {conversation.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-dark-800/90 border border-neon-cyan/50 rounded-lg p-3 max-w-xs">
            <div className="text-xs font-mono text-neon-cyan mb-2">Recent Messages</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {conversation.slice(-3).map((turn, index) => (
                <div key={index} className="text-xs text-gray-400 truncate">
                  <span className="text-neon-cyan">
                    {turn.role === 'user' ? 'You' : 'Stotteyman'}:
                  </span>{' '}
                  {turn.content.slice(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan opacity-20"
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

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanlines opacity-30" />
    </div>
  );
}
