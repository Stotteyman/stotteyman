const cache = new Map()
const LRU = require('lru-cache')

// Enhanced cache with LRU eviction for Next.js 15.5.0
const lruCache = new LRU({
  max: 1000, // Maximum number of items
  ttl: 1000 * 60 * 60 * 24, // 24 hours TTL
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
})

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options
    this.cache = cache
    this.lruCache = lruCache
    this.debug = options?.debug || false
  }

  async get(key) {
    if (this.debug) {
      console.log(`[Cache] Getting key: ${key}`)
    }

    // Try LRU cache first for better performance
    const lruResult = this.lruCache.get(key)
    if (lruResult) {
      if (this.debug) {
        console.log(`[Cache] LRU hit for key: ${key}`)
      }
      return lruResult
    }

    // Fallback to Map cache
    const mapResult = this.cache.get(key)
    if (mapResult) {
      // Promote to LRU cache
      this.lruCache.set(key, mapResult)
      if (this.debug) {
        console.log(`[Cache] Map hit for key: ${key}`)
      }
    }

    return mapResult
  }

  async set(key, data, ctx) {
    if (this.debug) {
      console.log(`[Cache] Setting key: ${key}`)
    }

    const cacheEntry = {
      value: data,
      lastModified: Date.now(),
      tags: ctx?.tags || [],
      kind: ctx?.kind,
      revalidate: ctx?.revalidate,
    }

    // Set in both caches
    this.cache.set(key, cacheEntry)
    this.lruCache.set(key, cacheEntry)

    // Implement cache size limits
    if (this.cache.size > 2000) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  async revalidateTag(tag) {
    if (this.debug) {
      console.log(`[Cache] Revalidating tag: ${tag}`)
    }

    let revalidatedCount = 0

    // Revalidate in Map cache
    for (const [key, value] of this.cache) {
      if (value.tags?.includes(tag)) {
        this.cache.delete(key)
        this.lruCache.delete(key)
        revalidatedCount++
      }
    }

    if (this.debug) {
      console.log(`[Cache] Revalidated ${revalidatedCount} entries for tag: ${tag}`)
    }
  }

  async revalidatePath(pathname) {
    if (this.debug) {
      console.log(`[Cache] Revalidating path: ${pathname}`)
    }

    let revalidatedCount = 0

    // Revalidate entries matching the pathname
    for (const [key, value] of this.cache) {
      if (key.includes(pathname)) {
        this.cache.delete(key)
        this.lruCache.delete(key)
        revalidatedCount++
      }
    }

    if (this.debug) {
      console.log(`[Cache] Revalidated ${revalidatedCount} entries for path: ${pathname}`)
    }
  }

  // Enhanced cache statistics for monitoring
  getStats() {
    return {
      mapSize: this.cache.size,
      lruSize: this.lruCache.size,
      lruMax: this.lruCache.max,
      memoryUsage: process.memoryUsage(),
    }
  }

  // Clear all caches
  clear() {
    this.cache.clear()
    this.lruCache.clear()
    
    if (this.debug) {
      console.log('[Cache] All caches cleared')
    }
  }
}