import type { CacheEntry, CacheConfig, CacheStats } from './types'
import { DEFAULT_CACHE_CONFIG } from './types'

/**
 * Hybrid LRU cache with TTL eviction for AI-generated explanations.
 *
 * @remarks
 * **Eviction Strategy:**
 * - **TTL Eviction**: Lazy check on access, evicts entries older than 24 hours
 * - **LRU Eviction**: When size > 1000, evicts oldest lastAccessed entry
 *
 * **Performance:**
 * - get(): O(1) average (Map lookup + potential TTL check)
 * - set(): O(1) average (Map insert + potential LRU eviction)
 * - LRU eviction: O(n) worst case (iterate all entries to find oldest)
 *
 * **Memory:**
 * - ~500 bytes per entry (key + explanation + metadata)
 * - 1000 entries ≈ 500KB-1MB total
 *
 * **Why Map (not WeakMap):**
 * - Cache keys are strings (primitives), WeakMap only supports objects
 * - Need explicit eviction control (TTL + LRU)
 * - Map maintains insertion order → easy LRU via iterator
 *
 * @example
 * ```typescript
 * const cache = new HybridCache();
 *
 * // Set cache entry
 * cache.set({
 *   key: '0-4-7',
 *   explanation: 'C major is a major triad...',
 *   timestamp: Date.now(),
 *   lastAccessed: Date.now(),
 *   options: { temperature: 0.3, maxTokens: 150, timeout: 30000, useCache: true }
 * });
 *
 * // Get cache entry (LRU update + TTL check)
 * const entry = cache.get('0-4-7');
 * if (entry) {
 *   console.log(entry.explanation);
 * }
 *
 * // Check stats
 * const stats = cache.getStats();
 * console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
 * ```
 */
