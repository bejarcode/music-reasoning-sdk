/**
 * Scale Degree Naming and Analysis
 *
 * Provides functions for naming scale degrees with proper music theory terminology.
 * Handles 1-based indexing and traditional scale degree names (tonic, supertonic, etc.)
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import type { ScaleDegree } from '@music-reasoning/types'

/**
 * Traditional scale degree names for diatonic (7-note) scales
 *
 * These names are derived from classical music theory and represent
 * the function of each degree in tonal harmony.
 */
const DIATONIC_DEGREE_NAMES = [
  'tonic', // 1st degree - the root/home note
  'supertonic', // 2nd degree - above the tonic
  'mediant', // 3rd degree - midway between tonic and dominant
  'subdominant', // 4th degree - below the dominant
  'dominant', // 5th degree - the most important note after the tonic
  'submediant', // 6th degree - midway between subdominant and tonic (octave)
  'leading tone', // 7th degree - leads to the tonic
] as const

/**
 * Alternative names for the 7th degree in minor scales
 */
const MINOR_SEVENTH_NAMES = {
  harmonic: 'leading tone', // Harmonic minor has raised 7th
  melodic: 'leading tone', // Melodic minor has raised 7th (ascending)
  natural: 'subtonic', // Natural minor has lowered 7th
} as const

/**
 * Generic scale degree names for non-diatonic scales
 *
 * Uses ordinal numbers for scales that don't follow diatonic patterns.
 */
const GENERIC_DEGREE_NAMES = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
] as const

/**
 * Gets the traditional name for a scale degree in diatonic scales
 *
 * @param degree - Scale degree (1-based index)
 * @param scaleType - Scale type (for context-specific naming)
 * @returns Traditional degree name
 *
 * @example
 * ```typescript
 * getDiatonicDegreeName(1, 'major') // 'tonic'
 * getDiatonicDegreeName(5, 'major') // 'dominant'
 * getDiatonicDegreeName(7, 'major') // 'leading tone'
 * getDiatonicDegreeName(7, 'minor') // 'subtonic' (natural minor)
 * ```
 *
 * @since v2.0.0
 */
export function getDiatonicDegreeName(degree: number, scaleType: string): string {
  // Validate degree (1-7 for diatonic scales)
  if (degree < 1 || degree > 7) {
    throw new Error(`Invalid diatonic degree: ${String(degree)}. Must be between 1-7.`)
  }

  // Special handling for 7th degree in minor scales
  if (degree === 7 && scaleType.toLowerCase().includes('minor')) {
    // Check if it's natural minor (subtonic) or harmonic/melodic (leading tone)
    if (
      scaleType.toLowerCase() === 'minor' ||
      scaleType.toLowerCase() === 'natural minor' ||
      scaleType.toLowerCase() === 'aeolian'
    ) {
      return MINOR_SEVENTH_NAMES.natural
    } else if (scaleType.toLowerCase().includes('harmonic')) {
      return MINOR_SEVENTH_NAMES.harmonic
    } else if (scaleType.toLowerCase().includes('melodic')) {
      return MINOR_SEVENTH_NAMES.melodic
    }
  }

  // Return traditional diatonic name
  const nameIndex = degree - 1
  if (nameIndex < 0 || nameIndex >= DIATONIC_DEGREE_NAMES.length) {
    throw new Error(`Invalid degree: ${String(degree)}. Must be between 1-7.`)
  }
  const name = DIATONIC_DEGREE_NAMES[nameIndex]
  // TypeScript guard: bounds check above guarantees name exists
  if (!name) throw new Error('Degree name is undefined')
  return name
}

/**
 * Gets a generic ordinal name for a scale degree
 *
 * Used for non-diatonic scales (pentatonic, blues, exotic, etc.)
 *
 * @param degree - Scale degree (1-based index)
 * @returns Ordinal degree name
 *
 * @example
 * ```typescript
 * getGenericDegreeName(1) // 'first'
 * getGenericDegreeName(5) // 'fifth'
 * getGenericDegreeName(8) // 'eighth'
 * ```
 *
 * @since v2.0.0
 */
