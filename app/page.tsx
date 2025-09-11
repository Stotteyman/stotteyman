'use client';

import { useEffect, useState } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine, type GameContext } from '@/lib/machine';
import { detectDevice } from '@/lib/device';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import IntroVideo from '@/components/IntroVideo';
import StartScreen from '@/components/StartScreen';
import MainMenu from '@/components/MainMenu';
import GameShell from '@/components/GameShell';
import MobileGameShell from '@/components/MobileGameShell';
import AudioBus from '@/components/AudioBus';

export default function HomePage() {
  const [state, send] = useMachine(gameMachine);
  const { respectMotionPreference } = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Device detection
  useEffect(() => {
    if (!isClient) return;

    const deviceInfo = detectDevice();
    send({ type: 'SET_DEVICE', deviceType: deviceInfo.type });

    // Check for intro seen in localStorage
    const introSeen = localStorage.getItem('stotteyman_intro_seen') === 'true';
    if (introSeen) {
      send({ type: 'SET_INTRO_SEEN', seen: true });
    }
  }, [isClient, send]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', ' '].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'Escape':
          send({ type: 'BACK' });
          break;
        case 'Enter':
        case ' ':
          if (state.matches('start')) {
            send({ type: 'START_GAME' });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClient, send, state]);

  // Handle visibility change (pause/resume)
  useEffect(() => {
    if (!isClient) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause game when tab is hidden
        send({ type: 'QUIT' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isClient, send]);

  // Don't render until client-side hydration
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="spinner"></div>
      </div>
    );
  }

  // Debug logging (disabled for production)
  // console.log('Current state:', state.value, 'Context:', state.context);

  const context = state.context as GameContext;
  const isMobile = context.deviceType === 'mobile';

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Audio System */}
      <AudioBus />
      
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 scanlines" />
      
      {/* Main Content */}
      <main className="relative z-10 w-full h-full">
        {state.matches('intro') && (
          <IntroVideo
            onComplete={() => send({ type: 'INTRO_COMPLETE' })}
            onSkip={() => send({ type: 'INTRO_SKIP' })}
            canSkip={context.introSeen}
            respectMotionPreference={respectMotionPreference}
          />
        )}
        
        {state.matches('start') && (
          <StartScreen
            onStart={() => send({ type: 'START_GAME' })}
            respectMotionPreference={respectMotionPreference}
          />
        )}
        
        {state.matches('menu') && (
          <MainMenu
            onPlay={() => send({ type: 'PLAY' })}
            onSettings={() => send({ type: 'SETTINGS' })}
            onBack={() => send({ type: 'BACK' })}
            respectMotionPreference={respectMotionPreference}
          />
        )}
        
        {state.matches('play') && (
          isMobile ? (
            <MobileGameShell
              playerId={context.playerId}
              sessionId={context.sessionId}
              onBack={() => send({ type: 'BACK' })}
              respectMotionPreference={respectMotionPreference}
            />
          ) : (
            <GameShell
              playerId={context.playerId}
              sessionId={context.sessionId}
              onBack={() => send({ type: 'BACK' })}
              respectMotionPreference={respectMotionPreference}
            />
          )
        )}
        
        {state.matches('settings') && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="card-neon max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-neon-cyan mb-6 text-center">
                Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-mono">Sound Effects</label>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-neon-cyan bg-dark-800 border-neon-cyan rounded focus:ring-neon-cyan"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-white font-mono">Voice Synthesis</label>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-neon-cyan bg-dark-800 border-neon-cyan rounded focus:ring-neon-cyan"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-white font-mono">Reduced Motion</label>
                  <input
                    type="checkbox"
                    checked={respectMotionPreference}
                    readOnly
                    className="w-4 h-4 text-neon-cyan bg-dark-800 border-neon-cyan rounded focus:ring-neon-cyan"
                  />
                </div>
              </div>
              <button
                onClick={() => send({ type: 'BACK' })}
                className="btn-neon w-full mt-6"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Error Display */}
      {context.error && (
        <div className="absolute bottom-4 right-4 bg-red-900 border border-red-500 text-red-100 px-4 py-2 rounded font-mono text-sm">
          Error: {context.error}
        </div>
      )}
      
      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-dark-800 border border-neon-cyan text-neon-cyan px-2 py-1 rounded font-mono text-xs">
          State: {String(state.value)} | Device: {context.deviceType}
        </div>
      )}
    </div>
  );
}
