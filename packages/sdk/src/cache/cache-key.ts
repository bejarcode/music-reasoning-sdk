import { generateCacheKeyWithOptions } from '../utils/pitch-class'
import type { ExplainOptions } from '../types/explain'
import { DEFAULT_EXPLAIN_OPTIONS } from '../types/explain'

/**
 * Generates a normalized cache key from notes and options.
 *
 * @param notes - Array of note names (e.g., ['C', 'E', 'G'])
 * @param options - ExplainOptions configuration (affects cache key)
 * @returns Normalized cache key (e.g., "0-4-7:0.3:150")
 *
 * @remarks
 * This function is the primary entry point for cache key generation in the SDK.
 * It combines:
 * - Pitch-class normalization (handles enharmonics, octave independence, order)
 * - Options hashing (temperature and maxTokens affect output)
 *
 * **Cache Key Format:**
 * ```
 * <pitch-class-key>:<temperature>:<maxTokens>
 * ```
 *
 * **Examples:**
 * - `['C', 'E', 'G']` + defaults → `"0-4-7:0.3:150"`
 * - `['C#', 'F', 'G#']` + defaults → `"1-5-8:0.3:150"`
 * - `['Db', 'F', 'Ab']` + defaults → `"1-5-8:0.3:150"` (same as C#, enharmonic)
 * - `['C', 'E', 'G']` + temp 0.5 → `"0-4-7:0.5:150"` (different from defaults)
 *
 * **Why Options Are Part of Key:**
 * Temperature affects AI creativity:
 * - 0.3 → Factual: "C major is a major triad with notes C, E, G."
 * - 0.7 → Creative: "C major rings with clarity, its pure thirds evoking sunlight..."
 *
 * These are DIFFERENT outputs → must have different cache entries.
 *
 * @example
 * ```typescript
 * // Default options
 * const key1 = normalizeCacheKey(['C', 'E', 'G'], {});
 * // "0-4-7:0.3:150"
 *
 * // Custom temperature
 * const key2 = normalizeCacheKey(['C', 'E', 'G'], { temperature: 0.5 });
 * // "0-4-7:0.5:150" (different cache entry)
 *
 * // Enharmonic equivalence
 * const key3 = normalizeCacheKey(['C#', 'F', 'G#'], {});
 * const key4 = normalizeCacheKey(['Db', 'F', 'Ab'], {});
 * // Both → "1-5-8:0.3:150" (same cache entry)
 * ```
 */
export function normalizeCacheKey(notes: string[], options: Partial<ExplainOptions>): string {
  // Merge with defaults to ensure temperature and maxTokens are always defined
  const mergedOptions = {
    temperature: options.temperature ?? DEFAULT_EXPLAIN_OPTIONS.temperature,
    maxTokens: options.maxTokens ?? DEFAULT_EXPLAIN_OPTIONS.maxTokens,
  }

  return generateCacheKeyWithOptions(notes, mergedOptions)
}

/**
 * Validates whether two cache keys represent the same musical content.
 *
 * @param key1 - First cache key
 * @param key2 - Second cache key
 * @returns True if keys represent same pitch-class set and options, false otherwise
 *
 * @remarks
 * This is a strict equality check that includes options.
 * Two keys are equal if and only if:
 * - Same pitch-class set (e.g., "0-4-7")
 * - Same temperature
 * - Same maxTokens
 *
 * **Why This Matters:**
 * Cache key equality determines whether we can reuse a cached explanation.
 * Different options → different AI output → cannot reuse.
 *
 * @example
 * ```typescript
 * // Same pitch-class set, same options → TRUE
 * isCacheKeyEqual('0-4-7:0.3:150', '0-4-7:0.3:150'); // true
 *
 * // Same pitch-class set, different temperature → FALSE
 * isCacheKeyEqual('0-4-7:0.3:150', '0-4-7:0.5:150'); // false
 *
 * // Different pitch-class set, same options → FALSE
 * isCacheKeyEqual('0-4-7:0.3:150', '2-6-9:0.3:150'); // false
 * ```
 */
export function isCacheKeyEqual(key1: string, key2: string): boolean {
  return key1 === key2
}

/**
 * Extracts pitch-class component from cache key (without options).
 *
 * @param cacheKey - Full cache key (e.g., "0-4-7:0.3:150")
 * @returns Pitch-class part only (e.g., "0-4-7")
 *
 * @remarks
 * Useful for debugging and logging to see what notes a cache entry represents.
 *
 * @example
 * ```typescript
 * const pitchClass = extractPitchClass('0-4-7:0.3:150');
 * // "0-4-7" (C major in pitch-class notation)
 *
 * const pitchClass = extractPitchClass('1-5-8:0.5:200');
 * // "1-5-8" (C#/Db minor in pitch-class notation)
 * ```
 */
export function extractPitchClass(cacheKey: string): string {
  const parts = cacheKey.split(':')
  return parts[0] ?? ''
}

/**
 * Extracts options component from cache key.
 *
 * @param cacheKey - Full cache key (e.g., "0-4-7:0.3:150")
 * @returns Partial ExplainOptions (temperature and maxTokens only)
 *
 * @remarks
 * Useful for debugging to see what options were used for a cached entry.
 *
 * @example
 * ```typescript
 * const options = extractOptions('0-4-7:0.3:150');
 * // { temperature: 0.3, maxTokens: 150 }
 *
 * const options = extractOptions('1-5-8:0.5:200');
 * // { temperature: 0.5, maxTokens: 200 }
 * ```
 */
export function extractOptions(
  cacheKey: string
): Pick<ExplainOptions, 'temperature' | 'maxTokens'> {
  const parts = cacheKey.split(':')

  const temp = parseFloat(parts[1] ?? '')
  const tokens = parseInt(parts[2] ?? '', 10)

  return {
    temperature: Number.isNaN(temp) ? DEFAULT_EXPLAIN_OPTIONS.temperature : temp,
    maxTokens: Number.isNaN(tokens) ? DEFAULT_EXPLAIN_OPTIONS.maxTokens : tokens,
  }
}
