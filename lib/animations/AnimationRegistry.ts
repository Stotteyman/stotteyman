/**
 * Animation Registry - Central registry for all animation types and configurations
 * Provides a unified interface for managing animation presets and custom animations
 */

import type { AnimationConfig } from '@/types/animations'

export interface AnimationPreset {
  id: string
  name: string
  description: string
  config: Omit<AnimationConfig, 'id'>
  category: 'entrance' | 'exit' | 'hover' | 'scroll' | 'loading' | 'transition'
  complexity: 'low' | 'medium' | 'high'
  performance: {
    cpuIntensive: boolean
    memoryUsage: 'low' | 'medium' | 'high'
    gpuAccelerated: boolean
  }
}

export class AnimationRegistry {
  private static instance: AnimationRegistry
  private presets: Map<string, AnimationPreset> = new Map()
  private customAnimations: Map<string, AnimationConfig> = new Map()

  private constructor() {
    this.initializeDefaultPresets()
  }

  static getInstance(): AnimationRegistry {
    if (!AnimationRegistry.instance) {
      AnimationRegistry.instance = new AnimationRegistry()
    }
    return AnimationRegistry.instance
  }

  private initializeDefaultPresets(): void {
    // Entrance Animations
    this.registerPreset({
      id: 'fade-in',
      name: 'Fade In',
      description: 'Simple fade in animation',
      category: 'entrance',
      complexity: 'low',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        gpuAccelerated: true
      },
      config: {
        name: 'Fade In',
        type: 'entrance',
        duration: 0.6,
        easing: 'power2.out',
        delay: 0,
        stagger: 0.1,
        properties: [
          { property: 'opacity', from: 0, to: 1 }
        ]
      }
    })

