import { ParticleSystemProps } from '@/types/animations'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  opacity: number
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private particles: Particle[] = []
  private animationId: number | null = null
  private mouse = { x: 0, y: 0 }
  private isRunning = false
  private config: ParticleSystemProps
  private devicePixelRatio: number

  constructor(canvas: HTMLCanvasElement, config: ParticleSystemProps) {
    this.canvas = canvas
    this.config = {
      count: config.count || 50,
      speed: config.speed || 1,
      size: config.size || { min: 2, max: 6 },
      colors: config.colors || ['#ffffff', '#f0f0f0'],
      interactive: config.interactive !== false,
      density: config.density || 'medium',
      ...config
    }
    this.devicePixelRatio = window.devicePixelRatio || 1

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not get 2D context from canvas')
    }
    this.context = context

    this.setupCanvas()
    this.setupEventListeners()
    this.initializeParticles()
  }

  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect()
    
    // Set actual size in memory (scaled for device pixel ratio)
    this.canvas.width = rect.width * this.devicePixelRatio
    this.canvas.height = rect.height * this.devicePixelRatio
    
    // Scale the drawing context so everything draws at the correct size
    this.context.scale(this.devicePixelRatio, this.devicePixelRatio)
    
    // Set CSS size to maintain correct display size
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
  }

  private setupEventListeners(): void {
    if (!this.config.interactive) return

    const handleMouseMove = (event: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouse.x = event.clientX - rect.left
      this.mouse.y = event.clientY - rect.top
    }

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      const rect = this.canvas.getBoundingClientRect()
      const touch = event.touches[0]
      if (touch) {
        this.mouse.x = touch.clientX - rect.left
        this.mouse.y = touch.clientY - rect.top
      }
    }

    this.canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false })

    // Handle resize
    const handleResize = () => {
      this.setupCanvas()
      this.adjustParticleCount()
    }

    window.addEventListener('resize', handleResize, { passive: true })
  }

  private initializeParticles(): void {
    this.particles = []
    const count = this.getAdjustedParticleCount()

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle())
    }
  }

  private getAdjustedParticleCount(): number {
    const baseCount = this.config.count || 50
    const density = this.config.density || 'medium'
    const densityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 1.5
    }[density]

    // Adjust for screen size
    const screenArea = this.canvas.width * this.canvas.height
    const referenceArea = 1920 * 1080 // Reference screen size
    const areaRatio = Math.min(screenArea / referenceArea, 2) // Cap at 2x

    return Math.floor(baseCount * densityMultiplier * areaRatio)
  }

  private adjustParticleCount(): void {
    const targetCount = this.getAdjustedParticleCount()
    const currentCount = this.particles.length

    if (targetCount > currentCount) {
      // Add particles
      for (let i = currentCount; i < targetCount; i++) {
        this.particles.push(this.createParticle())
      }
    } else if (targetCount < currentCount) {
      // Remove particles
      this.particles.splice(targetCount)
    }
  }

  private createParticle(): Particle {
    const canvasWidth = this.canvas.width / this.devicePixelRatio
    const canvasHeight = this.canvas.height / this.devicePixelRatio

    return {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * (this.config.speed || 1),
      vy: (Math.random() - 0.5) * (this.config.speed || 1),
      size: (this.config.size?.min || 2) + Math.random() * ((this.config.size?.max || 6) - (this.config.size?.min || 2)),
      color: (this.config.colors || ['#ffffff'])[Math.floor(Math.random() * (this.config.colors || ['#ffffff']).length)] || '#ffffff',
      life: 0,
      maxLife: 100 + Math.random() * 200,
      opacity: 0.1 + Math.random() * 0.7
    }
  }

  private updateParticle(particle: Particle): void {
    const canvasWidth = this.canvas.width / this.devicePixelRatio
    const canvasHeight = this.canvas.height / this.devicePixelRatio

    // Update position
    particle.x += particle.vx
    particle.y += particle.vy

    // Interactive behavior
    if (this.config.interactive) {
      const dx = this.mouse.x - particle.x
      const dy = this.mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = 100

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance
        const angle = Math.atan2(dy, dx)
        
        // Repel particles from mouse
        particle.vx -= Math.cos(angle) * force * 0.5
        particle.vy -= Math.sin(angle) * force * 0.5
      }
    }

    // Apply friction
    particle.vx *= 0.99
    particle.vy *= 0.99

    // Boundary behavior - wrap around
    if (particle.x < 0) particle.x = canvasWidth
    if (particle.x > canvasWidth) particle.x = 0
    if (particle.y < 0) particle.y = canvasHeight
    if (particle.y > canvasHeight) particle.y = 0

    // Update life
    particle.life++
    if (particle.life > particle.maxLife) {
      // Reset particle
      Object.assign(particle, this.createParticle())
    }

    // Update opacity based on life
    const lifeRatio = particle.life / particle.maxLife
    particle.opacity = 0.8 * (1 - lifeRatio * lifeRatio) // Fade out over time
  }

  private drawParticle(particle: Particle): void {
    this.context.save()
    
    this.context.globalAlpha = particle.opacity
    this.context.fillStyle = particle.color
    
    // Add glow effect
    this.context.shadowColor = particle.color
    this.context.shadowBlur = particle.size * 2
    
    this.context.beginPath()
    this.context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    this.context.fill()
    
    this.context.restore()
  }

  private drawConnections(): void {
    const maxDistance = 80
    const particles = this.particles

    this.context.save()
    this.context.strokeStyle = (this.config.colors && this.config.colors[0]) || '#ffffff'
    this.context.lineWidth = 0.5

    for (let i = 0; i < particles.length; i++) {
      const particleI = particles[i]
      if (!particleI) continue
      
      for (let j = i + 1; j < particles.length; j++) {
        const particleJ = particles[j]
        if (!particleJ) continue
        
        const dx = particleI.x - particleJ.x
        const dy = particleI.y - particleJ.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const opacity = (maxDistance - distance) / maxDistance * 0.3
          this.context.globalAlpha = opacity
          
          this.context.beginPath()
          this.context.moveTo(particleI.x, particleI.y)
          this.context.lineTo(particleJ.x, particleJ.y)
          this.context.stroke()
        }
      }
    }

    this.context.restore()
  }

  private animate(): void {
    if (!this.isRunning) return

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Update and draw particles
    this.particles.forEach(particle => {
      this.updateParticle(particle)
      this.drawParticle(particle)
    })

    // Draw connections between nearby particles
    if (this.config.density !== 'low') {
      this.drawConnections()
    }

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  public start(): void {
    if (this.isRunning) return
    
    this.isRunning = true
    this.animate()
  }

  public stop(): void {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  public updateConfig(newConfig: Partial<ParticleSystemProps>): void {
    this.config = { ...this.config, ...newConfig }
    this.adjustParticleCount()
  }

  public resize(): void {
    this.setupCanvas()
    this.adjustParticleCount()
  }

  public destroy(): void {
    this.stop()
    // Remove event listeners would go here if we stored references
  }

  public getParticleCount(): number {
    return this.particles.length
  }

  public getPerformanceInfo(): { particleCount: number; fps: number } {
    // This would be enhanced with actual FPS tracking
    return {
      particleCount: this.particles.length,
      fps: 60 // Placeholder
    }
  }
}