/**
 * General Pattern Matching
 *
 * Detects common (non-genre-specific) chord progression patterns.
 * Includes classical patterns, jazz turnarounds, and popular progressions.
 *
 * Pattern Database:
 * - Authentic cadence progressions (I-IV-V-I, I-V-I)
 * - Jazz turnarounds (I-vi-ii-V, ii-V-I, iii-VI-ii-V)
 * - Popular progressions (I-V-vi-IV, vi-IV-I-V, I-vi-IV-V)
 * - Classical progressions (circle of fifths, etc.)
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import type { Pattern } from '@music-reasoning/types'

/**
 * Common progression pattern definition
 */
interface PatternDefinition {
  /** Pattern name in Roman numerals */
  readonly name: string
  /** Roman numeral sequence to match */
  readonly sequence: readonly string[]
  /** Pattern type/classification */
  readonly type: string
  /** How common this pattern is */
  readonly popularity: 'very common' | 'common' | 'uncommon' | 'rare'
}

/**
 * Database of common (general) chord progression patterns
 */
const COMMON_PATTERNS: readonly PatternDefinition[] = [
  // ============================================================================
  // Authentic Cadence Progressions
  // ============================================================================
  {
    name: 'I-IV-V-I',
    sequence: ['I', 'IV', 'V', 'I'],
    type: 'authentic cadence progression',
    popularity: 'very common',
  },
  {
    name: 'I-V-I',
    sequence: ['I', 'V', 'I'],
    type: 'authentic cadence progression',
    popularity: 'very common',
  },
  {
    name: 'I-IV-I-V-I',
    sequence: ['I', 'IV', 'I', 'V', 'I'],
    type: 'authentic cadence progression',
    popularity: 'common',
  },

  // ============================================================================
  // Jazz Turnarounds
  // ============================================================================
  {
    name: 'ii-V-I',
    sequence: ['ii', 'V', 'I'],
    type: 'jazz turnaround',
    popularity: 'very common',
  },
  {
    name: 'ii7-V7-I',
    sequence: ['ii7', 'V7', 'I'],
    type: 'jazz turnaround',
    popularity: 'very common',
  },
  {
    name: 'ii7-V7-Imaj7',
    sequence: ['ii7', 'V7', 'Imaj7'],
    type: 'jazz turnaround',
    popularity: 'very common',
  },
  {
    name: 'I-vi-ii-V',
    sequence: ['I', 'vi', 'ii', 'V'],
    type: 'jazz turnaround',
    popularity: 'very common',
  },
  {
    name: 'iii-VI-ii-V',
    sequence: ['iii', 'VI', 'ii', 'V'],
    type: 'jazz turnaround',
    popularity: 'common',
  },

  // ============================================================================
  // Popular/Pop Progressions
  // ============================================================================
  {
    name: 'I-V-vi-IV',
    sequence: ['I', 'V', 'vi', 'IV'],
    type: 'popular progression',
    popularity: 'very common',
  },
  {
    name: 'vi-IV-I-V',
    sequence: ['vi', 'IV', 'I', 'V'],
    type: 'popular progression',
    popularity: 'very common',
  },
  {
    name: 'I-vi-IV-V',
    sequence: ['I', 'vi', 'IV', 'V'],
    type: 'popular progression',
    popularity: 'very common',
  },
  {
    name: 'I-IV-vi-V',
    sequence: ['I', 'IV', 'vi', 'V'],
    type: 'popular progression',
    popularity: 'common',
  },

  // ============================================================================
  // Minor Key Progressions
  // ============================================================================
  {
    name: 'i-iv-V',
    sequence: ['i', 'iv', 'V'],
    type: 'minor key progression',
    popularity: 'very common',
  },
  {
    name: 'i-VI-III-VII',
    sequence: ['i', 'VI', 'III', 'VII'],
    type: 'minor key progression',
    popularity: 'very common',
  },
  {
    name: 'i-VII-VI-V',
    sequence: ['i', 'VII', 'VI', 'V'],
    type: 'minor key progression',
    popularity: 'common',
  },

  // ============================================================================
  // Classical Progressions
  // ============================================================================
  // Note: I-vi-IV-V already listed in "Popular Progressions" section
  {
    name: 'I-ii-V-I',
    sequence: ['I', 'ii', 'V', 'I'],
    type: 'classical progression',
    popularity: 'common',
  },

  // ============================================================================
  // Deceptive Progressions
  // ============================================================================
  {
    name: 'I-IV-V-vi',
    sequence: ['I', 'IV', 'V', 'vi'],
    type: 'deceptive cadence progression',
    popularity: 'common',
  },
]

