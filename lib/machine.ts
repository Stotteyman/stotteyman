import { createMachine, assign } from 'xstate';

export type ScreenState = 'intro' | 'start' | 'menu' | 'play' | 'settings';

export interface GameContext {
  playerId?: string;
  sessionId?: string;
  deviceType: 'desktop' | 'mobile';
  introSeen: boolean;
  currentScreen: ScreenState;
  isPlaying: boolean;
  error?: string;
}

export type GameEvent =
  | { type: 'INTRO_COMPLETE' }
  | { type: 'INTRO_SKIP' }
  | { type: 'START_GAME' }
  | { type: 'SHOW_MENU' }
  | { type: 'PLAY' }
  | { type: 'SETTINGS' }
  | { type: 'BACK' }
  | { type: 'QUIT' }
  | { type: 'ERROR'; error: string }
  | { type: 'SET_PLAYER'; playerId: string }
  | { type: 'SET_SESSION'; sessionId: string }
  | { type: 'SET_DEVICE'; deviceType: 'desktop' | 'mobile' }
  | { type: 'SET_INTRO_SEEN'; seen: boolean };

export const gameMachine = createMachine({
  id: 'game',
  initial: 'intro',
  context: {
    playerId: undefined,
    sessionId: undefined,
    deviceType: 'desktop',
    introSeen: false,
    currentScreen: 'intro',
    isPlaying: false,
    error: undefined,
  },
  states: {
    intro: {
      entry: assign({
        currentScreen: 'intro',
        isPlaying: false,
      }),
      on: {
        INTRO_COMPLETE: {
          target: 'start',
          actions: assign({
            introSeen: true,
          }),
        },
        INTRO_SKIP: {
          target: 'start',
          actions: assign({
            introSeen: true,
          }),
        },
        ERROR: {
          target: 'start',
          actions: assign({
            error: (context: any, event: any) => event.error,
          }),
        },
      },
    },
    start: {
      entry: assign({
        currentScreen: 'start',
        isPlaying: false,
      }),
      on: {
        START_GAME: 'menu',
        SHOW_MENU: 'menu',
        PLAY: 'play',
        ERROR: {
          target: 'start',
          actions: assign({
            error: (context: any, event: any) => event.error,
          }),
        },
      },
    },
    menu: {
      entry: assign({
        currentScreen: 'menu',
        isPlaying: false,
      }),
      on: {
        PLAY: 'play',
        SETTINGS: 'settings',
        BACK: 'start',
        QUIT: 'start',
        ERROR: {
          target: 'menu',
          actions: assign({
            error: (context: any, event: any) => event.error,
          }),
        },
      },
    },
    play: {
      entry: assign({
        currentScreen: 'play',
        isPlaying: true,
      }),
      on: {
        SHOW_MENU: 'menu',
        BACK: 'menu',
        QUIT: 'start',
        ERROR: {
          target: 'play',
          actions: assign({
            error: (context: any, event: any) => event.error,
          }),
        },
      },
    },
    settings: {
      entry: assign({
        currentScreen: 'settings',
        isPlaying: false,
      }),
      on: {
        BACK: 'menu',
        QUIT: 'start',
        ERROR: {
          target: 'settings',
          actions: assign({
            error: (context: any, event: any) => event.error,
          }),
        },
      },
    },
  },
  on: {
    SET_PLAYER: {
      actions: assign({
        playerId: (context: any, event: any) => event.playerId,
      }),
    },
    SET_SESSION: {
      actions: assign({
        sessionId: (context: any, event: any) => event.sessionId,
      }),
    },
    SET_DEVICE: {
      actions: assign({
        deviceType: (context: any, event: any) => event.deviceType,
      }),
    },
    SET_INTRO_SEEN: {
      actions: assign({
        introSeen: (context: any, event: any) => event.seen,
      }),
    },
  },
});

// Helper functions for state management
export function canSkipIntro(context: GameContext): boolean {
  return context.introSeen;
}

export function getCurrentScreen(context: GameContext): ScreenState {
  return context.currentScreen;
}

export function isPlaying(context: GameContext): boolean {
  return context.isPlaying;
}

export function getDeviceType(context: GameContext): 'desktop' | 'mobile' {
  return context.deviceType;
}
