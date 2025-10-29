/**
 * TypeScript Contracts: Genre Pattern Recognition
 *
 * Type definitions for genre-specific chord progression patterns and
 * genre detection from progressions.
 * All types enforce TypeScript strict mode with no `any` types.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

/**
 * Supported music genres for pattern recognition.
 *
 * @remarks
 * Six primary genres covered by the pattern database.
 * Each genre has minimum 8 patterns with metadata.
 * 'unknown' is returned when no patterns match the progression.
 */
export type Genre =
  | 'jazz' // Swing, bebop, cool jazz, fusion
  | 'pop' // Popular music (1950s-present)
  | 'classical' // Baroque, Classical, Romantic, Modern
  | 'rock' // Rock, punk, grunge, alternative
  | 'edm' // Electronic dance music (house, dubstep, progressive)
  | 'blues' // Traditional blues, Chicago blues, jazz blues
  | 'unknown' // No patterns matched (fallback)

/**
 * Genre-specific chord progression pattern.
 *
 * @remarks
 * Represents a chord progression pattern characteristic of a specific genre.
 * Patterns include Roman numeral sequences, famous song examples, era tags,
 * and significance weights.
 *
 * The pattern database contains 50+ patterns total (minimum 8 per genre).
 *
 * @example
 * ```typescript
 * const jazzPattern: GenrePattern = {
 *   pattern: 'ii-V-I',
 *   genre: 'jazz',
 *   weight: 10,
 *   description: 'Fundamental jazz turnaround',
 *   examples: ['Autumn Leaves - Cannonball Adderley', 'All The Things You Are - Ella Fitzgerald'],
 *   era: 'classic-jazz'
 * }
 * ```
 */
export interface GenrePattern {
  /**
   * Roman numeral sequence (e.g., "ii-V-I", "I-V-vi-IV").
   * Uses hyphens to separate chords.
   * Case conventions:
   * - Uppercase (I, IV, V) = Major chords
   * - Lowercase (ii, iii, vi) = Minor chords
   * - Lowercase + ° (vii°) = Diminished
   * - Uppercase + + (III+) = Augmented
   */
  readonly pattern: string

  /** Genre classification */
  readonly genre: Genre

  /**
   * Significance of this pattern within the genre (1-10 scale, inclusive).
   * - 10: Defining progression (appears in 30%+ of genre songs)
   * - 8-9: Very common, genre-characteristic
   * - 6-7: Common, recognizable
   * - 4-5: Occasional, stylistic
   * - 1-3: Rare, experimental
   */
  readonly weight: number

  /**
   * Human-readable explanation of the pattern.
   * Should describe its functional role and significance.
   * Example: "Fundamental jazz turnaround - the most common progression in jazz"
   */
  readonly description: string

  /**
   * Famous songs using this pattern (up to 5).
   * Format: "Song Title - Artist Name"
   * Prioritize instantly recognizable songs (charted or standards).
   * @optional
   */
  readonly examples?: readonly string[]

  /**
   * Historical or stylistic era tag.
   * Examples:
   * - Jazz: 'bebop', 'swing', 'cool-jazz', 'fusion'
   * - Pop: '1950s', '1960s', '1980s', '2010s'
   * - Classical: 'baroque', 'classical-period', 'romantic'
   * - Rock: 'classic-rock', 'punk', 'grunge'
   * - EDM: 'house', 'dubstep', 'progressive-house'
   * - Blues: 'traditional-blues', 'chicago-blues'
   * @optional
   */
  readonly era?: string
}

/**
 * Genre detection result with confidence score and matched patterns.
 *
 * @remarks
 * Represents a detected genre based on matched patterns in a progression.
 * Returns the full pattern objects (not just pattern names) to provide
 * rich context including weights, descriptions, and famous song examples.
 *
 * Multiple genres may be returned, sorted by confidence (highest first).
 *
 * @example
 * ```typescript
 * const result: GenreDetectionResult = {
 *   genre: 'jazz',
 *   confidence: 1.0,
 *   matchedPatterns: [
 *     {
 *       pattern: 'ii-V-I',
 *       genre: 'jazz',
 *       weight: 10,
 *       description: 'Fundamental jazz turnaround',
 *       examples: ['Autumn Leaves - Cannonball Adderley'],
 *       era: 'classic-jazz'
 *     }
 *   ]
 * }
 * ```
 *
 * @since v2.0.0
 */
export interface GenreDetectionResult {
  /** Detected genre */
  readonly genre: Genre

  /**
   * Confidence in genre detection (0.0-1.0 inclusive).
   * Calculated by normalizing pattern weights:
   * confidence = (total_weight_for_genre) / (max_weight_across_all_genres)
   */
  readonly confidence: number

  /**
   * Full pattern objects that matched this progression.
   * Includes pattern name, weight, description, examples, and era.
   * Provides rich context for understanding why this genre was detected.
   * Array may be empty if genre is 'unknown'.
   */
  readonly matchedPatterns: readonly GenrePattern[]
}

/**
 * @deprecated Use GenreDetectionResult instead (renamed in v2.0.0)
 *
 * The original GenreScore interface used `evidence: string[]` which only
 * contained pattern names. The new GenreDetectionResult uses
 * `matchedPatterns: GenrePattern[]` which provides full pattern objects
 * with weights, descriptions, and song examples.
 *
 * **Migration:**
 * ```typescript
 * // Old (v1.x):
 * const result: GenreScore = detectGenre(...)
 * console.log(result.evidence) // ['ii-V-I', 'iii-VI-ii-V']
 *
 * // New (v2.x):
 * const result: GenreDetectionResult = detectGenre(...)
 * console.log(result.matchedPatterns[0].pattern)      // 'ii-V-I'
 * console.log(result.matchedPatterns[0].description)  // 'Fundamental jazz turnaround'
 * console.log(result.matchedPatterns[0].examples)     // ['Autumn Leaves - ...']
 * ```
 *
 * This type alias will be removed in v3.0.0 (after 6-month deprecation period).
 *
 * @since v1.0.0
 */
export type GenreScore = GenreDetectionResult

/**
 * Options for genre pattern detection.
 */
export interface GenrePatternOptions {
  /**
   * Optional genre hint to weight pattern detection.
   * If provided, only patterns from this genre will be checked.
   * @optional
   */
  readonly genre?: Genre
}
