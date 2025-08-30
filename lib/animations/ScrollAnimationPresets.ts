/**
 * Scroll Animation Presets - Pre-configured scroll animations for common use cases
 */

import type { ScrollAnimationConfig } from '@/types/animations'

export interface ScrollPreset {
  id: string
  name: string
  description: string
  config: ScrollAnimationConfig
  category: 'entrance' | 'parallax' | 'reveal' | 'interactive'
  complexity: 'low' | 'medium' | 'high'
  performance: {
    cpuIntensive: boolean
    memoryUsage: 'low' | 'medium' | 'high'
    recommendedQuality: 'low' | 'medium' | 'high'
  }
}

export class ScrollAnimationPresets {
  private static presets: Map<string, ScrollPreset> = new Map()

  static {
    this.initializePresets()
  }

  private static initializePresets(): void {
    // Entrance Animations
    this.registerPreset({
      id: 'fade-in-up',
      name: 'Fade In Up',
      description: 'Elements fade in while sliding up from below',
      category: 'entrance',
      complexity: 'low',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        recommendedQuality: 'low'
      },
      config: {
        trigger: '',
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: false,
        pin: false,
        animation: {
          from: {
            opacity: 0,
            y: 50,
            scale: 0.95
          },
          to: {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out'
          }
        }
      }
    })