export function getGenericDegreeName(degree: number): string {
  if (degree < 1 || degree > GENERIC_DEGREE_NAMES.length) {
    throw new Error(
      `Invalid degree: ${String(degree)}. Must be between 1-${String(GENERIC_DEGREE_NAMES.length)}.`
    )
  }

  const nameIndex = degree - 1
  if (nameIndex < 0 || nameIndex >= GENERIC_DEGREE_NAMES.length) {
    throw new Error(
      `Invalid degree: ${String(degree)}. Must be between 1-${String(GENERIC_DEGREE_NAMES.length)}.`
    )
  }
  const name = GENERIC_DEGREE_NAMES[nameIndex]
  // TypeScript guard: bounds check above guarantees name exists
  if (!name) throw new Error('Degree name is undefined')
  return name
}

/**
 * Determines if a scale type uses diatonic degree naming
 *
 * Diatonic scales (7-note scales) use classical music theory names like "tonic",
 * "supertonic", "mediant", etc. Non-diatonic scales (pentatonic, blues, exotic)
 * use generic ordinal names like "first", "second", "third", etc.
 *
 * @param scaleType - Scale type to check
 * @returns true if scale uses diatonic naming (tonic, dominant, etc.), false for generic naming (first, second, etc.)
 *
 * @example
 * ```typescript
 * usesDiatonicNaming('major')           // true - uses "tonic", "dominant"
 * usesDiatonicNaming('dorian')          // true - uses "supertonic", "mediant"
 * usesDiatonicNaming('minor pentatonic') // false - uses "first", "second"
 * usesDiatonicNaming('blues')           // false - uses "first", "second"
 * ```
 *
 * @since v2.0.0
 */
export function usesDiatonicNaming(scaleType: string): boolean {
  const normalized = scaleType.toLowerCase().trim()

  // 7-note scales use diatonic naming
  const diatonicTypes = new Set([
    'major',
    'minor',
    'natural minor',
    'harmonic minor',
    'melodic minor',
    'ionian',
    'dorian',
    'phrygian',
    'lydian',
    'mixolydian',
    'aeolian',
    'locrian',
  ])

  return diatonicTypes.has(normalized)
}

/**
 * Creates a ScaleDegree object for a given note and position
 *
 * @param note - The note name (e.g., 'C', 'D#', 'Eb')
 * @param degree - The scale degree (1-based index)
 * @param scaleType - The scale type (for proper naming)
 * @returns ScaleDegree object with note, degree, and name
 *
 * @example
 * ```typescript
 * createScaleDegree('C', 1, 'major')
 * // { note: 'C', degree: 1, name: 'tonic' }
 *
 * createScaleDegree('G', 5, 'major')
 * // { note: 'G', degree: 5, name: 'dominant' }
 *
 * createScaleDegree('C', 1, 'major pentatonic')
 * // { note: 'C', degree: 1, name: 'first' }
 * ```
 *
 * @since v2.0.0
 */
export function createScaleDegree(note: string, degree: number, scaleType: string): ScaleDegree {
  // Determine the appropriate name based on scale type
  const name = usesDiatonicNaming(scaleType)
    ? getDiatonicDegreeName(degree, scaleType)
    : getGenericDegreeName(degree)

  return {
    note,
    degree,
    name,
  }
}

