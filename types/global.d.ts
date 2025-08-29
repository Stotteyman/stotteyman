import { GSAPTimeline } from 'gsap'

declare global {
  interface Window {
    gsap?: typeof import('gsap')
    ScrollTrigger?: typeof import('gsap/ScrollTrigger')
    performance: Performance & {
      memory?: {
        usedJSHeapSize: number
        totalJSHeapSize: number
        jsHeapSizeLimit: number
      }
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': any
    }
  }
}

// CSS Module declarations
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

// Animation library augmentations
declare module 'framer-motion' {
  interface AnimationProps {
    layoutId?: string
  }
}

// Three.js augmentations
declare module 'three' {
  interface WebGLRenderer {
    info: {
      memory: {
        geometries: number
        textures: number
      }
      render: {
        frame: number
        calls: number
        triangles: number
        points: number
        lines: number
      }
    }
  }
}

export {}