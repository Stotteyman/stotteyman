import { useState, useEffect, useCallback } from 'react';

export interface GamepadState {
  connected: boolean;
  gamepads: Gamepad[];
  lastPressed: {
    button?: number;
    axis?: number;
    value?: number;
  };
}

export interface GamepadButton {
  pressed: boolean;
  touched: boolean;
  value: number;
}

export interface GamepadAxis {
  value: number;
  deadzone: number;
}

const DEADZONE = 0.15;
const POLLING_INTERVAL = 16; // ~60fps

export function useGamepad() {
  const [gamepadState, setGamepadState] = useState<GamepadState>({
    connected: false,
    gamepads: [],
    lastPressed: {},
  });

  const [isPolling, setIsPolling] = useState(false);

  // Get current gamepad state
  const getGamepads = useCallback((): Gamepad[] => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      return [];
    }
    
    const gamepads = navigator.getGamepads();
    return Array.from(gamepads).filter((gamepad): gamepad is Gamepad => gamepad !== null);
  }, []);

  // Check for button presses
  const checkButtonPress = useCallback((
    currentButton: GamepadButton,
    buttonIndex: number,
    previousState?: GamepadButton
  ): boolean => {
    const wasPressed = previousState?.pressed || false;
    const isPressed = currentButton.pressed;
    
    return isPressed && !wasPressed;
  }, []);

  // Check for axis movement
  const checkAxisMovement = useCallback((
    gamepad: Gamepad,
    axisIndex: number,
    previousValue?: number
  ): boolean => {
    const currentValue = gamepad.axes[axisIndex];
    const previous = previousValue || 0;
    
    return Math.abs(currentValue - previous) > DEADZONE;
  }, []);

  // Poll gamepads for changes
  const pollGamepads = useCallback(() => {
    const gamepads = getGamepads();
    const connected = gamepads.length > 0;
    
    setGamepadState(prevState => {
      const newState = { ...prevState, gamepads, connected };
      
      // Check for button presses
      gamepads.forEach((gamepad, gamepadIndex) => {
        gamepad.buttons.forEach((button, buttonIndex) => {
          if (checkButtonPress(button, buttonIndex, prevState.gamepads[gamepadIndex]?.buttons[buttonIndex])) {
            newState.lastPressed = {
              button: buttonIndex,
              value: button.value,
            };
          }
        });
        
        // Check for axis movement
        gamepad.axes.forEach((axis, axisIndex) => {
          if (checkAxisMovement(gamepad, axisIndex, prevState.gamepads[gamepadIndex]?.axes[axisIndex])) {
            newState.lastPressed = {
              axis: axisIndex,
              value: axis,
            };
          }
        });
      });
      
      return newState;
    });
  }, [getGamepads, checkButtonPress, checkAxisMovement]);

  // Start/stop polling
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(pollGamepads, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [isPolling, pollGamepads]);

  // Handle gamepad connect/disconnect
  useEffect(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log('Gamepad connected:', event.gamepad.id);
      setIsPolling(true);
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log('Gamepad disconnected:', event.gamepad.id);
      const remainingGamepads = getGamepads();
      if (remainingGamepads.length === 0) {
        setIsPolling(false);
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Check for already connected gamepads
    const initialGamepads = getGamepads();
    if (initialGamepads.length > 0) {
      setIsPolling(true);
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [getGamepads]);

  // Clear last pressed state after a short delay
  useEffect(() => {
    if (gamepadState.lastPressed.button !== undefined || gamepadState.lastPressed.axis !== undefined) {
      const timeout = setTimeout(() => {
        setGamepadState(prev => ({
          ...prev,
          lastPressed: {},
        }));
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [gamepadState.lastPressed]);

  // Gamepad button constants
  const BUTTONS = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    BACK: 8,
    START: 9,
    L3: 10,
    R3: 11,
    UP: 12,
    DOWN: 13,
    LEFT: 14,
    RIGHT: 15,
  };

  const AXES = {
    LEFT_X: 0,
    LEFT_Y: 1,
    RIGHT_X: 2,
    RIGHT_Y: 3,
  };

  // Helper functions
  const isButtonPressed = useCallback((button: number): boolean => {
    return gamepadState.lastPressed.button === button;
  }, [gamepadState.lastPressed.button]);

  const isAxisMoved = useCallback((axis: number): boolean => {
    return gamepadState.lastPressed.axis === axis;
  }, [gamepadState.lastPressed.axis]);

  const getAxisValue = useCallback((axis: number): number => {
    const gamepad = gamepadState.gamepads[0];
    if (!gamepad) return 0;
    
    const value = gamepad.axes[axis];
    return Math.abs(value) > DEADZONE ? value : 0;
  }, [gamepadState.gamepads]);

  const getButtonValue = useCallback((button: number): number => {
    const gamepad = gamepadState.gamepads[0];
    if (!gamepad) return 0;
    
    return gamepad.buttons[button]?.value || 0;
  }, [gamepadState.gamepads]);

  return {
    ...gamepadState,
    BUTTONS,
    AXES,
    isButtonPressed,
    isAxisMoved,
    getAxisValue,
    getButtonValue,
    startPolling: () => setIsPolling(true),
    stopPolling: () => setIsPolling(false),
  };
}
