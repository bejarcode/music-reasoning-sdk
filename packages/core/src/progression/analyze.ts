/**
 * Harmonic Function Analysis
 *
 * Maps scale degrees to harmonic functions in tonal harmony theory.
 * Provides utility functions for analyzing chord roles within a key.
 *
 * Harmonic Functions:
 * - Tonic (I/i): Home chord, stable, point of rest
 * - Subdominant (IV/iv): Pre-dominant, prepares dominant
 * - Dominant (V/v): Creates tension, resolves to tonic
 * - Deceptive (VI/vi): Deceptive resolution target (V → vi)
 * - Passing (II, III, VII): Transitional chords
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import type { HarmonicFunction } from '@music-reasoning/types'

/**
 * Get the harmonic function for a scale degree
 *
 * @param degree - Scale degree (1-7)
 * @param quality - Chord quality (e.g., "major", "minor", "dominant")
 * @returns Harmonic function classification
 *
 * @example
 * ```typescript
 * getHarmonicFunction(1, 'major') // => 'tonic'
 * getHarmonicFunction(4, 'major') // => 'subdominant'
 * getHarmonicFunction(5, 'dominant') // => 'dominant'
 * getHarmonicFunction(6, 'minor') // => 'deceptive'
 * ```
 *
 * @remarks
 * Harmonic function is determined primarily by scale degree:
 * - Degree I/i: Tonic (home, stable)
 * - Degree IV/iv: Subdominant (pre-dominant)
 * - Degree V/v: Dominant (tension, resolves to tonic)
 * - Degree VI/vi: Deceptive (deceptive cadence target)
 * - Degrees II, III, VII: Passing (transitional)
 */
export function getHarmonicFunction(degree: number, _quality: string): HarmonicFunction {
  switch (degree) {
    case 1:
      // Tonic (I/i) - Home chord, stable
      return 'tonic'

    case 2:
      // Supertonic (ii) - Subdominant function (pre-dominant)
      // Matches isSubdominantFunction which includes degree 2
      return 'subdominant'

    case 4:
      // Subdominant (IV/iv) - Pre-dominant function
      return 'subdominant'

    case 5:
      // Dominant (V/v) - Creates tension
      return 'dominant'

    case 6:
      // Deceptive (VI/vi) - Common deceptive resolution target
      return 'deceptive'

    case 3:
    case 7:
      // Passing chords (iii, vii°) - Transitional
      return 'passing'

    default:
      return 'passing'
  }
}

/**
 * Check if a chord has tonic function
 *
 * @param degree - Scale degree
 * @returns true if chord is tonic (degree I/i)
 */
export function isTonicFunction(degree: number): boolean {
  return degree === 1
}

/**
 * Check if a chord has dominant function
 *
 * @param degree - Scale degree
 * @returns true if chord is dominant (degree V/v)
 */
export function isDominantFunction(degree: number): boolean {
  return degree === 5
}

/**
 * Check if a chord has subdominant function
 *
 * @param degree - Scale degree
 * @returns true if chord is subdominant (degree IV/iv or ii)
 */
export function isSubdominantFunction(degree: number): boolean {
  return degree === 4 || degree === 2
}

/**
 * Get the expected resolution chord for a dominant chord
 *
 * @param degree - Current scale degree
 * @param quality - Current chord quality
 * @returns Expected resolution degree (usually 1 for tonic, or other for secondary dominants)
 *
 * @example
 * ```typescript
 * getExpectedResolution(5, 'dominant') // => 1 (V resolves to I)
 * getExpectedResolution(2, 'dominant') // => 5 (V/V resolves to V)
 * ```
 */
export function getExpectedResolution(degree: number, quality: string): number {
  if (quality === 'dominant' || quality.includes('7')) {
    if (degree === 5) {
      // V → I
      return 1
    }

    // Secondary dominant - resolves up a fourth (or down a fifth)
    // Correct modulo arithmetic: ((degree + 3 - 1) % 7) + 1
    // Example: V/V (degree 2) → ((2 + 3 - 1) % 7) + 1 = (4 % 7) + 1 = 5 (V)
    return ((degree + 3 - 1) % 7) + 1
  }

  return degree // No specific resolution expectation
}

/**
 * Determine if a chord progression represents a strong resolution
 *
 * @param fromDegree - Starting chord degree
 * @param toDegree - Resolution chord degree
 * @param fromQuality - Starting chord quality
 * @returns true if this is a strong resolution (e.g., V → I)
 */
export function isStrongResolution(
  fromDegree: number,
  toDegree: number,
  _fromQuality: string
): boolean {
  // Authentic cadence: V → I (all V to I motions are strong)
  // Dead branch removed: second check was redundant (subset of first check)
  return fromDegree === 5 && toDegree === 1
}

/**
 * Determine if a chord progression represents a deceptive resolution
 *
 * @param fromDegree - Starting chord degree
 * @param toDegree - Resolution chord degree
 * @returns true if this is a deceptive resolution (V → vi)
 */
export function isDeceptiveResolution(fromDegree: number, toDegree: number): boolean {
  // Deceptive cadence: V → vi
  return fromDegree === 5 && toDegree === 6
}

/**
 * Determine if a chord progression represents a plagal resolution
 *
 * @param fromDegree - Starting chord degree
 * @param toDegree - Resolution chord degree
 * @returns true if this is a plagal resolution (IV → I)
 */
export function isPlagalResolution(fromDegree: number, toDegree: number): boolean {
  // Plagal cadence: IV → I
  return fromDegree === 4 && toDegree === 1
}
