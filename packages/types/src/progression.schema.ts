/**
 * TypeScript Contracts: Progression Analysis
 *
 * Type definitions for chord progression analysis, key detection, Roman numeral
 * analysis, cadence identification, and pattern recognition.
 * All types enforce TypeScript strict mode with no `any` types.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import type { GenrePattern, GenreDetectionResult, Genre } from './genre.schema'

/**
 * Harmonic function of a chord within a key.
 *
 * @remarks
 * Describes the functional role of a chord in tonal harmony.
 */
export type HarmonicFunction =
  | 'tonic' // Degree I/i - Home chord, stable
  | 'subdominant' // Degree IV/iv - Pre-dominant, moves to dominant
  | 'dominant' // Degree V/v - Creates tension, resolves to tonic
  | 'deceptive' // Degree VI/vi - Deceptive resolution (V to vi)
  | 'passing' // Degrees II, III, VII - Transitional chords

/**
 * Analysis of a single chord in the context of a key.
 *
 * @remarks
 * Provides Roman numeral, harmonic function, and additional context
 * for a chord within a detected key.
 *
 * @example
 * ```typescript
 * const analysis: ChordAnalysis = {
 *   chord: 'Dm7',
 *   roman: 'ii7',
 *   quality: 'minor',
 *   degree: 2,
 *   function: 'subdominant'
 * }
 * ```
 */
export interface ChordAnalysis {
  /** Original chord name from progression (e.g., "C", "Dm7", "G7") */
  readonly chord: string

  /**
   * Roman numeral in detected key.
   * Uppercase = major/augmented (I, IV, V)
   * Lowercase = minor/diminished (ii, iii, vi, vii°)
   * Example: "I", "ii7", "V7", "vi"
   */
  readonly roman: string

  /** Chord quality/type (e.g., "major", "minor", "dominant", "diminished") */
  readonly quality: string

  /**
   * Scale degree in key (1-7 inclusive).
   */
  readonly degree: number

  /** Harmonic function within the key */
  readonly function: HarmonicFunction

  /**
   * Whether this chord is borrowed from a parallel key.
   * Example: Fm in C major (borrowed from C minor).
   * @optional
   */
  readonly borrowed?: boolean

  /**
   * Target chord if this is a secondary dominant (V/x).
   * Example: "Am" if this chord is E7 (V/vi) in C major.
   * @optional
   */
  readonly secondaryDominant?: string
}

/**
 * Type of cadential motion.
 *
 * @remarks
 * Four primary cadence types in Western music theory.
 */
export type CadenceType =
  | 'authentic' // V → I (strong resolution)
  | 'plagal' // IV → I ("Amen" cadence, weak)
  | 'half' // x → V (ends on dominant, unresolved)
  | 'deceptive' // V → vi (surprise resolution)

/**
 * Identified cadence in a progression.
 *
 * @remarks
 * Represents a cadential motion between two chords.
 *
 * @example
 * ```typescript
 * const cadence: Cadence = {
 *   type: 'authentic',
 *   chords: ['G7', 'C'],
 *   strength: 'strong'
 * }
 * ```
 */
export interface Cadence {
  /** Type of cadence */
  readonly type: CadenceType

  /**
   * Two chords forming the cadence (e.g., ["G7", "C"]).
   * Always length 2.
   */
  readonly chords: readonly [string, string]

  /**
   * Cadence strength.
   * - 'strong': Authentic cadence (V → I)
   * - 'weak': Plagal, half, or deceptive cadences
   */
  readonly strength: 'strong' | 'weak'
}

/**
 * Chord borrowed from a parallel key.
 *
 * @remarks
 * Example: F minor (iv) in C major, borrowed from C minor.
 *
 * @example
 * ```typescript
 * const borrowed: BorrowedChord = {
 *   chord: 'Fm',
 *   borrowedFrom: 'C minor',
 *   function: 'subdominant'
 * }
 * ```
 */
export interface BorrowedChord {
  /** Borrowed chord name (e.g., "Fm", "Ab") */
  readonly chord: string

  /**
   * Parallel key from which the chord is borrowed.
   * Example: "C minor" when analyzing C major progression.
   */
  readonly borrowedFrom: string

