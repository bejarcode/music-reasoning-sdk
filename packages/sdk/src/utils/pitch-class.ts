import { Note } from 'tonal'

/**
 * Converts an array of note names to their pitch-class representations (0-11).
 *
 * @param notes - Array of note names (e.g., ['C', 'E', 'G'], ['C#', 'F', 'G#'])
 * @returns Array of pitch class numbers (0-11) where C=0, C#/Db=1, D=2, etc.
 *
 * @remarks
 * This function uses tonal.js `Note.chroma()` to handle enharmonic equivalence:
 * - C# and Db both map to pitch class 1
 * - All octave variants map to the same pitch class (C4 = C5 = 0)
 * - Invalid notes are filtered out (Note.chroma() returns NaN for invalid input)
 *
 * **Implementation Detail:**
 * This satisfies FR-011 (pitch-class representation for cache key normalization).
 * The plan.md notes: "Use tonal.js Note.chroma() - Already in dependency tree,
 * handles enharmonics (C# = Db = 1), returns 0-11 directly."
 *
 * @example
 * ```typescript
 * // Basic triads
 * notesToPitchClass(['C', 'E', 'G']) // [0, 4, 7]
 * notesToPitchClass(['D', 'F#', 'A']) // [2, 6, 9]
 *
 * // Enharmonic equivalence (C# = Db)
 * notesToPitchClass(['C#', 'F', 'G#']) // [1, 5, 8]
 * notesToPitchClass(['Db', 'F', 'Ab']) // [1, 5, 8] - same result
 *
 * // Octave independence (C4 = C5 = C)
 * notesToPitchClass(['C4', 'E4', 'G4']) // [0, 4, 7]
 * notesToPitchClass(['C5', 'E5', 'G5']) // [0, 4, 7] - same result
 *
 * // Invalid notes are filtered
 * notesToPitchClass(['C', 'X', 'G']) // [0, 7] - 'X' filtered out
 * ```
 */
export function notesToPitchClass(notes: string[]): number[] {
  return notes
    .map((note) => {
      // Normalize: trim whitespace, uppercase note letter ONLY (preserve 'b' for flats)
      // CRITICAL: Can't use .toUpperCase() - it converts 'Db' → 'DB' which is invalid
      // tonal.js requires flat notation as lowercase 'b' (e.g., 'Db', 'Ab')
      // Examples: 'db' → 'Db', 'C#' → 'C#', ' c ' → 'C'
      const normalized = note.trim().replace(/^([a-g])/i, (match) => match.toUpperCase())
      return Note.chroma(normalized)
    })
    .filter((chroma): chroma is number => !Number.isNaN(chroma))
}

/**
 * Generates a normalized cache key from an array of notes.
 *
 * @param notes - Array of note names (e.g., ['C', 'E', 'G'])
 * @returns Pitch-class normalized cache key (e.g., "0-4-7")
 *
 * @remarks
 * Cache keys are normalized to maximize cache hit rate while preserving chord identity:
 * - **Enharmonic equivalence**: C# and Db produce identical keys (both → "1-5-8")
 * - **Octave independence**: C4 and C5 produce identical keys (both → "0-...")
 * - **Sorted order**: Notes are sorted by pitch class for consistency
 *
 * **Cache Key Format:**
 * - Pitch classes joined by hyphens: "0-4-7" (C major)
 * - Always sorted ascending: ['G', 'C', 'E'] → "0-4-7" (not "7-0-4")
 * - Invalid notes filtered: ['C', 'X', 'G'] → "0-7"
 *
 * **Why This Matters:**
 * Cache key normalization is CRITICAL for cache efficiency. Without it:
 * - ['C', 'E', 'G'] and ['Db', 'F', 'Ab'] would miss cache (different keys)
 * - ['C4', 'E4', 'G4'] and ['C5', 'E5', 'G5'] would miss cache (different octaves)
 * - ['C', 'E', 'G'] and ['E', 'G', 'C'] would miss cache (different order)
 *
 * With normalization, all variants above produce SAME key → maximize cache hits.
 *
 * @example
 * ```typescript
 * // Basic usage
 * generateCacheKey(['C', 'E', 'G']) // "0-4-7"
 * generateCacheKey(['D', 'F#', 'A']) // "2-6-9"
 *
 * // Enharmonic equivalence (C# = Db)
 * generateCacheKey(['C#', 'F', 'G#']) // "1-5-8"
 * generateCacheKey(['Db', 'F', 'Ab']) // "1-5-8" ✅ SAME KEY
 *
 * // Octave independence
 * generateCacheKey(['C4', 'E4', 'G4']) // "0-4-7"
 * generateCacheKey(['C5', 'E5', 'G5']) // "0-4-7" ✅ SAME KEY
 *
 * // Order independence (notes are sorted)
 * generateCacheKey(['G', 'C', 'E']) // "0-4-7" (sorted)
 * generateCacheKey(['E', 'G', 'C']) // "0-4-7" ✅ SAME KEY
 *
 * // Invalid notes filtered
 * generateCacheKey(['C', 'X', 'G']) // "0-7"
 * ```
 */
export function generateCacheKey(notes: string[]): string {
  const pitchClasses = notesToPitchClass(notes)

  // Deduplicate + sort for canonical representation
  // ['C', 'C', 'E', 'G'] → [0, 0, 4, 7] → [0, 4, 7] → "0-4-7"
  // ['G', 'C', 'E'] → [7, 0, 4] → [0, 4, 7] → "0-4-7"
  const unique = Array.from(new Set(pitchClasses)).sort((a, b) => a - b)

  return unique.join('-')
}

/**
 * Generates a cache key that includes ExplainOptions configuration.
 *
 * @param notes - Array of note names
 * @param options - ExplainOptions configuration (affects cache validity)
 * @returns Combined cache key including options hash
 *
 * @remarks
 * Options affect AI output, so they MUST be part of the cache key:
 * - Different temperatures → different explanations → different cache entries
 * - Same notes + same options → cache hit
 * - Same notes + different options → cache miss (correct behavior)
 *
 * **Cache Key Format:**
 * ```
 * <pitch-class-key>:<temperature>:<maxTokens>
 * ```
 *
 * **Example:**
 * - `['C', 'E', 'G']` with default options → `"0-4-7:0.5:150"`
 * - `['C', 'E', 'G']` with temp 0.7 → `"0-4-7:0.7:150"` (different key)
 *
 * @example
 * ```typescript
 * // Default options (temperature: 0.5, maxTokens: 150)
 * generateCacheKeyWithOptions(['C', 'E', 'G'], { temperature: 0.5, maxTokens: 150 })
 * // "0-4-7:0.5:150"
 *
 * // Lower temperature for more deterministic output
 * generateCacheKeyWithOptions(['C', 'E', 'G'], { temperature: 0.3, maxTokens: 150 })
 * // "0-4-7:0.3:150"
 *
 * // Custom maxTokens (different cache entry)
 * generateCacheKeyWithOptions(['C', 'E', 'G'], { temperature: 0.5, maxTokens: 200 })
 * // "0-4-7:0.5:200"
 * ```
 */
export function generateCacheKeyWithOptions(
  notes: string[],
  options: { temperature?: number; maxTokens?: number }
): string {
  const baseKey = generateCacheKey(notes)
  const temp = options.temperature ?? 0.5
  const tokens = options.maxTokens ?? 150

  return `${baseKey}:${String(temp)}:${String(tokens)}`
}