/**
 * Normalize Roman numeral for pattern matching
 *
 * @param roman - Roman numeral string (e.g., "I", "ii7", "Vmaj7")
 * @returns Normalized Roman numeral (e.g., "I", "ii", "V")
 *
 * @remarks
 * Strips extensions (7, maj7, 9, etc.) but preserves case and diminished/augmented markers
 */
function normalizeRoman(roman: string): string {
  // Remove numeric extensions but keep case and quality markers
  return roman.replace(/maj7|7|9|11|13|6/g, '').replace(/\s+/g, '')
}

/**
 * Check if a Roman numeral sequence matches a pattern
 *
 * @param romanNumerals - Sequence of Roman numerals from progression
 * @param pattern - Pattern to match against
 * @returns true if sequence matches pattern
 *
 * @remarks
 * - Matches are case-sensitive (I ≠ i)
 * - Extensions are ignored (V7 matches V, Imaj7 matches I)
 * - Pattern must match exactly (same length and order)
 */
function matchesPattern(romanNumerals: readonly string[], pattern: readonly string[]): boolean {
  if (romanNumerals.length !== pattern.length) {
    return false
  }

  for (let i = 0; i < romanNumerals.length; i++) {
    const roman = romanNumerals[i]
    const expectedPattern = pattern[i]

    if (!roman || !expectedPattern) return false

    const normalized = normalizeRoman(roman)
    const normalizedPattern = normalizeRoman(expectedPattern)

    if (normalized !== normalizedPattern) {
      return false
    }
  }

  return true
}

/**
 * Find all matching patterns in a Roman numeral sequence
 *
 * @param romanNumerals - Array of Roman numerals (e.g., ['I', 'IV', 'V', 'I'])
 * @returns Array of matched patterns
 *
 * @remarks
 * - Checks for exact matches of full progression
 * - Also checks for patterns within longer progressions (substrings)
 *
 * @example
 * ```typescript
 * detectPatterns(['I', 'IV', 'V', 'I'])
 * // => [{ name: 'I-IV-V-I', type: 'authentic cadence progression', popularity: 'very common' }]
 *
 * detectPatterns(['ii7', 'V7', 'Imaj7'])
 * // => [{ name: 'ii-V-I', type: 'jazz turnaround', popularity: 'very common' }]
 * ```
 */
export function detectPatterns(romanNumerals: readonly string[]): Pattern[] {
  const matches: Pattern[] = []

  // Check for exact matches and substring matches
  for (const patternDef of COMMON_PATTERNS) {
    const patternLength = patternDef.sequence.length

    // Try to match pattern starting at each position
    for (let start = 0; start <= romanNumerals.length - patternLength; start++) {
      const subSequence = romanNumerals.slice(start, start + patternLength)

      if (matchesPattern(subSequence, patternDef.sequence)) {
        // Avoid duplicate matches
        const alreadyMatched = matches.some((m) => m.name === patternDef.name)
        if (!alreadyMatched) {
          matches.push({
            name: patternDef.name,
            type: patternDef.type,
            popularity: patternDef.popularity,
          })
        }
      }
    }
  }

  return matches
}

/**
 * Check if a progression contains a specific pattern
 *
 * @param romanNumerals - Sequence of Roman numerals
 * @param patternName - Name of pattern to search for (e.g., "ii-V-I")
 * @returns true if pattern is found
 */
export function hasPattern(romanNumerals: readonly string[], patternName: string): boolean {
  const patterns = detectPatterns(romanNumerals)
  return patterns.some((p) => p.name === patternName)
}

/**
 * Get all patterns of a specific type
 *
 * @param type - Pattern type (e.g., "jazz turnaround", "authentic cadence progression")
 * @returns Array of pattern definitions matching the type
 */
export function getPatternsByType(type: string): readonly PatternDefinition[] {
  return COMMON_PATTERNS.filter((p) => p.type === type)
}

/**
 * Get all very common patterns
 *
 * @returns Array of very common pattern definitions
 */
export function getVeryCommonPatterns(): readonly PatternDefinition[] {
  return COMMON_PATTERNS.filter((p) => p.popularity === 'very common')
}