  /** Harmonic function in the borrowed-from key */
  readonly function: string
}

/**
 * Secondary dominant chord with its target resolution.
 *
 * @remarks
 * Secondary dominants are dominant chords that resolve to a chord
 * other than the tonic. Notated as V/x (e.g., V7/vi).
 *
 * @example
 * ```typescript
 * const secondary: SecondaryDominant = {
 *   chord: 'E7',
 *   targetChord: 'Am',
 *   romanNotation: 'V7/vi'
 * }
 * ```
 */
export interface SecondaryDominant {
  /** Dominant chord (e.g., "E7", "A7") - must have dominant quality */
  readonly chord: string

  /** Target chord it resolves to (e.g., "Am", "Dm") */
  readonly targetChord: string

  /**
   * Roman numeral notation with slash.
   * Format: V(7)?/[roman]
   * Example: "V7/vi", "V/ii"
   */
  readonly romanNotation: string
}

/**
 * General (non-genre-specific) progression pattern.
 *
 * @remarks
 * Represents common patterns like I-IV-V-I, ii-V-I, etc.
 *
 * @example
 * ```typescript
 * const pattern: Pattern = {
 *   name: 'ii-V-I',
 *   type: 'turnaround',
 *   popularity: 'very common'
 * }
 * ```
 */
export interface Pattern {
  /** Pattern name in Roman numerals (e.g., "I-IV-V-I", "ii-V-I") */
  readonly name: string

  /** Pattern type/classification (e.g., "authentic cadence progression", "turnaround") */
  readonly type: string

  /** Frequency of use in music */
  readonly popularity: 'very common' | 'common' | 'uncommon' | 'rare'
}

/**
 * Comprehensive analysis of a chord progression.
 *
 * @remarks
 * This is the primary output of the `analyzeProgression()` function.
 * It provides key detection, per-chord analysis, pattern matching,
 * genre detection, cadence identification, and more.
 *
 * @example
 * ```typescript
 * const result = analyzeProgression(['C', 'Am', 'F', 'G'])
 * // result.key === 'C major'
 * // result.analysis[0].roman === 'I'
 * // result.cadences[0].type === 'authentic'
 * ```
 */
export interface ProgressionAnalysis {
  /**
   * Detected key of the progression (e.g., "C major", "A minor").
   * Determined by analyzing chord relationships and scale degrees.
   */
  readonly key: string

  /**
   * Confidence in key detection (0.0-1.0 inclusive).
   * - 1.0 = All chords diatonic to key
   * - 0.8+ = Mostly diatonic with some borrowed chords
   * - 0.5-0.8 = Moderately chromatic
   * - <0.5 = Highly chromatic or ambiguous
   */
  readonly confidence: number

  /**
   * Per-chord analysis in context of detected key.
   * Length matches input progression length.
   */
  readonly analysis: readonly ChordAnalysis[]

  /** General progression patterns detected (e.g., I-IV-V-I, ii-V-I) */
  readonly patterns: readonly Pattern[]

  /**
   * Genre-specific patterns detected.
   * See genre.schema.ts for GenrePattern definition.
   */
  readonly genrePatterns: readonly GenrePattern[]

  /**
   * Suggested genres with confidence scores (up to 3).
   * Sorted by confidence (highest first).
   * Returns full pattern objects with descriptions and song examples.
   * See genre.schema.ts for GenreDetectionResult definition.
   */
  readonly suggestedGenres: readonly GenreDetectionResult[]

  /** Chords borrowed from parallel keys */
  readonly borrowedChords: readonly BorrowedChord[]

  /** Secondary dominant chords with their targets */
  readonly secondaryDominants: readonly SecondaryDominant[]

  /** Identified cadences in the progression */
  readonly cadences: readonly Cadence[]

  /**
   * Whether the progression loops back to tonic.
   * True if:
   * - Last chord is dominant (V) and first is tonic (I), or
   * - Both first and last are tonic (I)
   */
  readonly loopable: boolean
}

/**
 * Options for analyzing a progression.
 */
export interface ProgressionAnalysisOptions {
  /**
   * Optional genre hint to weight pattern detection.
   * If provided, patterns from this genre will be prioritized.
   * @optional
   */
  readonly genre?: Genre
}