    this.registerPreset({
      id: 'slide-in-left',
      name: 'Slide In Left',
      description: 'Elements slide in from the left side',
      category: 'entrance',
      complexity: 'low',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        recommendedQuality: 'low'
      },
      config: {
        trigger: '',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: false,
        pin: false,
        animation: {
          from: {
            opacity: 0,
            x: -100,
            rotationY: -15
          },
          to: {
            opacity: 1,
            x: 0,
            rotationY: 0,
            duration: 1,
            ease: 'power3.out'
          }
        }
      }
    })

    this.registerPreset({
      id: 'scale-in-bounce',
      name: 'Scale In Bounce',
      description: 'Elements scale in with a bouncy effect',
      category: 'entrance',
      complexity: 'medium',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'medium',
        recommendedQuality: 'medium'
      },
      config: {
        trigger: '',
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: false,
        pin: false,
        animation: {
          from: {
            opacity: 0,
            scale: 0.3,
            rotation: -180
          },
          to: {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 1.2,
            ease: 'elastic.out(1, 0.3)'
          }
        }
      }
    })

    this.registerPreset({
      id: 'flip-in-x',
      name: 'Flip In X',
      description: 'Elements flip in along the X axis',
      category: 'entrance',
      complexity: 'high',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'high',
        recommendedQuality: 'high'
      },
      config: {
        trigger: '',
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: false,
        pin: false,
        animation: {
          from: {
            opacity: 0,
            rotationX: -90,
            transformOrigin: 'center bottom'
          },
          to: {
            opacity: 1,
            rotationX: 0,
            duration: 1,
            ease: 'back.out(1.7)'
          }
        }
      }
    })

    // Parallax Animations
    this.registerPreset({
      id: 'parallax-slow',
      name: 'Slow Parallax',
      description: 'Slow parallax scrolling effect',
      category: 'parallax',
      complexity: 'medium',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'medium',
        recommendedQuality: 'medium'
      },
      config: {
        trigger: '',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        pin: false,
        animation: {
          from: {
            y: 0
          },
          to: {
            y: -50,
            ease: 'none'
          }
        }
      }
    })

    this.registerPreset({
      id: 'parallax-fast',
      name: 'Fast Parallax',
      description: 'Fast parallax scrolling effect',
      category: 'parallax',
      complexity: 'medium',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'medium',
        recommendedQuality: 'medium'
      },
      config: {
        trigger: '',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        pin: false,
        animation: {
          from: {
            y: 0
          },
          to: {
            y: -150,
            ease: 'none'
          }
        }
      }
    })

    this.registerPreset({
      id: 'parallax-rotate',
      name: 'Rotating Parallax',
      description: 'Parallax with rotation effect',
      category: 'parallax',
      complexity: 'high',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'high',
        recommendedQuality: 'high'
      },
      config: {
        trigger: '',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        pin: false,
        animation: {
          from: {
            y: 0,
            rotation: 0
          },
          to: {
            y: -100,
            rotation: 360,
            ease: 'none'
          }
        }
      }
    })

    // Reveal Animations
    this.registerPreset({
      id: 'text-reveal-mask',
      name: 'Text Reveal Mask',
      description: 'Text reveals with a mask effect',
      category: 'reveal',
      complexity: 'high',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'high',
        recommendedQuality: 'high'
      },
      config: {
        trigger: '',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: false,
        pin: false,
        animation: {
          from: {
            clipPath: 'inset(0 100% 0 0)'
          },
          to: {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.5,
            ease: 'power3.inOut'
          }
        }
      }
    })

    this.registerPreset({
      id: 'image-reveal-scale',
      name: 'Image Reveal Scale',
      description: 'Images reveal with scaling effect',
      category: 'reveal',
      complexity: 'medium',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'medium',
        recommendedQuality: 'medium'
      },
      config: {
        trigger: '',
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: false,
        pin: false,
        animation: {
          from: {
            opacity: 0,
            scale: 1.2,
            filter: 'blur(10px)'
          },
          to: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power2.out'
          }
        }
      }
    })

    // Interactive Animations
    this.registerPreset({
      id: 'scroll-progress',
      name: 'Scroll Progress',
      description: 'Animation tied to scroll progress',
      category: 'interactive',
      complexity: 'high',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'high',
        recommendedQuality: 'high'
      },
      config: {
        trigger: '',
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        pin: false,
        animation: {
          from: {
            rotation: 0,
            scale: 1
          },
          to: {
            rotation: 180,
            scale: 1.5,
            ease: 'none'
          }
        }
      }
    })

    this.registerPreset({
      id: 'pin-and-scale',
      name: 'Pin and Scale',
      description: 'Pin element and scale during scroll',
      category: 'interactive',
      complexity: 'high',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'high',
        recommendedQuality: 'high'
      },
      config: {
        trigger: '',
        start: 'top top',
        end: '+=100%',
        scrub: true,
        pin: true,
        animation: {
          from: {
            scale: 1
          },
          to: {
            scale: 2,
            ease: 'none'
          }
        }
      }
    })

    // Staggered Animations
    this.registerPreset({
      id: 'stagger-fade-up',
      name: 'Staggered Fade Up',
      description: 'Multiple elements fade up with stagger',
      category: 'entrance',
      complexity: 'medium',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'medium',
        recommendedQuality: 'medium'
      },
      config: {
        trigger: '',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: false,
        pin: false,
        animation: {
          from: {
            opacity: 0,
            y: 30
          },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
          }
        }
      }
    })

    this.registerPreset({
      id: 'stagger-scale-rotate',
      name: 'Staggered Scale Rotate',
      description: 'Multiple elements scale and rotate with stagger',
      category: 'entrance',
      complexity: 'high',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'high',
        recommendedQuality: 'high'
      },
      config: {
        trigger: '',
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: false,
        pin: false,
        animation: {
          from: {
            opacity: 0,
            scale: 0.5,
            rotation: -45
          },
          to: {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'back.out(1.7)'
          }
        }
      }
    })
  }

  private static registerPreset(preset: ScrollPreset): void {
    this.presets.set(preset.id, preset)
  }

  static getPreset(id: string): ScrollPreset | undefined {
    return this.presets.get(id)
  }

  static getAllPresets(): ScrollPreset[] {
    return Array.from(this.presets.values())
  }

  static getPresetsByCategory(category: ScrollPreset['category']): ScrollPreset[] {
    return Array.from(this.presets.values()).filter(preset => preset.category === category)
  }

  static getPresetsByComplexity(complexity: ScrollPreset['complexity']): ScrollPreset[] {
    return Array.from(this.presets.values()).filter(preset => preset.complexity === complexity)
  }

  static getOptimizedPresets(quality: 'low' | 'medium' | 'high'): ScrollPreset[] {
    return Array.from(this.presets.values()).filter(preset => {
      switch (quality) {
        case 'low':
          return preset.complexity === 'low' && !preset.performance.cpuIntensive
        case 'medium':
          return preset.complexity !== 'high'
        case 'high':
          return true
        default:
          return preset.complexity === 'low'
      }
    })
  }

  static searchPresets(query: string): ScrollPreset[] {
    const lowercaseQuery = query.toLowerCase()
    return Array.from(this.presets.values()).filter(preset =>
      preset.name.toLowerCase().includes(lowercaseQuery) ||
      preset.description.toLowerCase().includes(lowercaseQuery) ||
      preset.category.toLowerCase().includes(lowercaseQuery)
    )
  }

  static createCustomPreset(
    id: string,
    name: string,
    description: string,
    config: ScrollAnimationConfig,
    options: {
      category?: ScrollPreset['category']
      complexity?: ScrollPreset['complexity']
      performance?: ScrollPreset['performance']
    } = {}
  ): void {
    const preset: ScrollPreset = {
      id,
      name,
      description,
      config,
      category: options.category || 'entrance',
      complexity: options.complexity || 'medium',
      performance: options.performance || {
        cpuIntensive: false,
        memoryUsage: 'medium',
        recommendedQuality: 'medium'
      }
    }

    this.registerPreset(preset)
  }

  static removePreset(id: string): boolean {
    return this.presets.delete(id)
  }

  static exportPresets(): string {
    const presetsData = {
      presets: Array.from(this.presets.entries()),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    
    return JSON.stringify(presetsData, null, 2)
  }

  static importPresets(data: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const parsedData = JSON.parse(data)
      const errors: string[] = []
      let imported = 0

      if (parsedData.presets && Array.isArray(parsedData.presets)) {
        parsedData.presets.forEach(([id, preset]: [string, ScrollPreset]) => {
          try {
            this.registerPreset(preset)
            imported++
          } catch (error) {
            errors.push(`Failed to import preset ${id}: ${error}`)
          }
        })
      }

      return {
        success: errors.length === 0,
        imported,
        errors
      }
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to parse import data: ${error}`]
      }
    }
  }

  /**
   * Get preset configuration adjusted for quality level
   */
  static getQualityAdjustedConfig(
    presetId: string,
    quality: 'low' | 'medium' | 'high'
  ): ScrollAnimationConfig | null {
    const preset = this.getPreset(presetId)
    if (!preset) return null

    const config = { ...preset.config }

    // Adjust based on quality
    switch (quality) {
      case 'low':
        // Simplify animations for low quality
        if (config.animation?.to) {
          config.animation.to.duration = Math.min(config.animation.to.duration || 1, 0.5)
          config.animation.to.ease = 'power1.out'
          if (config.animation.to.stagger) {
            config.animation.to.stagger = Math.min(config.animation.to.stagger, 0.05)
          }
        }
        config.scrub = false // Disable scrub for better performance
        break

      case 'medium':
        // Moderate adjustments
        if (config.animation?.to?.duration) {
          config.animation.to.duration = Math.min(config.animation.to.duration, 1)
        }
        break

      case 'high':
        // No restrictions for high quality
        break
    }

    return config
  }
}