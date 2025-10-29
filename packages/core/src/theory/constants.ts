/**
 * Music Theory Constants
 *
 * Central repository for all music theory constants used throughout the engine.
 * Includes scale degree names, chord quality mappings, valid notes, and formulas.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

/**
 * Scale degree names in order (1-7).
 *
 * Used for labeling scale degrees with their traditional names.
 *
 * @since v1.0.0
 */
export const SCALE_DEGREE_NAMES: readonly string[] = [
  'tonic', // 1st degree - home note
  'supertonic', // 2nd degree - above the tonic
  'mediant', // 3rd degree - midway between tonic and dominant
  'subdominant', // 4th degree - below the dominant
  'dominant', // 5th degree - strongest pull to tonic
  'submediant', // 6th degree - midway between subdominant and tonic
  'leading tone', // 7th degree - leads to tonic (or subtonic if lowered)
] as const

/**
 * Expected chord qualities for each degree in a major key.
 *
 * Maps scale degrees (1-7) to their diatonic chord qualities.
 *
 * @example
 * ```typescript
 * MAJOR_KEY_CHORD_QUALITIES[0]  // 'major'      (I)
 * MAJOR_KEY_CHORD_QUALITIES[1]  // 'minor'      (ii)
 * MAJOR_KEY_CHORD_QUALITIES[4]  // 'major'      (V)
 * ```
 *
 * @since v1.0.0
 */
export const MAJOR_KEY_CHORD_QUALITIES: readonly string[] = [
  'major', // I
  'minor', // ii
  'minor', // iii
  'major', // IV
  'major', // V
  'minor', // vi
  'diminished', // vii°
] as const

/**
 * Expected chord qualities for each degree in a natural minor key.
 *
 * Maps scale degrees (1-7) to their diatonic chord qualities.
 *
 * @example
 * ```typescript
 * MINOR_KEY_CHORD_QUALITIES[0]  // 'minor'      (i)
 * MINOR_KEY_CHORD_QUALITIES[2]  // 'major'      (III)
 * MINOR_KEY_CHORD_QUALITIES[4]  // 'minor'      (v)
 * ```
 *
 * @since v1.0.0
 */
export const MINOR_KEY_CHORD_QUALITIES: readonly string[] = [
  'minor', // i
  'diminished', // ii°
  'major', // III
  'minor', // iv
  'minor', // v (natural minor)
  'major', // VI
  'major', // VII
] as const

/**
 * All valid note names (pitch classes) in Western music.
 *
 * Includes natural notes, sharps, and flats.
 *
 * @since v1.0.0
 */
export const VALID_NOTE_NAMES: readonly string[] = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
] as const

/**
 * Natural note names only (no accidentals).
 *
 * @since v1.0.0
 */
export const NATURAL_NOTES: readonly string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/**
 * Scale formulas using W (whole step) and H (half step) notation.
 *
 * Maps scale type names to their interval formulas.
 *
 * @example
 * ```typescript
 * SCALE_FORMULAS['major']           // 'W-W-H-W-W-W-H'
 * SCALE_FORMULAS['natural minor']   // 'W-H-W-W-H-W-W'
 * SCALE_FORMULAS['harmonic minor']  // 'W-H-W-W-H-W+H-H'
 * ```
 *
 * @since v1.0.0
 */
export const SCALE_FORMULAS: Readonly<Record<string, string>> = {
  // Major scales
  major: 'W-W-H-W-W-W-H',
  ionian: 'W-W-H-W-W-W-H', // Same as major

  // Natural minor
  minor: 'W-H-W-W-H-W-W',
  'natural minor': 'W-H-W-W-H-W-W',
  aeolian: 'W-H-W-W-H-W-W', // Same as natural minor

  // Minor variations
  'harmonic minor': 'W-H-W-W-H-W+H-H',
  'melodic minor': 'W-H-W-W-W-W-H',

  // Modes (medieval modes)
  dorian: 'W-H-W-W-W-H-W',
  phrygian: 'H-W-W-W-H-W-W',
  lydian: 'W-W-W-H-W-W-H',
  mixolydian: 'W-W-H-W-W-H-W',
  locrian: 'H-W-W-H-W-W-W',

  // Pentatonic scales
  'major pentatonic': 'W-W-W+H-W-W+H',
  'minor pentatonic': 'W+H-W-W-W+H-W',

  // Blues scale (6 notes)
  blues: 'W+H-W-H-H-W+H-W',

  // Exotic/symmetric scales
  'whole tone': 'W-W-W-W-W-W',
  diminished: 'W-H-W-H-W-H-W-H', // Octatonic (whole-half)
  'diminished half-whole': 'H-W-H-W-H-W-H-W', // Octatonic (half-whole)
} as const

/**
 * Number of semitones in musical intervals.
 *
 * @since v1.0.0
 */
export const SEMITONES: Readonly<Record<string, number>> = {
  unison: 0,
  'minor 2nd': 1,
  'major 2nd': 2,
  'minor 3rd': 3,
  'major 3rd': 4,
  'perfect 4th': 5,
  tritone: 6,
  'perfect 5th': 7,
  'minor 6th': 8,
  'major 6th': 9,
  'minor 7th': 10,
  'major 7th': 11,
  octave: 12,
} as const

/**
 * Common chord quality mappings.
 *
 * Maps full quality names to common abbreviations.
 *
 * @since v1.0.0
 */
export const CHORD_QUALITY_NAMES: Readonly<Record<string, string>> = {
  major: 'major',
  minor: 'minor',
  diminished: 'dim',
  augmented: 'aug',
  dominant: 'dom',
  'major 7th': 'maj7',
  'minor 7th': 'min7',
  'dominant 7th': 'dom7',
  'half-diminished': 'ø',
  'fully-diminished': 'dim7',
} as const
