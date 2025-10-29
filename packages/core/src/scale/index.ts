/**
 * Scale Generation and Analysis
 *
 * Main entry point for scale-related functionality.
 * Provides the `getScale()` function for generating complete scale information.
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import { Scale } from 'tonal'
import type { ScaleInfo } from '@music-reasoning/types'
import { MusicTheoryError } from '../errors'
import { validateNote } from '../theory/notes'
import { getScaleDefinition, normalizeScaleType } from './list'
import { createScaleDegrees } from './degrees'
import { getModalScaleNames } from './modes'
import { calculateScaleRelationships, buildScaleName } from './relationships'

/**
 * Generates complete information about a musical scale
 *
 * @param root - Root note of the scale (e.g., 'C', 'F#', 'Bb')
 * @param scaleType - Type of scale (e.g., 'major', 'minor', 'dorian', 'harmonic minor')
 * @returns Complete ScaleInfo object with notes, intervals, degrees, and relationships
 * @throws {InvalidNoteError} If root note is invalid
 * @throws {MusicReasoningError} If scale type is not recognized
 *
 * @example
 * ```typescript
 * // C major scale
 * const cMajor = getScale('C', 'major')
 * // {
 * //   scale: 'C major',
 * //   root: 'C',
 * //   type: 'major',
 * //   notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
 * //   intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'],
 * //   degrees: [
 * //     { note: 'C', degree: 1, name: 'tonic' },
 * //     { note: 'D', degree: 2, name: 'supertonic' },
 * //     ...
 * //   ],
 * //   formula: 'W-W-H-W-W-W-H',
 * //   relativeMinor: 'A minor',
 * //   parallelMinor: 'C minor',
 * //   modes: ['C ionian', 'D dorian', 'E phrygian', ...]
 * // }
 *
 * // D dorian scale
 * const dDorian = getScale('D', 'dorian')
 * // {
 * //   scale: 'D dorian',
 * //   root: 'D',
 * //   type: 'dorian',
 * //   notes: ['D', 'E', 'F', 'G', 'A', 'B', 'C'],
 * //   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'm7'],
 * //   degrees: [...],
 * //   formula: 'W-H-W-W-W-H-W',
 * //   modes: ['D dorian', 'E phrygian', ...]
 * // }
 *
 * // A minor pentatonic (no modes for non-diatonic scales)
 * const aMinorPent = getScale('A', 'minor pentatonic')
 * // {
 * //   scale: 'A minor pentatonic',
 * //   root: 'A',
 * //   type: 'minor pentatonic',
 * //   notes: ['A', 'C', 'D', 'E', 'G'],
 * //   intervals: ['P1', 'm3', 'P4', 'P5', 'm7'],
 * //   degrees: [
 * //     { note: 'A', degree: 1, name: 'first' },
 * //     { note: 'C', degree: 2, name: 'second' },
 * //     ...
 * //   ],
 * //   formula: 'WH-W-W-WH-W',
 * //   modes: [] // No modal rotation for pentatonic
 * // }
 * ```
 *
 * @since v2.0.0
 */
export function getScale(root: string, scaleType: string): ScaleInfo {
  // ============================================================================
  // Step 1: Validate root note
  // ============================================================================

  if (!validateNote(root)) {
    throw new MusicTheoryError({
      code: 'INVALID_ROOT',
      message: `Invalid root note: ${root}`,
      details: { root },
      suggestion: 'Provide a valid note name (e.g., C, D#, Eb)',
    })
  }

  // ============================================================================
  // Step 2: Normalize and validate scale type
  // ============================================================================

  const normalizedType = normalizeScaleType(scaleType)

  if (!normalizedType) {
    throw new MusicTheoryError({
      code: 'INVALID_SCALE_TYPE',
      message: `Scale type "${scaleType}" is not recognized`,
      details: { scaleType },
      suggestion:
        'Use a recognized scale type (e.g., "major", "minor", "dorian", "harmonic minor")',
    })
  }

  // ============================================================================
  // Step 3: Get scale definition (intervals and formula)
  // ============================================================================

  const definition = getScaleDefinition(normalizedType)

  if (!definition) {
    throw new MusicTheoryError({
      code: 'INVALID_SCALE_TYPE',
      message: `Scale definition not found for type "${normalizedType}"`,
      details: { scaleType: normalizedType },
      suggestion: 'This scale type may not be fully implemented yet',
    })
  }

  // ============================================================================
  // Step 4: Generate scale using tonal.js
  // ============================================================================

  // Build the full scale name for tonal.js
  const scaleName = buildScaleName(root, normalizedType)
  const tonalScale = Scale.get(scaleName)

  // ESLint sees !tonalScale/!tonalScale.notes as always falsy, but Scale.get can return empty
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!tonalScale || !tonalScale.notes || tonalScale.notes.length === 0) {
    throw new MusicTheoryError({
      code: 'INTERNAL_ERROR',
      message: `Unable to generate scale "${scaleName}"`,
      details: { root, scaleType: normalizedType },
      suggestion: 'Check that the root note and scale type are valid',
    })
  }

  // ============================================================================
  // Step 5: Build scale degrees with proper naming
  // ============================================================================

  const degrees = createScaleDegrees(tonalScale.notes, normalizedType)

  // ============================================================================
  // Step 6: Calculate modal relationships (if applicable)
  // ============================================================================

  const modes = getModalScaleNames(root, normalizedType)

  // ============================================================================
  // Step 7: Calculate relative/parallel scale relationships
  // ============================================================================

  const relationships = calculateScaleRelationships(root, normalizedType)

  // ============================================================================
  // Step 8: Build and return complete ScaleInfo object
  // ============================================================================

  const scaleInfo: ScaleInfo = {
    scale: scaleName,
    root,
    type: normalizedType,
    notes: tonalScale.notes,
    intervals: definition.intervals,
    degrees,
    formula: definition.formula,
    modes,
    ...relationships, // Spread relationships (relativeMinor, relativeMajor, etc.)
  }

  return scaleInfo
}

// Export utility functions for advanced use cases
export { getScaleDefinition, normalizeScaleType, isMajorScaleType, isMinorScaleType } from './list'

export {
  createScaleDegree,
  createScaleDegrees,
  getDiatonicDegreeName,
  getGenericDegreeName,
  getRomanNumeral,
  getHarmonicFunction,
} from './degrees'

export {
  calculateModes,
  getModalScaleNames,
  identifyMode,
  getModalCharacteristics,
  isModalScale,
} from './modes'

export {
  getRelativeMinor,
  getRelativeMajor,
  getParallelMinor,
  getParallelMajor,
  getRelativeMinorScale,
  getRelativeMajorScale,
  getParallelMinorScale,
  getParallelMajorScale,
  getScaleRelationship,
  buildScaleName,
  supportsRelativeRelationship,
  supportsParallelRelationship,
  calculateScaleRelationships,
} from './relationships'

export type { ScaleRelationships } from './relationships'
