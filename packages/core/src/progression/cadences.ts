/**
 * Cadence Detection
 *
 * Identifies cadential motions in chord progressions.
 * Detects four primary cadence types:
 * - Authentic (V → I): Strong resolution to tonic
 * - Plagal (IV → I): Weak resolution, "Amen" cadence
 * - Half (x → V): Ends on dominant, unresolved
 * - Deceptive (V → vi): Surprise resolution to submediant
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import type { Cadence, CadenceType, ChordAnalysis } from '@music-reasoning/types'

/**
 * Detect all cadences in a chord progression
 *
 * @param analysis - Array of analyzed chords with Roman numerals
 * @param chords - Original chord symbols
 * @returns Array of detected cadences
 *
 * @example
 * ```typescript
 * const analysis = [
 *   { roman: 'I', degree: 1, ... },
 *   { roman: 'IV', degree: 4, ... },
 *   { roman: 'V', degree: 5, ... },
 *   { roman: 'I', degree: 1, ... }
 * ]
 * const cadences = detectCadences(analysis, ['C', 'F', 'G', 'C'])
 * // => [
 * //   { type: 'authentic', chords: ['G', 'C'], strength: 'strong' }
 * // ]
 * ```
 *
 * @remarks
 * Scans consecutive chord pairs for cadential motions.
 * Returns all detected cadences with their types and strengths.
 */
export function detectCadences(analysis: readonly ChordAnalysis[], chords: string[]): Cadence[] {
  const cadences: Cadence[] = []

  if (analysis.length < 2) {
    return cadences
  }

  // Scan consecutive chord pairs
  for (let i = 0; i < analysis.length - 1; i++) {
    const current = analysis[i]
    const next = analysis[i + 1]
    const currentChord = chords[i]
    const nextChord = chords[i + 1]

    if (!current || !next || !currentChord || !nextChord) continue

    // Authentic cadence: V → I
    if (current.degree === 5 && next.degree === 1) {
      cadences.push({
        type: 'authentic',
        chords: [currentChord, nextChord],
        strength: 'strong',
      })
      continue
    }

    // Plagal cadence: IV → I
    if (current.degree === 4 && next.degree === 1) {
      cadences.push({
        type: 'plagal',
        chords: [currentChord, nextChord],
        strength: 'weak',
      })
      continue
    }

    // Deceptive cadence: V → vi
    if (current.degree === 5 && next.degree === 6) {
      cadences.push({
        type: 'deceptive',
        chords: [currentChord, nextChord],
        strength: 'weak',
      })
      continue
    }

    // Half cadence: x → V (any chord to dominant)
    if (next.degree === 5 && i === analysis.length - 2) {
      // Only count as half cadence if it's the final motion
      cadences.push({
        type: 'half',
        chords: [currentChord, nextChord],
        strength: 'weak',
      })
      continue
    }
  }

  return cadences
}

/**
 * Check if a progression contains an authentic cadence
 *
 * @param analysis - Array of analyzed chords
 * @returns true if an authentic cadence (V → I) is present
 */
export function hasAuthenticCadence(analysis: readonly ChordAnalysis[]): boolean {
  for (let i = 0; i < analysis.length - 1; i++) {
    const current = analysis[i]
    const next = analysis[i + 1]
    if (current && next && current.degree === 5 && next.degree === 1) {
      return true
    }
  }
  return false
}

/**
 * Check if a progression contains a plagal cadence
 *
 * @param analysis - Array of analyzed chords
 * @returns true if a plagal cadence (IV → I) is present
 */
export function hasPlagalCadence(analysis: readonly ChordAnalysis[]): boolean {
  for (let i = 0; i < analysis.length - 1; i++) {
    const current = analysis[i]
    const next = analysis[i + 1]
    if (current && next && current.degree === 4 && next.degree === 1) {
      return true
    }
  }
  return false
}

/**
 * Check if a progression contains a deceptive cadence
 *
 * @param analysis - Array of analyzed chords
 * @returns true if a deceptive cadence (V → vi) is present
 */
export function hasDeceptiveCadence(analysis: readonly ChordAnalysis[]): boolean {
  for (let i = 0; i < analysis.length - 1; i++) {
    const current = analysis[i]
    const next = analysis[i + 1]
    if (current && next && current.degree === 5 && next.degree === 6) {
      return true
    }
  }
  return false
}

/**
 * Check if a progression contains a half cadence
 *
 * @param analysis - Array of analyzed chords
 * @returns true if progression ends on dominant (V)
 */
export function hasHalfCadence(analysis: readonly ChordAnalysis[]): boolean {
  if (analysis.length < 2) return false
  const last = analysis[analysis.length - 1]
  return last ? last.degree === 5 : false
}

/**
 * Get the strongest cadence type present in a progression
 *
 * @param cadences - Array of detected cadences
 * @returns The strongest cadence type, or null if none found
 *
 * @remarks
 * Cadence strength hierarchy:
 * 1. Authentic (V → I) - strongest
 * 2. Plagal (IV → I)
 * 3. Deceptive (V → vi)
 * 4. Half (x → V) - weakest
 */
export function getStrongestCadence(cadences: readonly Cadence[]): CadenceType | null {
  if (cadences.length === 0) return null

  // Priority order: authentic > plagal > deceptive > half
  if (cadences.some((c) => c.type === 'authentic')) return 'authentic'
  if (cadences.some((c) => c.type === 'plagal')) return 'plagal'
  if (cadences.some((c) => c.type === 'deceptive')) return 'deceptive'
  if (cadences.some((c) => c.type === 'half')) return 'half'

  return null
}

/**
 * Count cadences by type
 *
 * @param cadences - Array of detected cadences
 * @returns Object with counts for each cadence type
 */
export function countCadencesByType(cadences: readonly Cadence[]): Record<CadenceType, number> {
  return {
    authentic: cadences.filter((c) => c.type === 'authentic').length,
    plagal: cadences.filter((c) => c.type === 'plagal').length,
    deceptive: cadences.filter((c) => c.type === 'deceptive').length,
    half: cadences.filter((c) => c.type === 'half').length,
  }
}
