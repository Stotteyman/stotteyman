import { useState, useEffect } from 'react';

export interface ReducedMotionState {
  prefersReducedMotion: boolean;
  respectMotionPreference: boolean;
}

export function useReducedMotion(): ReducedMotionState {
  const [state, setState] = useState<ReducedMotionState>({
    prefersReducedMotion: false,
    respectMotionPreference: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updatePreference = () => {
      setState(prev => ({
        ...prev,
        prefersReducedMotion: mediaQuery.matches,
      }));
    };

    // Set initial value
    updatePreference();

    // Listen for changes
    mediaQuery.addEventListener('change', updatePreference);

    return () => {
      mediaQuery.removeEventListener('change', updatePreference);
    };
  }, []);

  return state;
}

// Helper function to get animation duration based on motion preference
export function getAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0,
  respectMotionPreference: boolean = true
): number {
  if (!respectMotionPreference) {
    return normalDuration;
  }

  const mediaQuery = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  return mediaQuery.matches ? reducedDuration : normalDuration;
}

// Helper function to conditionally apply animations
export function shouldAnimate(
  respectMotionPreference: boolean = true
): boolean {
  if (!respectMotionPreference) {
    return true;
  }

  const mediaQuery = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  return !mediaQuery.matches;
}

// CSS class helper for reduced motion
export function getMotionClasses(
  normalClass: string,
  reducedClass: string = '',
  respectMotionPreference: boolean = true
): string {
  if (!respectMotionPreference) {
    return normalClass;
  }

  const mediaQuery = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  return mediaQuery.matches ? reducedClass : normalClass;
}
