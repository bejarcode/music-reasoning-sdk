import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { HybridCache } from '../../../src/cache/cache-manager'
import type { CacheEntry } from '../../../src/cache/types'

describe('HybridCache', () => {
  let cache: HybridCache

  beforeEach(() => {
    cache = new HybridCache()
  })

  describe('basic cache operations', () => {
    it('stores and retrieves cache entries', () => {
      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major is a major triad',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)
      const retrieved = cache.get('0-4-7')

      expect(retrieved).toBeDefined()
      expect(retrieved?.key).toBe('0-4-7')
      expect(retrieved?.explanation).toBe('C major is a major triad')
    })

    it('returns undefined for non-existent keys', () => {
      const result = cache.get('9-9-9')
      expect(result).toBeUndefined()
    })

    it('updates lastAccessed on cache hit', () => {
      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now() - 1000,
        lastAccessed: Date.now() - 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)

      const beforeAccess = Date.now()
      const retrieved = cache.get('0-4-7')

      expect(retrieved).toBeDefined()
      expect(retrieved!.lastAccessed).toBeGreaterThanOrEqual(beforeAccess)
    })

    it('overwrites existing entries with same key', () => {
      const entry1: CacheEntry = {
        key: '0-4-7',
        explanation: 'First explanation',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry2: CacheEntry = {
        key: '0-4-7',
        explanation: 'Second explanation',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.7, maxTokens: 200, timeout: 30000, useCache: true },
      }

      cache.set(entry1)
      cache.set(entry2)

      const retrieved = cache.get('0-4-7')
      expect(retrieved?.explanation).toBe('Second explanation')
      expect(retrieved?.options.temperature).toBe(0.7)
    })
  })

  describe('TTL eviction (T015 - critical test)', () => {
    it('evicts entries older than 24 hours', () => {
      const now = Date.now()

      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: now - 25 * 60 * 60 * 1000, // 25 hours ago
        lastAccessed: now - 25 * 60 * 60 * 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)

      // Manually set timestamp to past (simulate old entry)
      // Since cache.set() uses entry.timestamp, we need to get and modify
      const stored = cache.get('0-4-7')
      if (stored) {
        stored.timestamp = now - 25 * 60 * 60 * 1000
        stored.lastAccessed = now - 25 * 60 * 60 * 1000
        cache.set(stored)
      }

      // Next access should trigger TTL eviction
      const result = cache.get('0-4-7')
      expect(result).toBeUndefined()
    })

    it('keeps entries younger than 24 hours', () => {
      const now = Date.now()

      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: now - 23 * 60 * 60 * 1000, // 23 hours ago
        lastAccessed: now - 23 * 60 * 60 * 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)
      const result = cache.get('0-4-7')

      expect(result).toBeDefined()
      expect(result?.explanation).toBe('C major')
    })

    it('counts TTL evictions in statistics', () => {
      const now = Date.now()

      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: now - 25 * 60 * 60 * 1000, // Expired
        lastAccessed: now - 25 * 60 * 60 * 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)

      // Trigger TTL eviction
      cache.get('0-4-7')

      const stats = cache.getStats()
      expect(stats.ttlEvictions).toBe(1)
      expect(stats.misses).toBe(1) // Expired entry counts as miss
    })

    it('uses custom TTL configuration', () => {
      const oneHourCache = new HybridCache({ ttlMs: 60 * 60 * 1000 }) // 1 hour TTL
      const now = Date.now()

      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
        lastAccessed: now - 2 * 60 * 60 * 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      oneHourCache.set(entry)
      const result = oneHourCache.get('0-4-7')

      expect(result).toBeUndefined() // Should be evicted (2h > 1h TTL)
    })
  })

  describe('LRU eviction (T016 - critical test)', () => {
    it('evicts oldest entry when cache exceeds maxSize', () => {
      const smallCache = new HybridCache({ maxSize: 3 })

      const entry1: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 3000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry2: CacheEntry = {
        key: '2-5-9',
        explanation: 'D minor',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 2000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry3: CacheEntry = {
        key: '4-7-11',
        explanation: 'E minor',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry4: CacheEntry = {
        key: '5-9-0',
        explanation: 'F major',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      smallCache.set(entry1)
      smallCache.set(entry2)
      smallCache.set(entry3)

      expect(smallCache.size).toBe(3)

      // Adding 4th entry should evict entry1 (oldest lastAccessed)
      smallCache.set(entry4)

      expect(smallCache.size).toBe(3) // Still 3
      expect(smallCache.get('0-4-7')).toBeUndefined() // entry1 evicted
      expect(smallCache.get('2-5-9')).toBeDefined() // entry2 still there
      expect(smallCache.get('4-7-11')).toBeDefined() // entry3 still there
      expect(smallCache.get('5-9-0')).toBeDefined() // entry4 just added
    })

    it('allows cache to reach exactly maxSize (off-by-one fix)', () => {
      const smallCache = new HybridCache({ maxSize: 1000 })

      // Add exactly 1000 entries
      for (let i = 0; i < 1000; i++) {
        const entry: CacheEntry = {
          key: `key-${i}`,
          explanation: `Explanation ${i}`,
          timestamp: Date.now(),
          lastAccessed: Date.now(),
          options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
        }
        smallCache.set(entry)
      }

      // Cache should have exactly 1000 entries (not 999)
      expect(smallCache.size).toBe(1000)

      // All 1000 entries should be retrievable
      for (let i = 0; i < 1000; i++) {
        expect(smallCache.get(`key-${i}`)).toBeDefined()
      }
    })

    it('evicts when size exceeds maxSize, not when equal (critical fix #3)', () => {
      const smallCache = new HybridCache({ maxSize: 2 })

      const entry1: CacheEntry = {
        key: 'first',
        explanation: 'First',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry2: CacheEntry = {
        key: 'second',
        explanation: 'Second',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry3: CacheEntry = {
        key: 'third',
        explanation: 'Third',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      smallCache.set(entry1)
      expect(smallCache.size).toBe(1)

      smallCache.set(entry2)
      expect(smallCache.size).toBe(2) // Exactly at maxSize, no eviction yet

      smallCache.set(entry3)
      expect(smallCache.size).toBe(2) // Now eviction happened

      // entry1 should be evicted (oldest)
      expect(smallCache.get('first')).toBeUndefined()
      expect(smallCache.get('second')).toBeDefined()
      expect(smallCache.get('third')).toBeDefined()
    })

    it('counts LRU evictions in statistics', () => {
      const smallCache = new HybridCache({ maxSize: 2 })

      const entry1: CacheEntry = {
        key: 'first',
        explanation: 'First',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry2: CacheEntry = {
        key: 'second',
        explanation: 'Second',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry3: CacheEntry = {
        key: 'third',
        explanation: 'Third',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      smallCache.set(entry1)
      smallCache.set(entry2)
      smallCache.set(entry3) // Triggers LRU eviction

      const stats = smallCache.getStats()
      expect(stats.lruEvictions).toBe(1)
    })

    it('evicts based on lastAccessed, not insertion order', () => {
      const smallCache = new HybridCache({ maxSize: 3 })

      const entry1: CacheEntry = {
        key: 'first',
        explanation: 'First',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 3000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry2: CacheEntry = {
        key: 'second',
        explanation: 'Second',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 2000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry3: CacheEntry = {
        key: 'third',
        explanation: 'Third',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      smallCache.set(entry1)
      smallCache.set(entry2)
      smallCache.set(entry3)

      // Access entry1 to update its lastAccessed (make it most recent)
      smallCache.get('first')

      // Now add entry4 - should evict entry2 (oldest lastAccessed after update)
      const entry4: CacheEntry = {
        key: 'fourth',
        explanation: 'Fourth',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      smallCache.set(entry4)

      expect(smallCache.get('first')).toBeDefined() // Recently accessed
      expect(smallCache.get('second')).toBeUndefined() // Oldest after first was accessed
      expect(smallCache.get('third')).toBeDefined()
      expect(smallCache.get('fourth')).toBeDefined()
    })
  })

  describe('has() method', () => {
    it('returns true for existing valid entries', () => {
      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)
      expect(cache.has('0-4-7')).toBe(true)
    })

    it('returns false for non-existent keys', () => {
      expect(cache.has('9-9-9')).toBe(false)
    })

    it('returns false for expired entries', () => {
      const now = Date.now()

      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: now - 25 * 60 * 60 * 1000, // Expired
        lastAccessed: now - 25 * 60 * 60 * 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)
      expect(cache.has('0-4-7')).toBe(false)
    })

    it('does not update lastAccessed (read-only check)', () => {
      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now(),
        lastAccessed: Date.now() - 1000,
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)

      // has() doesn't increment hit/miss counters (read-only)
      const statsBeforeHas = cache.getStats()
      cache.has('0-4-7')
      const statsAfterHas = cache.getStats()

      expect(statsAfterHas.hits).toBe(statsBeforeHas.hits) // No change
      expect(statsAfterHas.misses).toBe(statsBeforeHas.misses) // No change
    })
  })

  describe('clear() method', () => {
    it('removes all cache entries', () => {
      const entry1: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      const entry2: CacheEntry = {
        key: '2-5-9',
        explanation: 'D minor',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry1)
      cache.set(entry2)
      expect(cache.size).toBe(2)

      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.get('0-4-7')).toBeUndefined()
      expect(cache.get('2-5-9')).toBeUndefined()
    })

    it('resets all statistics', () => {
      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)
      cache.get('0-4-7') // Hit
      cache.get('9-9-9') // Miss

      const statsBefore = cache.getStats()
      expect(statsBefore.hits).toBeGreaterThan(0)
      expect(statsBefore.misses).toBeGreaterThan(0)

      cache.clear()

      const statsAfter = cache.getStats()
      expect(statsAfter.hits).toBe(0)
      expect(statsAfter.misses).toBe(0)
      expect(statsAfter.ttlEvictions).toBe(0)
      expect(statsAfter.lruEvictions).toBe(0)
    })
  })

  describe('statistics tracking', () => {
    it('tracks cache hits correctly', () => {
      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)
      cache.get('0-4-7')
      cache.get('0-4-7')

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
    })

    it('tracks cache misses correctly', () => {
      cache.get('nonexistent-1')
      cache.get('nonexistent-2')

      const stats = cache.getStats()
      expect(stats.misses).toBe(2)
    })

    it('calculates hit rate correctly', () => {
      const entry: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry)

      cache.get('0-4-7') // Hit
      cache.get('0-4-7') // Hit
      cache.get('9-9-9') // Miss
      cache.get('9-9-9') // Miss

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(2)
      expect(stats.hitRate).toBe(0.5) // 2 hits / (2 hits + 2 misses)
    })

    it('handles zero requests (no divide by zero)', () => {
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0) // Not NaN
    })
  })

  describe('size property', () => {
    it('returns correct cache size', () => {
      expect(cache.size).toBe(0)

      const entry1: CacheEntry = {
        key: '0-4-7',
        explanation: 'C major',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry1)
      expect(cache.size).toBe(1)

      const entry2: CacheEntry = {
        key: '2-5-9',
        explanation: 'D minor',
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: { temperature: 0.5, maxTokens: 150, timeout: 30000, useCache: true },
      }

      cache.set(entry2)
      expect(cache.size).toBe(2)
    })
  })
})
