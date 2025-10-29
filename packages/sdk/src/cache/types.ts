import type { ExplainOptions } from '../types/explain'

/**
 * Internal cache entry for storing AI-generated explanations with eviction metadata.
 *
 * @remarks
 * Supports hybrid cache eviction strategy:
 * - **TTL Eviction**: Entries older than 24 hours are evicted (lazy check on access)
 * - **LRU Eviction**: When cache size exceeds 1000 entries, oldest lastAccessed entry is evicted
 * - **Options Validation**: Different options → different cache entries
 *
 * **Lifecycle:**
 * 1. Created: `timestamp = lastAccessed = Date.now()`
 * 2. Accessed: `lastAccessed` updated to `Date.now()`
 * 3. Evicted: TTL (24h) or LRU (size > 1000)
 *
 * @example
 * ```typescript
 * // Create cache entry
 * const entry: CacheEntry = {
 *   key: '0-4-7',
 *   explanation: 'C major is a major triad built on C. It has a bright, stable sound...',
 *   timestamp: Date.now(),
 *   lastAccessed: Date.now(),
 *   options: {
 *     temperature: 0.3,
 *     maxTokens: 150,
 *     timeout: 30000,
 *     useCache: true
 *   }
 * };
 *
 * // Access cache entry (LRU update)
 * entry.lastAccessed = Date.now();
 *
 * // TTL check (24 hours)
 * const age = Date.now() - entry.timestamp;
 * const isExpired = age > 86400000; // 24h in ms
 *
 * // LRU eviction trigger
 * const shouldEvict = cache.size > 1000;
 * ```
 */
export interface CacheEntry {
  /**
   * Cache key - pitch-class normalized input.
   *
   * @remarks
   * **Format Examples:**
   * - Chord: `"0-4-7"` (C major in pitch-class notation)
   * - Progression: `"Dm7-G7-Cmaj7"` (chord symbols, order-sensitive)
   *
   * **Normalization:**
   * - Uses pitch-class representation (0-11)
   * - Handles enharmonics: C# = Db → both map to 1
   * - Sorted for order-independence (chords only)
   *
   * @see {@link generateCacheKey} for key generation logic
   */
  key: string

  /**
   * Cached AI-generated explanation text.
   *
   * @remarks
   * This is the AI response that was generated with the specified `options`.
   * Typically 2-4 sentences (~100-200 tokens) explaining music theory concepts.
   */
  explanation: string

  /**
   * Unix timestamp (ms) when entry was created.
   *
   * @remarks
   * Used for TTL eviction:
   * - Entry created at time T
   * - Current time is T + 24h + 1ms
   * - Entry is EXPIRED (evict on next access)
   *
   * **Formula:** `Date.now() - timestamp > 86400000` (24h in ms)
   */
  timestamp: number

  /**
   * Unix timestamp (ms) when entry was last accessed.
   *
   * @remarks
   * Used for LRU eviction:
   * - When cache size > 1000, find entry with OLDEST lastAccessed
   * - Evict that entry
   * - Continue until size <= 1000
   *
   * **Updated on:**
   * - Cache creation: `lastAccessed = timestamp = Date.now()`
   * - Cache hit: `lastAccessed = Date.now()` (move to end of LRU list)
   *
   * **Invariant:** `lastAccessed >= timestamp` (cannot access before creation)
   */
  lastAccessed: number

  /**
   * ExplainOptions used to generate this explanation.
   *
   * @remarks
   * Different options → different AI outputs → must be part of cache key validation.
   *
   * **Cache Hit Rules:**
   * - Requested temperature matches cached temperature → HIT
   * - Requested temperature differs from cached temperature → MISS (generate new)
   * - Same logic applies to maxTokens
   *
   * **Why This Matters:**
   * Temperature 0.3 produces factual explanations, temperature 0.7 produces creative ones.
   * These are DIFFERENT outputs for the SAME input notes, so they must have separate cache entries.
   *
   * @example
   * ```typescript
   * // Cache entry 1: factual (temperature 0.3)
   * { key: '0-4-7:0.3:150', options: { temperature: 0.3, ... } }
   *
   * // Cache entry 2: creative (temperature 0.7)
   * { key: '0-4-7:0.7:150', options: { temperature: 0.7, ... } }
   *
   * // Both entries can coexist - different outputs
   * ```
   */
  options: Required<ExplainOptions>
}

/**
 * Configuration for the HybridCache implementation.
 *
 * @remarks
 * Controls cache behavior and eviction policies.
 */
export interface CacheConfig {
  /**
   * Maximum number of cache entries before LRU eviction kicks in.
   *
   * @remarks
   * - Default: 1000 entries
   * - When size exceeds this, oldest lastAccessed entry is evicted
   * - Typical entry size: ~500 bytes (key + explanation + metadata)
   * - 1000 entries ≈ 500KB-1MB memory usage
   */
  maxSize?: number

  /**
   * Time-to-live in milliseconds before TTL eviction.
   *
   * @remarks
   * - Default: 86400000 (24 hours)
   * - Entries older than this are evicted on next access (lazy eviction)
   * - Prevents stale explanations as model evolves
   */
  ttlMs?: number
}

/**
 * Default cache configuration.
 *
 * @remarks
 * Optimized for typical SDK usage:
 * - 1000 entry limit protects long-running apps (~500KB-1MB memory)
 * - 24h TTL keeps explanations fresh as model improves
 */
export const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  maxSize: 1000,
  ttlMs: 86400000, // 24 hours
}

/**
 * Cache statistics for monitoring and debugging.
 *
 * @remarks
 * Useful for understanding cache performance and hit rates.
 */
export interface CacheStats {
  /** Total number of entries currently in cache */
  size: number

  /** Total number of cache hits since creation */
  hits: number

  /** Total number of cache misses since creation */
  misses: number

  /** Total number of TTL evictions since creation */
  ttlEvictions: number

  /** Total number of LRU evictions since creation */
  lruEvictions: number

  /** Cache hit rate (hits / (hits + misses)) */
  hitRate: number
}
