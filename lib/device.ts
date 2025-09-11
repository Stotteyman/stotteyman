export type DeviceType = 'desktop' | 'mobile';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  hasGamepad: boolean;
  hasWebGL: boolean;
  hasWebAudio: boolean;
  hasSpeechSynthesis: boolean;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      type: 'desktop',
      isMobile: false,
      isDesktop: true,
      hasTouch: false,
      hasGamepad: false,
      hasWebGL: false,
      hasWebAudio: false,
      hasSpeechSynthesis: false,
      userAgent: '',
      viewport: { width: 1920, height: 1080 },
    };
  }

  const userAgent = navigator.userAgent;
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
                   ('ontouchstart' in window) ||
                   (viewport.width <= 768);

  // Feature detection
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasGamepad = 'getGamepads' in navigator;
  const hasWebGL = !!window.WebGLRenderingContext;
  const hasWebAudio = !!(window.AudioContext || (window as any).webkitAudioContext);
  const hasSpeechSynthesis = 'speechSynthesis' in window;

  return {
    type: isMobile ? 'mobile' : 'desktop',
    isMobile,
    isDesktop: !isMobile,
    hasTouch,
    hasGamepad,
    hasWebGL,
    hasWebAudio,
    hasSpeechSynthesis,
    userAgent,
    viewport,
  };
}

export function isMobileDevice(): boolean {
  return detectDevice().isMobile;
}

export function isDesktopDevice(): boolean {
  return detectDevice().isDesktop;
}

export function getDeviceType(): DeviceType {
  return detectDevice().type;
}

// Viewport change handler
export function onViewportChange(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let timeoutId: NodeJS.Timeout;
  
  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback();
    }, 100);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    clearTimeout(timeoutId);
  };
}

// Gamepad detection
export function detectGamepads(): Gamepad[] {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) {
    return [];
  }
  
  const gamepads = navigator.getGamepads();
  return Array.from(gamepads).filter((gamepad): gamepad is Gamepad => gamepad !== null);
}

export function onGamepadChange(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let animationFrameId: number;
  let lastGamepadCount = 0;

  const checkGamepads = () => {
    const gamepads = detectGamepads();
    if (gamepads.length !== lastGamepadCount) {
      lastGamepadCount = gamepads.length;
      callback();
    }
    animationFrameId = requestAnimationFrame(checkGamepads);
  };

  checkGamepads();

  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}
