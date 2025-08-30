/**
 * Animation Queue - Manages sequential and parallel animation execution
 * Provides sophisticated queuing, prioritization, and batch processing
 */

import type { AnimationConfig } from '@/types/animations'
import { getAnimationManager } from './AnimationManager'

export interface QueuedAnimation {
  id: string
  config: AnimationConfig
  priority: number
  dependencies: string[]
  retryCount: number
  maxRetries: number
  createdAt: number
  scheduledAt?: number
  callback?: (animationId: string) => void
  onError?: (error: Error) => void
}

export interface AnimationBatch {
  id: string
  animations: QueuedAnimation[]
  parallel: boolean
  createdAt: number
  onComplete?: () => void
  onError?: (error: Error) => void
}

export class AnimationQueue {
  private static instance: AnimationQueue | null = null
  private queue: QueuedAnimation[] = []
  private running: Map<string, Promise<string>> = new Map()
  private batches: Map<string, AnimationBatch> = new Map()
  private completed: Set<string> = new Set()
  private failed: Set<string> = new Set()
  private isProcessing = false
  private maxConcurrent = 5
  private processingInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startProcessing()
  }

  static getInstance(): AnimationQueue {
    if (!AnimationQueue.instance) {
      AnimationQueue.instance = new AnimationQueue()
    }
    return AnimationQueue.instance
  }

  /**
   * Add a single animation to the queue
   */
  enqueue(
    config: AnimationConfig,
    options: {
      priority?: number
      dependencies?: string[]
      callback?: (animationId: string) => void
      onError?: (error: Error) => void
      maxRetries?: number
    } = {}
  ): string {
    const queuedAnimation: QueuedAnimation = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      config,
      priority: options.priority || 0,
      dependencies: options.dependencies || [],
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: Date.now(),
      ...(options.callback && { callback: options.callback }),
      ...(options.onError && { onError: options.onError })
    }

    // Insert in priority order (higher priority first)
    const insertIndex = this.queue.findIndex(item => item.priority < queuedAnimation.priority)
    if (insertIndex === -1) {
      this.queue.push(queuedAnimation)
    } else {
      this.queue.splice(insertIndex, 0, queuedAnimation)
    }

    return queuedAnimation.id
  }

  /**
   * Add a batch of animations to be executed together
   */
  enqueueBatch(
    animations: Array<{
      config: AnimationConfig
      priority?: number
      dependencies?: string[]
      callback?: (animationId: string) => void
      onError?: (error: Error) => void
      maxRetries?: number
    }>,
    options: {
      parallel?: boolean
      onComplete?: () => void
      onError?: (error: Error) => void
    } = {}
  ): string {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const queuedAnimations: QueuedAnimation[] = animations.map((anim, index) => ({
      id: `${batchId}_${index}`,
      config: anim.config,
      priority: anim.priority || 0,
      dependencies: anim.dependencies || [],
      retryCount: 0,
      maxRetries: anim.maxRetries || 3,
      createdAt: Date.now(),
      ...(anim.callback && { callback: anim.callback }),
      ...(anim.onError && { onError: anim.onError })
    }))

    const batch: AnimationBatch = {
      id: batchId,
      animations: queuedAnimations,
      parallel: options.parallel || false,
      createdAt: Date.now(),
      ...(options.onComplete && { onComplete: options.onComplete }),
      ...(options.onError && { onError: options.onError })
    }

    this.batches.set(batchId, batch)

    // Add animations to queue
    if (batch.parallel) {
      // For parallel execution, add all animations with same priority
      queuedAnimations.forEach(anim => {
        this.queue.push(anim)
      })
    } else {
      // For sequential execution, add animations in order
      queuedAnimations.forEach((anim, index) => {
        if (index > 0) {
          // Add dependency on previous animation
          const prevAnimation = queuedAnimations[index - 1]
          if (prevAnimation) {
            anim.dependencies.push(prevAnimation.id)
          }
        }
        this.queue.push(anim)
      })
    }

    // Sort queue by priority
    this.queue.sort((a, b) => b.priority - a.priority)

    return batchId
  }

  /**
   * Remove animation from queue
   */
  dequeue(animationId: string): boolean {
    const index = this.queue.findIndex(item => item.id === animationId)
    if (index !== -1) {
      this.queue.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Clear all animations from queue
   */
  clear(): void {
    this.queue = []
    this.batches.clear()
    this.completed.clear()
    this.failed.clear()
    
    // Cancel running animations
    this.running.forEach(async (_promise, id) => {
      try {
        const animationManager = getAnimationManager()
        await animationManager.stop(id)
      } catch (error) {
        console.warn('Failed to stop animation:', error)
      }
    })
    this.running.clear()
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isProcessing = false
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    if (!this.isProcessing) {
      this.startProcessing()
    }
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queued: number
    running: number
    completed: number
    failed: number
    batches: number
  } {
    return {
      queued: this.queue.length,
      running: this.running.size,
      completed: this.completed.size,
      failed: this.failed.size,
      batches: this.batches.size
    }
  }

  /**
   * Set maximum concurrent animations
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, max)
  }

  /**
   * Get next available animation to process
   */
  private getNextAnimation(): QueuedAnimation | null {
    // Find animation with no unresolved dependencies
    for (const animation of this.queue) {
      const unresolvedDeps = animation.dependencies.filter(dep => 
        !this.completed.has(dep) && !this.failed.has(dep)
      )
      
      if (unresolvedDeps.length === 0) {
        return animation
      }
    }
    
    return null
  }

  /**
   * Start processing the queue
   */
  private startProcessing(): void {
    this.isProcessing = true
    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, 16) // ~60fps processing
  }

  /**
   * Process the animation queue
   */
  private async processQueue(): Promise<void> {
    if (!this.isProcessing || this.running.size >= this.maxConcurrent) {
      return
    }

    const nextAnimation = this.getNextAnimation()
    if (!nextAnimation) {
      return
    }

    // Remove from queue
    const index = this.queue.indexOf(nextAnimation)
    if (index !== -1) {
      this.queue.splice(index, 1)
    }

    // Start animation
    try {
      nextAnimation.scheduledAt = Date.now()
      const animationManager = getAnimationManager()
      const animationPromise = animationManager.play(nextAnimation.id).then(() => nextAnimation.id)
      this.running.set(nextAnimation.id, animationPromise)

      const animationId = await animationPromise
      
      // Animation completed successfully
      this.running.delete(nextAnimation.id)
      this.completed.add(nextAnimation.id)
      
      if (nextAnimation.callback) {
        nextAnimation.callback(animationId)
      }

      // Check if batch is complete
      this.checkBatchCompletion(nextAnimation.id)

    } catch (error) {
      // Animation failed
      this.running.delete(nextAnimation.id)
      
      if (nextAnimation.retryCount < nextAnimation.maxRetries) {
        // Retry animation
        nextAnimation.retryCount++
        this.queue.unshift(nextAnimation) // Add back to front of queue
      } else {
        // Max retries reached
        this.failed.add(nextAnimation.id)
        
        if (nextAnimation.onError) {
          nextAnimation.onError(error as Error)
        }

        // Check if batch failed
        this.checkBatchCompletion(nextAnimation.id)
      }
    }
  }

  /**
   * Check if a batch is complete
   */
  private checkBatchCompletion(animationId: string): void {
    // Find batch containing this animation
    for (const [batchId, batch] of this.batches) {
      const animationInBatch = batch.animations.find(anim => anim.id === animationId)
      if (!animationInBatch) continue

      // Check if all animations in batch are complete or failed
      const allComplete = batch.animations.every(anim => 
        this.completed.has(anim.id) || this.failed.has(anim.id)
      )

      if (allComplete) {
        const anyFailed = batch.animations.some(anim => this.failed.has(anim.id))
        
        if (anyFailed && batch.onError) {
          batch.onError(new Error(`Batch ${batchId} failed`))
        } else if (!anyFailed && batch.onComplete) {
          batch.onComplete()
        }

        // Remove completed batch
        this.batches.delete(batchId)
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStatistics(): {
    totalProcessed: number
    successRate: number
    averageWaitTime: number
    averageExecutionTime: number
    currentLoad: number
  } {
    const totalProcessed = this.completed.size + this.failed.size
    const successRate = totalProcessed > 0 ? this.completed.size / totalProcessed : 0
    
    // Calculate average wait time (simplified)
    const currentTime = Date.now()
    const averageWaitTime = this.queue.length > 0 
      ? this.queue.reduce((sum, anim) => sum + (currentTime - anim.createdAt), 0) / this.queue.length
      : 0

    return {
      totalProcessed,
      successRate,
      averageWaitTime,
      averageExecutionTime: 0, // Would need to track execution times
      currentLoad: this.running.size / this.maxConcurrent
    }
  }

  /**
   * Priority levels for common use cases
   */
  static readonly Priority = {
    CRITICAL: 100,    // Critical UI feedback
    HIGH: 75,         // User interactions
    NORMAL: 50,       // Standard animations
    LOW: 25,          // Background effects
    IDLE: 0           // Non-essential animations
  } as const

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.pause()
    this.clear()
    AnimationQueue.instance = null
  }
}