/**
 * Creates an array of ScaleDegree objects for a scale
 *
 * @param notes - Array of note names in the scale
 * @param scaleType - The scale type (for proper naming)
 * @returns Array of ScaleDegree objects
 *
 * @example
 * ```typescript
 * createScaleDegrees(['C', 'D', 'E', 'F', 'G', 'A', 'B'], 'major')
 * // [
 * //   { note: 'C', degree: 1, name: 'tonic' },
 * //   { note: 'D', degree: 2, name: 'supertonic' },
 * //   { note: 'E', degree: 3, name: 'mediant' },
 * //   { note: 'F', degree: 4, name: 'subdominant' },
 * //   { note: 'G', degree: 5, name: 'dominant' },
 * //   { note: 'A', degree: 6, name: 'submediant' },
 * //   { note: 'B', degree: 7, name: 'leading tone' },
 * // ]
 * ```
 *
 * @since v2.0.0
 */
export function createScaleDegrees(notes: readonly string[], scaleType: string): ScaleDegree[] {
  return notes.map((note, index) => createScaleDegree(note, index + 1, scaleType))
}

/**
 * Gets the Roman numeral representation for a scale degree
 *
 * Used in harmonic analysis and chord progressions.
 *
 * @param degree - Scale degree (1-based index)
 * @param quality - Optional quality indicator ('major', 'minor', 'diminished', 'augmented')
 * @returns Roman numeral string
 *
 * @example
 * ```typescript
 * getRomanNumeral(1, 'major') // 'I'
 * getRomanNumeral(2, 'minor') // 'ii'
 * getRomanNumeral(5, 'major') // 'V'
 * getRomanNumeral(7, 'diminished') // 'vii°'
 * ```
 *
 * @since v2.0.0
 */
export function getRomanNumeral(
  degree: number,
  quality?: 'major' | 'minor' | 'diminished' | 'augmented'
): string {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

  if (degree < 1 || degree > 7) {
    throw new Error(`Invalid degree: ${String(degree)}. Must be between 1-7.`)
  }

  const numeralIndex = degree - 1
  if (numeralIndex < 0 || numeralIndex >= numerals.length) {
    throw new Error(`Invalid degree: ${String(degree)}. Must be between 1-7.`)
  }
  const numeralValue = numerals[numeralIndex]
  // TypeScript guard: bounds check above guarantees numeral exists
  if (!numeralValue) throw new Error('Numeral is undefined')
  let numeral = numeralValue

  // Apply quality
  if (quality === 'minor') {
    numeral = numeral.toLowerCase()
  } else if (quality === 'diminished') {
    numeral = numeral.toLowerCase() + '°'
  } else if (quality === 'augmented') {
    numeral = numeral + '+'
  }
  // 'major' or undefined keeps uppercase

  return numeral
}

/**
 * Gets the functional name for a scale degree in tonal harmony
 *
 * Groups degrees by their harmonic function (tonic, predominant, dominant)
 *
 * @param degree - Scale degree (1-based index)
 * @returns Functional category
 *
 * @example
 * ```typescript
 * getHarmonicFunction(1) // 'tonic'
 * getHarmonicFunction(4) // 'predominant'
 * getHarmonicFunction(5) // 'dominant'
 * ```
 *
 * @since v2.0.0
 */
export function getHarmonicFunction(
  degree: number
): 'tonic' | 'predominant' | 'dominant' | 'mediant' {
  if (degree < 1 || degree > 7) {
    throw new Error(`Invalid degree: ${String(degree)}. Must be between 1-7.`)
  }

  // Harmonic function categories
  const functions: Record<number, 'tonic' | 'predominant' | 'dominant' | 'mediant'> = {
    1: 'tonic', // I - Tonic
    2: 'predominant', // ii - Predominant
    3: 'mediant', // iii - Mediant (tonic expansion)
    4: 'predominant', // IV - Predominant (subdominant)
    5: 'dominant', // V - Dominant
    6: 'mediant', // vi - Mediant (tonic substitute)
    7: 'dominant', // vii° - Dominant (leading tone)
  }

  const func = functions[degree]
  if (!func) {
    throw new Error(`Invalid degree: ${String(degree)}. Must be between 1-7.`)
  }
  // Type is already narrowed by the check above, no assertion needed
  return func
}
