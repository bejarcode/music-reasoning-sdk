/**
 * Interval Calculation Utilities
 *
 * Provides functions for working with musical intervals using proper notation
 * (P1, M3, P5, etc.). Uses tonal.js Interval module as the underlying implementation.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import { Interval } from 'tonal'

/**
 * Converts semitone distance to proper interval notation.
 *
 * @param semitones - Number of semitones (0-12+)
 * @returns Interval string in proper notation (e.g., "P1", "M3", "P5")
 *
 * @example
 * ```typescript
 * getIntervalFromSemitones(0)   // 'P1' (Perfect unison)
 * getIntervalFromSemitones(2)   // 'M2' (Major second)
 * getIntervalFromSemitones(4)   // 'M3' (Major third)
 * getIntervalFromSemitones(5)   // 'P4' (Perfect fourth)
 * getIntervalFromSemitones(7)   // 'P5' (Perfect fifth)
 * getIntervalFromSemitones(12)  // 'P8' (Perfect octave)
 * ```
 *
 * @since v1.0.0
 */
export function getIntervalFromSemitones(semitones: number): string {
  // Strengthen validation: must be finite integer >= 0
  if (!Number.isFinite(semitones) || !Number.isInteger(semitones) || semitones < 0) {
    throw new Error(`Invalid semitone count: ${String(semitones)} (must be non-negative integer)`)
  }

  // Use tonal.js Interval.fromSemitones()
  const interval = Interval.fromSemitones(semitones)

  if (!interval) {
    throw new Error(`Could not determine interval for ${String(semitones)} semitones`)
  }

  return interval
}

/**
 * Converts interval notation to semitone distance.
 *
 * @param interval - Interval string in proper notation (e.g., "P1", "M3", "P5")
 * @returns Number of semitones
 * @throws {Error} If interval notation is invalid
 *
 * @example
 * ```typescript
 * getSemitonesFromInterval('P1')   // 0  (Perfect unison)
 * getSemitonesFromInterval('M2')   // 2  (Major second)
 * getSemitonesFromInterval('M3')   // 4  (Major third)
 * getSemitonesFromInterval('P4')   // 5  (Perfect fourth)
 * getSemitonesFromInterval('P5')   // 7  (Perfect fifth)
 * getSemitonesFromInterval('P8')   // 12 (Perfect octave)
 * ```
 *
 * @since v1.0.0
 */
export function getSemitonesFromInterval(interval: string): number {
  if (typeof interval !== 'string' || interval.trim() === '') {
    throw new Error(`Invalid interval: ${interval}`)
  }

  // Use tonal.js Interval.semitones()
  const semitones = Interval.semitones(interval)

  // ESLint sees semitones as always number, but Interval.semitones can return undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (semitones === null || semitones === undefined) {
    throw new Error(`Invalid interval notation: ${interval}`)
  }

  return semitones
}

/**
 * Normalizes an interval string using tonal.js canonical form.
 *
 * NOTE: This returns tonal.js format (number + quality, e.g., '3M', '5P').
 * For conversion to theoretical notation (quality + number, e.g., 'M3', 'P5'),
 * use the convertIntervalFormat() function in chord/identify.ts.
 *
 * @param interval - The interval string to normalize
 * @returns Normalized interval string in tonal.js format
 * @throws {Error} If interval is invalid
 *
 * @example
 * ```typescript
 * normalizeInterval('3M')   // '3M' (validates and normalizes)
 * normalizeInterval('5P')   // '5P'
 * normalizeInterval('m3')   // '3m' (normalizes case)
 * normalizeInterval('A4')   // '4A' (Augmented fourth / tritone)
 * ```
 *
 * @since v1.0.0
 */
export function normalizeInterval(interval: string): string {
  if (typeof interval !== 'string' || interval.trim() === '') {
    throw new Error(`Invalid interval: ${interval}`)
  }

  // Use tonal.js Interval.get() to parse and normalize to tonal.js format
  const parsed = Interval.get(interval)

  // ESLint sees !parsed as always falsy (Interval.get always returns object)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!parsed || !parsed.name || parsed.name === '') {
    throw new Error(`Invalid interval notation: ${interval}`)
  }

  return parsed.name
}