    this.registerPreset({
      id: 'slide-up',
      name: 'Slide Up',
      description: 'Slide up from bottom with fade',
      category: 'entrance',
      complexity: 'low',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        gpuAccelerated: true
      },
      config: {
        name: 'Slide Up',
        type: 'entrance',
        duration: 0.8,
        easing: 'power3.out',
        delay: 0,
        stagger: 0.15,
        properties: [
          { property: 'opacity', from: 0, to: 1 },
          { property: 'y', from: 50, to: 0, unit: 'px' }
        ]
      }
    })

    this.registerPreset({
      id: 'scale-in',
      name: 'Scale In',
      description: 'Scale from small to normal size',
      category: 'entrance',
      complexity: 'medium',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        gpuAccelerated: true
      },
      config: {
        name: 'Scale In',
        type: 'entrance',
        duration: 0.7,
        easing: 'back.out(1.7)',
        delay: 0,
        stagger: 0.1,
        properties: [
          { property: 'opacity', from: 0, to: 1 },
          { property: 'scale', from: 0.8, to: 1 }
        ]
      }
    })

    this.registerPreset({
      id: 'bounce-in',
      name: 'Bounce In',
      description: 'Bouncy entrance animation',
      category: 'entrance',
      complexity: 'medium',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'medium',
        gpuAccelerated: true
      },
      config: {
        name: 'Bounce In',
        type: 'entrance',
        duration: 1.2,
        easing: 'elastic.out(1, 0.3)',
        delay: 0,
        stagger: 0.2,
        properties: [
          { property: 'opacity', from: 0, to: 1 },
          { property: 'scale', from: 0.3, to: 1 },
          { property: 'y', from: -100, to: 0, unit: 'px' }
        ]
      }
    })

    // Hover Animations
    this.registerPreset({
      id: 'lift-hover',
      name: 'Lift on Hover',
      description: 'Subtle lift effect with shadow',
      category: 'hover',
      complexity: 'low',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        gpuAccelerated: true
      },
      config: {
        name: 'Lift Hover',
        type: 'hover',
        duration: 0.3,
        easing: 'power2.out',
        delay: 0,
        stagger: 0,
        properties: [
          { property: 'y', from: 0, to: -8, unit: 'px' },
          { property: 'boxShadow', from: '0 4px 8px rgba(0,0,0,0.1)', to: '0 12px 24px rgba(0,0,0,0.15)' }
        ]
      }
    })

    this.registerPreset({
      id: 'glow-hover',
      name: 'Glow on Hover',
      description: 'Glowing border effect',
      category: 'hover',
      complexity: 'medium',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'medium',
        gpuAccelerated: true
      },
      config: {
        name: 'Glow Hover',
        type: 'hover',
        duration: 0.4,
        easing: 'power2.inOut',
        delay: 0,
        stagger: 0,
        properties: [
          { property: 'boxShadow', from: '0 0 0 rgba(59, 130, 246, 0)', to: '0 0 20px rgba(59, 130, 246, 0.5)' },
          { property: 'borderColor', from: 'transparent', to: 'rgb(59, 130, 246)' }
        ]
      }
    })

    // Scroll Animations
    this.registerPreset({
      id: 'parallax-scroll',
      name: 'Parallax Scroll',
      description: 'Parallax scrolling effect',
      category: 'scroll',
      complexity: 'high',
      performance: {
        cpuIntensive: true,
        memoryUsage: 'high',
        gpuAccelerated: true
      },
      config: {
        name: 'Parallax Scroll',
        type: 'scroll',
        duration: 1,
        easing: 'none',
        delay: 0,
        stagger: 0,
        properties: [
          { property: 'y', from: 0, to: -100, unit: 'px' }
        ]
      }
    })

    // Loading Animations
    this.registerPreset({
      id: 'pulse-loading',
      name: 'Pulse Loading',
      description: 'Pulsing opacity animation',
      category: 'loading',
      complexity: 'low',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        gpuAccelerated: true
      },
      config: {
        name: 'Pulse Loading',
        type: 'entrance',
        duration: 1.5,
        easing: 'power2.inOut',
        delay: 0,
        stagger: 0,
        properties: [
          { property: 'opacity', from: 0.3, to: 1 }
        ]
      }
    })

    // Exit Animations
    this.registerPreset({
      id: 'fade-out',
      name: 'Fade Out',
      description: 'Simple fade out animation',
      category: 'exit',
      complexity: 'low',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        gpuAccelerated: true
      },
      config: {
        name: 'Fade Out',
        type: 'exit',
        duration: 0.4,
        easing: 'power2.in',
        delay: 0,
        stagger: 0,
        properties: [
          { property: 'opacity', from: 1, to: 0 }
        ]
      }
    })

    this.registerPreset({
      id: 'slide-out-down',
      name: 'Slide Out Down',
      description: 'Slide down and fade out',
      category: 'exit',
      complexity: 'low',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'low',
        gpuAccelerated: true
      },
      config: {
        name: 'Slide Out Down',
        type: 'exit',
        duration: 0.5,
        easing: 'power2.in',
        delay: 0,
        stagger: 0,
        properties: [
          { property: 'opacity', from: 1, to: 0 },
          { property: 'y', from: 0, to: 30, unit: 'px' }
        ]
      }
    })
  }

  registerPreset(preset: AnimationPreset): void {
    this.presets.set(preset.id, preset)
  }

  getPreset(id: string): AnimationPreset | undefined {
    return this.presets.get(id)
  }

  getPresetsByCategory(category: AnimationPreset['category']): AnimationPreset[] {
    return Array.from(this.presets.values()).filter(preset => preset.category === category)
  }

  getPresetsByComplexity(complexity: AnimationPreset['complexity']): AnimationPreset[] {
    return Array.from(this.presets.values()).filter(preset => preset.complexity === complexity)
  }

  getAllPresets(): AnimationPreset[] {
    return Array.from(this.presets.values())
  }

  createAnimationConfig(presetId: string, overrides?: Partial<AnimationConfig>): AnimationConfig | null {
    const preset = this.getPreset(presetId)
    if (!preset) return null

    const config: AnimationConfig = {
      id: `${presetId}_${Date.now()}`,
      ...preset.config,
      ...overrides
    }

    return config
  }

  registerCustomAnimation(id: string, config: AnimationConfig): void {
    this.customAnimations.set(id, config)
  }

  getCustomAnimation(id: string): AnimationConfig | undefined {
    return this.customAnimations.get(id)
  }

  removeCustomAnimation(id: string): boolean {
    return this.customAnimations.delete(id)
  }

  getOptimizedPresets(quality: 'low' | 'medium' | 'high'): AnimationPreset[] {
    const allPresets = this.getAllPresets()
    
    switch (quality) {
      case 'low':
        return allPresets.filter(preset => 
          preset.complexity === 'low' && 
          !preset.performance.cpuIntensive &&
          preset.performance.memoryUsage === 'low'
        )
      
      case 'medium':
        return allPresets.filter(preset => 
          preset.complexity !== 'high' &&
          preset.performance.memoryUsage !== 'high'
        )
      
      case 'high':
        return allPresets
      
      default:
        return allPresets.filter(preset => preset.complexity === 'low')
    }
  }

  searchPresets(query: string): AnimationPreset[] {
    const lowercaseQuery = query.toLowerCase()
    return Array.from(this.presets.values()).filter(preset =>
      preset.name.toLowerCase().includes(lowercaseQuery) ||
      preset.description.toLowerCase().includes(lowercaseQuery) ||
      preset.category.toLowerCase().includes(lowercaseQuery)
    )
  }

  validateAnimationConfig(config: AnimationConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.id || config.id.trim() === '') {
      errors.push('Animation ID is required')
    }

    if (!config.name || config.name.trim() === '') {
      errors.push('Animation name is required')
    }

    if (config.duration <= 0) {
      errors.push('Duration must be greater than 0')
    }

    if (config.delay && config.delay < 0) {
      errors.push('Delay cannot be negative')
    }

    if (!config.properties || config.properties.length === 0) {
      errors.push('At least one animation property is required')
    }

    config.properties?.forEach((prop, index) => {
      if (!prop.property || prop.property.trim() === '') {
        errors.push(`Property ${index + 1}: property name is required`)
      }
      
      if (prop.from === undefined || prop.from === null) {
        errors.push(`Property ${index + 1}: 'from' value is required`)
      }
      
      if (prop.to === undefined || prop.to === null) {
        errors.push(`Property ${index + 1}: 'to' value is required`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  exportPresets(): string {
    const presetsData = {
      presets: Array.from(this.presets.entries()),
      customAnimations: Array.from(this.customAnimations.entries()),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    
    return JSON.stringify(presetsData, null, 2)
  }

  importPresets(data: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const parsedData = JSON.parse(data)
      const errors: string[] = []
      let imported = 0

      if (parsedData.presets && Array.isArray(parsedData.presets)) {
        parsedData.presets.forEach(([id, preset]: [string, AnimationPreset]) => {
          try {
            this.registerPreset(preset)
            imported++
          } catch (error) {
            errors.push(`Failed to import preset ${id}: ${error}`)
          }
        })
      }

      if (parsedData.customAnimations && Array.isArray(parsedData.customAnimations)) {
        parsedData.customAnimations.forEach(([id, config]: [string, AnimationConfig]) => {
          try {
            this.registerCustomAnimation(id, config)
            imported++
          } catch (error) {
            errors.push(`Failed to import custom animation ${id}: ${error}`)
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
}