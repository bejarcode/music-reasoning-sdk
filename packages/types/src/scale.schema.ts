/**
 * TypeScript Contracts: Scale System
 *
 * Type definitions for scale generation, modal analysis, and scale relationships.
 * All types enforce TypeScript strict mode with no `any` types.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

/**
 * Scale degree with descriptive name.
 *
 * @remarks
 * Represents a single degree within a scale with its note name,
 * numeric degree, and classical music theory term.
 *
 * @example
 * ```typescript
 * const tonic: ScaleDegree = {
 *   note: 'C',
 *   degree: 1,
 *   name: 'tonic'
 * }
 * ```
 */
export interface ScaleDegree {
  /** Note name at this degree (e.g., "C", "D", "E") */
  readonly note: string

  /**
   * Scale degree number (1-based indexing).
   * - For 7-note scales: 1-7
   * - For pentatonic: 1-5
   * - Range: 1 or greater
   */
  readonly degree: number

  /**
   * Classical name for this degree.
   * - 1: "tonic"
   * - 2: "supertonic"
   * - 3: "mediant"
   * - 4: "subdominant"
   * - 5: "dominant"
   * - 6: "submediant"
   * - 7: "leading tone" (major) or "subtonic" (natural minor)
   */
  readonly name: string
}

/**
 * Complete information about a musical scale.
 *
 * @remarks
 * This entity is returned by the `getScale()` function. It provides
 * comprehensive scale information including notes, intervals, formulas,
 * relationships, and modal variations.
 *
 * Note: Function name changed from `generateScale()` to `getScale()` for
 * consistency with other API functions (identifyChord, analyzeProgression).
 *
 * @example
 * ```typescript
 * const result = getScale('C', 'major')
 * // result.notes === ['C', 'D', 'E', 'F', 'G', 'A', 'B']
 * // result.formula === 'W-W-H-W-W-W-H'
 * // result.modes.length === 7
 * ```
 */
export interface ScaleInfo {
  /** Full scale name (e.g., "C major", "A natural minor", "D dorian") */
  readonly scale: string

  /** Root note of the scale (e.g., "C", "A", "D") */
  readonly root: string

  /**
   * Scale type (e.g., "major", "minor", "dorian", "harmonic minor", "blues").
   * Valid types include: major, minor, dorian, phrygian, lydian, mixolydian,
   * aeolian, locrian, harmonic minor, melodic minor, pentatonic, blues,
   * whole tone, diminished.
   */
  readonly type: string

  /**
   * Scale notes in order (e.g., ["C", "D", "E", "F", "G", "A", "B"]).
   * Length: 5-12 notes (pentatonic to chromatic).
   */
  readonly notes: readonly string[]

  /**
   * Intervals from root using proper notation.
   * Format: quality + number (e.g., "P1", "M2", "M3", "P4", "P5", "M6", "M7")
   * Length matches notes.length.
   */
  readonly intervals: readonly string[]

  /**
   * Scale degrees with descriptive names.
   * Length matches notes.length.
   */
  readonly degrees: readonly ScaleDegree[]

  /**
   * Step formula using whole steps (W) and half steps (H).
   * Example: "W-W-H-W-W-W-H" for major scale.
   * May include "W+H" for minor 3rd intervals.
   */
  readonly formula: string

  /**
   * Relative minor scale (for major scales only).
   * Example: "A minor" for "C major" (3 semitones down).
   * @optional
   */
  readonly relativeMinor?: string

  /**
   * Relative major scale (for minor scales only).
   * Example: "C major" for "A minor" (3 semitones up).
   * @optional
   */
  readonly relativeMajor?: string

  /**
   * Parallel minor scale (for major scales only).
   * Example: "C minor" for "C major" (same root, minor quality).
   * @optional
   */
  readonly parallelMinor?: string

  /**
   * Parallel major scale (for minor scales only).
   * Example: "C major" for "C minor" (same root, major quality).
   * @optional
   */
  readonly parallelMajor?: string

  /**
   * All 7 modal rotations of the scale (for 7-note diatonic scales).
   * Example for C major: ["C ionian", "D dorian", "E phrygian", ...]
   * Empty array for non-diatonic scales (pentatonic, blues, etc.).
   */
  readonly modes: readonly string[]
}