export class HybridCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly config: Required<CacheConfig>

  // Statistics tracking
  private hits: number = 0
  private misses: number = 0
  private ttlEvictions: number = 0
  private lruEvictions: number = 0

  /**
   * Creates a new HybridCache instance.
   *
   * @param config - Optional cache configuration (maxSize, ttlMs)
   *
   * @remarks
   * Defaults:
   * - maxSize: 1000 entries
   * - ttlMs: 86400000 (24 hours)
   *
   * @example
   * ```typescript
   * // Use defaults
   * const cache = new HybridCache();
   *
   * // Custom configuration
   * const cache = new HybridCache({
   *   maxSize: 500,    // Smaller cache
   *   ttlMs: 3600000   // 1 hour TTL
   * });
   * ```
   */
  constructor(config?: CacheConfig) {
    this.config = {
      ...DEFAULT_CACHE_CONFIG,
      ...config,
    }
  }

  /**
   * Retrieves a cache entry by key with TTL check and LRU update.
   *
   * @param key - Cache key (pitch-class normalized)
   * @returns CacheEntry if found and not expired, undefined otherwise
   *
   * @remarks
   * **Behavior:**
   * 1. Lookup entry in Map (O(1))
   * 2. If not found → MISS (return undefined)
   * 3. If found → TTL check (lazy eviction)
   * 4. If expired → EVICT + MISS (return undefined)
   * 5. If valid → LRU update (move to end) + HIT (return entry)
   *
   * **TTL Check Formula:**
   * ```
   * const age = Date.now() - entry.timestamp;
   * const isExpired = age > this.config.ttlMs;
   * ```
   *
   * **LRU Update:**
   * Map maintains insertion order, so we:
   * 1. Delete entry (removes from current position)
   * 2. Re-insert entry (adds to end = most recently used)
   * 3. Update lastAccessed timestamp
   *
   * @example
   * ```typescript
   * const entry = cache.get('0-4-7');
   * if (entry) {
   *   // Cache hit - entry is valid and lastAccessed updated
   *   console.log(entry.explanation);
   * } else {
   *   // Cache miss - entry not found or expired
   *   // Generate new explanation...
   * }
   * ```
   */
  get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return undefined
    }

    // Lazy TTL check
    const age = Date.now() - entry.timestamp
    if (age > this.config.ttlMs) {
      this.cache.delete(key)
      this.ttlEvictions++
      this.misses++
      return undefined
    }

    // LRU update: Move to end (most recently used)
    this.cache.delete(key)
    entry.lastAccessed = Date.now()
    this.cache.set(key, entry)

    this.hits++
    return entry
  }

  /**
   * Sets a cache entry with LRU eviction if at capacity.
   *
   * @param entry - CacheEntry to store
   *
   * @remarks
   * **Behavior:**
   * 1. If key exists → delete (to update order)
   * 2. If size >= maxSize → LRU eviction (remove oldest lastAccessed)
   * 3. Insert new entry (added to end of Map)
   *
   * **LRU Eviction Algorithm:**
   * ```typescript
   * // Find entry with oldest lastAccessed
   * const entries = [...cache.values()];
   * entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
   * const oldest = entries[0];
   * cache.delete(oldest.key);
   * ```
   *
   * **Why delete-then-insert:**
   * - Updates entry position in Map (move to end)
   * - Ensures most recently set entry is at end (LRU order)
   *
   * @example
   * ```typescript
   * cache.set({
   *   key: '0-4-7',
   *   explanation: 'C major is a major triad built on C...',
   *   timestamp: Date.now(),
   *   lastAccessed: Date.now(),
   *   options: { temperature: 0.3, maxTokens: 150, timeout: 30000, useCache: true }
   * });
   * ```
   */
  set(entry: CacheEntry): void {
    // Remove if exists (to update order)
    const existed = this.cache.has(entry.key)
    this.cache.delete(entry.key)

    // LRU eviction if at capacity AND this is a NEW entry (not an update)
    // Allow cache to reach exactly maxSize
    if (!existed && this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    // Insert new entry (added to end = most recently used)
    this.cache.set(entry.key, entry)
  }

  /**
   * Evicts the oldest (least recently used) entry from the cache.
   *
   * @remarks
   * **Algorithm:**
   * 1. Iterate all cache entries
   * 2. Find entry with minimum lastAccessed timestamp
   * 3. Delete that entry
   *
   * **Complexity:** O(n) where n = cache.size
   *
   * **Why not O(1):**
   * - Map doesn't maintain sorted order by lastAccessed
   * - Could use a priority queue, but O(n) eviction is acceptable:
   *   - Only happens when size > 1000 (rare)
   *   - 1000 iterations ~0.01ms on modern CPUs
   *
   * @private
   */
  private evictOldest(): void {
    let oldestKey: string | undefined
    let oldestAccess = Number.MAX_SAFE_INTEGER

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.lruEvictions++
    }
  }

  /**
   * Checks if a cache entry exists and is valid (not expired).
   *
   * @param key - Cache key to check
   * @returns True if entry exists and is valid, false otherwise
   *
   * @remarks
   * This is a read-only check that does NOT:
   * - Update LRU access time
   * - Trigger eviction
   * - Increment hit/miss counters
   *
   * Useful for validating cache state without side effects.
   *
   * @example
   * ```typescript
   * if (cache.has('0-4-7')) {
   *   // Entry exists and is valid (not expired)
   * }
   * ```
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check TTL without evicting
    const age = Date.now() - entry.timestamp
    return age <= this.config.ttlMs
  }

  /**
   * Clears all cache entries and resets statistics.
   *
   * @remarks
   * This is a destructive operation:
   * - Removes ALL cache entries
   * - Resets hit/miss counters
   * - Resets eviction counters
   *
   * Useful for:
   * - Testing (clean slate between tests)
   * - Memory pressure (emergency cache clear)
   * - Model updates (invalidate old explanations)
   *
   * @example
   * ```typescript
   * cache.clear();
   * console.log(cache.size); // 0
   * ```
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
    this.ttlEvictions = 0
    this.lruEvictions = 0
  }

  /**
   * Returns the current number of cache entries.
   *
   * @remarks
   * This count includes all entries (even expired ones not yet evicted).
   * Lazy TTL eviction means expired entries remain until accessed.
   *
   * @example
   * ```typescript
   * console.log(`Cache size: ${cache.size} entries`);
   * ```
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Returns cache performance statistics.
   *
   * @returns CacheStats object with hit rate and eviction counts
   *
   * @remarks
   * **Metrics:**
   * - `hits`: Number of successful cache retrievals
   * - `misses`: Number of cache misses (not found or expired)
   * - `hitRate`: hits / (hits + misses) - percentage as decimal (0.0-1.0)
   * - `ttlEvictions`: Number of entries evicted due to TTL expiration
   * - `lruEvictions`: Number of entries evicted due to LRU size limit
   *
   * **Typical Hit Rates:**
   * - 60-80%: Good (cache is effective)
   * - 40-60%: Fair (consider increasing cache size)
   * - <40%: Poor (cache too small or TTL too short)
   *
   * @example
   * ```typescript
   * const stats = cache.getStats();
   * console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
   * console.log(`TTL evictions: ${stats.ttlEvictions}`);
   * console.log(`LRU evictions: ${stats.lruEvictions}`);
   * ```
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      ttlEvictions: this.ttlEvictions,
      lruEvictions: this.lruEvictions,
      hitRate,
    }
  }
}
