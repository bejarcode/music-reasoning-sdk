/**
 * TypeScript Contracts: Chord System
 *
 * Type definitions for chord identification, building, and voicing operations.
 * All types enforce TypeScript strict mode with no `any` types.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

/**
 * Result of identifying a chord from a set of notes.
 *
 * @remarks
 * This entity is returned by the `identifyChord()` function. It provides
 * comprehensive information about the identified chord including alternatives
 * and a confidence score.
 *
 * Extends the base Chord type from @music-reasoning/types with additional
 * fields for comprehensive analysis.
 *
 * @example
 * ```typescript
 * const result = identifyChord(['C', 'E', 'G'])
 * // result.chord === 'C major'
 * // result.confidence === 1.0
 * // result.intervals === ['P1', 'M3', 'P5']
 * ```
 */
export interface ChordIdentification {
  /** Full chord name (e.g., "C major", "Dm7", "G7#5") */
  readonly chord: string

  /** Root note of the chord (e.g., "C", "D", "G") */
  readonly root: string

  /**
   * Chord quality/type (e.g., "major", "minor", "dominant").
   * Consistent with existing Chord.quality field.
   */
  readonly quality: string

  /**
   * Provided notes (preserves user-specified enharmonics).
   * Minimum length: 2
   */
  readonly notes: readonly string[]

  /**
   * Intervals from root using proper notation.
   * Format: quality + number (e.g., "P1", "M3", "P5")
   * Length matches `notes.length`.
   */
  readonly intervals: readonly string[]

  /**
   * Scale degrees (1-based indexing).
   * Length matches `notes.length`.
   */
  readonly degrees: readonly number[]

  /**
   * Alternative chord interpretations (up to 5).
   * Includes slash chords, inversions, and other valid interpretations.
   */
  readonly alternatives: readonly string[]

  /**
   * Confidence score for chord identification (0.0-1.0 inclusive).
   * - 1.0 = Perfect match (all notes match exactly)
   * - 0.8 = Subset match (missing notes)
   * - 0.6 = Superset match (extra notes)
   * - <0.6 = Partial match
   */
  readonly confidence: number
}

/**
 * Voicing configuration for a chord.
 *
 * @remarks
 * Defines how chord tones are arranged across octaves.
 *
 * @example
 * ```typescript
 * const voicing: Voicing = {
 *   type: 'drop2',
 *   notes: ['C4', 'G3', 'B4', 'E4']
 * }
 * ```
 */
export interface Voicing {
  /** Voicing type: close (within octave), open (spread), drop2 (2nd voice dropped), or drop3 (3rd voice dropped) */
  readonly type: 'close' | 'open' | 'drop2' | 'drop3'

  /**
   * Notes with octave numbers (e.g., ["C4", "E4", "G4", "B4"]).
   * Length matches parent chord's notes.length.
   */
  readonly notes: readonly string[]
}

/**
 * Result of building a chord from a chord symbol.
 *
 * @remarks
 * This entity is returned by the `buildChord()` function. It provides
 * the chord tones, voicing information, enharmonic alternatives, and
 * common substitutions.
 *
 * @example
 * ```typescript
 * const result = buildChord('Cmaj7', { voicing: 'close', octave: 4 })
 * // result.notes === ['C', 'E', 'G', 'B']
 * // result.voicing.notes === ['C4', 'E4', 'G4', 'B4']
 * ```
 */
export interface ChordBuild {
  /** Chord name from input symbol (e.g., "Cmaj7", "G7", "Dm7b5") */
  readonly chord: string

  /** Root note extracted from symbol (e.g., "C", "G", "D") */
  readonly root: string

  /**
   * Chord quality extracted from symbol (e.g., "maj7", "7", "m7b5").
   * Consistent with existing Chord.quality field.
   */
  readonly quality: string

  /**
   * Chord tones without octave numbers (e.g., ["C", "E", "G", "B"]).
   * Minimum length: 2
   */
  readonly notes: readonly string[]

  /**
   * Intervals from root (e.g., ["P1", "M3", "P5", "M7"]).
   * Length matches notes.length.
   */
  readonly intervals: readonly string[]

  /**
   * Scale degrees (1-based).
   * Length matches notes.length.
   */
  readonly degrees: readonly number[]

  /** Voicing information with octave numbers */
  readonly voicing: Voicing

  /**
   * Enharmonic spellings of the root note.
   * Always includes at least the original root.
   * Example: ["C", "B#", "Dbb"]
   */
  readonly enharmonics: readonly string[]

  /**
   * Common chord substitutions (up to 3).
   * Example for Cmaj7: ["C6", "Am7", "Em7"]
   */
  readonly commonSubstitutions: readonly string[]
}

/**
 * Options for building a chord.
 */
export interface ChordBuildOptions {
  /** Voicing type (default: 'close') */
  readonly voicing?: 'close' | 'open' | 'drop2' | 'drop3'

  /** Base octave for voicing (default: 4) */
  readonly octave?: number

  /** Enharmonic preference for note spellings */
  readonly enharmonic?: 'sharps' | 'flats' | 'preserve'
}

/**
 * Options for generating a voicing.
 */
export interface VoicingOptions {
  /** Voicing type */
  readonly type: 'close' | 'open' | 'drop2' | 'drop3'

  /** Base octave for voicing */
  readonly octave: number

  /** Chord inversion (0 = root position, 1 = first inversion, etc.) */
  readonly inversion?: number
}

/**
 * Chord substitution suggestion with explanation.
 */
export interface ChordSubstitution {
  /** Substitute chord symbol (e.g., "C6" for "Cmaj7") */
  readonly chord: string

  /** Explanation of why this substitution works */
  readonly reason: string
}
