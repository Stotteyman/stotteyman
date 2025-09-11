'use client';

import { useMachine } from '@xstate/react';
import { gameMachine } from '@/lib/machine';

export default function TestPage() {
  const [state, send] = useMachine(gameMachine);

  return (
    <div className="min-h-screen bg-dark-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">State Machine Test</h1>
      
      <div className="mb-4">
        <p><strong>Current State:</strong> {String(state.value)}</p>
        <p><strong>Context:</strong> {JSON.stringify(state.context, null, 2)}</p>
      </div>

      <div className="space-y-2">
        <button 
          onClick={() => send({ type: 'INTRO_COMPLETE' })}
          className="btn-neon px-4 py-2 mr-2"
        >
          Complete Intro
        </button>
        
        <button 
          onClick={() => send({ type: 'START_GAME' })}
          className="btn-neon px-4 py-2 mr-2"
        >
          Start Game
        </button>
        
        <button 
          onClick={() => send({ type: 'PLAY' })}
          className="btn-neon px-4 py-2 mr-2"
        >
          Play
        </button>
        
        <button 
          onClick={() => send({ type: 'BACK' })}
          className="btn-neon px-4 py-2 mr-2"
        >
          Back
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Available States:</h2>
        <ul className="list-disc list-inside">
          <li>intro</li>
          <li>start</li>
          <li>menu</li>
          <li>play</li>
          <li>settings</li>
        </ul>
      </div>
    </div>
  );
}
