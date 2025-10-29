/**
 * Scale Relationship Calculations
 *
 * Provides functions for calculating related scales (relative major/minor,
 * parallel major/minor) and understanding scale relationships.
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import { Note } from 'tonal'

/**
 * Scale relationship types
 */
export type ScaleRelationship = 'relative' | 'parallel' | 'none'

/**
 * Calculates the relative minor key for a major key
 *
 * The relative minor is 3 semitones (m3) below the major key.
 * They share the same key signature.
 *
 * @param majorRoot - Root note of the major key (e.g., 'C')
 * @returns Root note of the relative minor key (e.g., 'A')
 *
 * @example
 * ```typescript
 * getRelativeMinor('C')  // 'A'  (C major → A minor)
 * getRelativeMinor('G')  // 'E'  (G major → E minor)
 * getRelativeMinor('Db') // 'Bb' (Db major → Bb minor)
 * ```
 *
 * @since v2.0.0
 */
export function getRelativeMinor(majorRoot: string): string {
  // Transpose down by a major 6th (same as up a minor 3rd)
  // C major → A minor (C down M6 = A, or C up m3 = Eb, we want A)
  return Note.transpose(majorRoot, '-M6')
}

/**
 * Calculates the relative major key for a minor key
 *
 * The relative major is 3 semitones (m3) above the minor key.
 * They share the same key signature.
 *
 * @param minorRoot - Root note of the minor key (e.g., 'A')
 * @returns Root note of the relative major key (e.g., 'C')
 *
 * @example
 * ```typescript
 * getRelativeMajor('A')  // 'C'  (A minor → C major)
 * getRelativeMajor('E')  // 'G'  (E minor → G major)
 * getRelativeMajor('Bb') // 'Db' (Bb minor → Db major)
 * ```
 *
 * @since v2.0.0
 */
export function getRelativeMajor(minorRoot: string): string {
  // Transpose up by a minor 3rd (3 semitones)
  return Note.transpose(minorRoot, 'm3')
}

/**
 * Gets the parallel minor key for a major key
 *
 * The parallel minor has the same root note but different quality.
 * They have different key signatures.
 *
 * @param majorRoot - Root note of the major key (e.g., 'C')
 * @returns Root note of the parallel minor key (same as input)
 *
 * @example
 * ```typescript
 * getParallelMinor('C')  // 'C'  (C major → C minor)
 * getParallelMinor('G')  // 'G'  (G major → G minor)
 * getParallelMinor('Db') // 'Db' (Db major → Db minor)
 * ```
 *
 * @since v2.0.0
 */
export function getParallelMinor(majorRoot: string): string {
  // Parallel scales share the same root
  return majorRoot
}

/**
 * Gets the parallel major key for a minor key
 *
 * The parallel major has the same root note but different quality.
 * They have different key signatures.
 *
 * @param minorRoot - Root note of the minor key (e.g., 'A')
 * @returns Root note of the parallel major key (same as input)
 *
 * @example
 * ```typescript
 * getParallelMajor('A')  // 'A'  (A minor → A major)
 * getParallelMajor('E')  // 'E'  (E minor → E major)
 * getParallelMajor('Bb') // 'Bb' (Bb minor → Bb major)
 * ```
 *
 * @since v2.0.0
 */
export function getParallelMajor(minorRoot: string): string {
  // Parallel scales share the same root
  return minorRoot
}

/**
 * Determines the relationship between two scales
 *
 * @param root1 - Root of first scale
 * @param type1 - Type of first scale
 * @param root2 - Root of second scale
 * @param type2 - Type of second scale
 * @returns Relationship type ('relative', 'parallel', or 'none')
 *
 * @example
 * ```typescript
 * getScaleRelationship('C', 'major', 'A', 'minor')  // 'relative'
 * getScaleRelationship('C', 'major', 'C', 'minor')  // 'parallel'
 * getScaleRelationship('C', 'major', 'D', 'major')  // 'none'
 * ```
 *
 * @since v2.0.0
 */
export function getScaleRelationship(
  root1: string,
  type1: string,
  root2: string,
  type2: string
): ScaleRelationship {
  const normalized1 = type1.toLowerCase().trim()
  const normalized2 = type2.toLowerCase().trim()

  // Normalize 'natural minor' and 'aeolian' to 'minor'
  const isMajor1 = normalized1 === 'major' || normalized1 === 'ionian'
  const isMinor1 =
    normalized1 === 'minor' || normalized1 === 'natural minor' || normalized1 === 'aeolian'

  const isMajor2 = normalized2 === 'major' || normalized2 === 'ionian'
  const isMinor2 =
    normalized2 === 'minor' || normalized2 === 'natural minor' || normalized2 === 'aeolian'

  // Check for parallel relationship (same root, different quality)
  if (root1 === root2 && isMajor1 && isMinor2) {
    return 'parallel'
  }
  if (root1 === root2 && isMinor1 && isMajor2) {
    return 'parallel'
  }

  // Check for relative relationship (3 semitones apart, opposite quality)
  if (isMajor1 && isMinor2) {
    const expectedMinor = getRelativeMinor(root1)
    if (expectedMinor === root2) {
      return 'relative'
    }
  }
  if (isMinor1 && isMajor2) {
    const expectedMajor = getRelativeMajor(root1)
    if (expectedMajor === root2) {
      return 'relative'
    }
  }

  return 'none'
}

/**
 * Builds the full scale name with root and type
 *
 * @param root - Root note
 * @param type - Scale type
 * @returns Full scale name (e.g., 'C major', 'A minor')
 *
 * @example
 * ```typescript
 * buildScaleName('C', 'major')  // 'C major'
 * buildScaleName('A', 'minor')  // 'A minor'
 * buildScaleName('D', 'dorian') // 'D dorian'
 * ```
 *
 * @since v2.0.0
 */
export function buildScaleName(root: string, type: string): string {
  return `${root} ${type}`
}

/**
 * Gets the relative minor scale name for a major scale
 *
 * @param majorRoot - Root note of the major scale
 * @returns Full relative minor scale name
 *
 * @example
 * ```typescript
 * getRelativeMinorScale('C')  // 'A minor'
 * getRelativeMinorScale('G')  // 'E minor'
 * getRelativeMinorScale('Db') // 'Bb minor'
 * ```
 *
 * @since v2.0.0
 */
export function getRelativeMinorScale(majorRoot: string): string {
  const minorRoot = getRelativeMinor(majorRoot)
  return buildScaleName(minorRoot, 'minor')
}

/**
 * Gets the relative major scale name for a minor scale
 *
 * @param minorRoot - Root note of the minor scale
 * @returns Full relative major scale name
 *
 * @example
 * ```typescript
 * getRelativeMajorScale('A')  // 'C major'
 * getRelativeMajorScale('E')  // 'G major'
 * getRelativeMajorScale('Bb') // 'Db major'
 * ```
 *
 * @since v2.0.0
 */
export function getRelativeMajorScale(minorRoot: string): string {
  const majorRoot = getRelativeMajor(minorRoot)
  return buildScaleName(majorRoot, 'major')
}

/**
 * Gets the parallel minor scale name for a major scale
 *
 * @param majorRoot - Root note of the major scale
 * @returns Full parallel minor scale name
 *
 * @example
 * ```typescript
 * getParallelMinorScale('C')  // 'C minor'
 * getParallelMinorScale('G')  // 'G minor'
 * getParallelMinorScale('Db') // 'Db minor'
 * ```
 *
 * @since v2.0.0
 */
export function getParallelMinorScale(majorRoot: string): string {
  const minorRoot = getParallelMinor(majorRoot)
  return buildScaleName(minorRoot, 'minor')
}

/**
 * Gets the parallel major scale name for a minor scale
 *
 * @param minorRoot - Root note of the minor scale
 * @returns Full parallel major scale name
 *
 * @example
 * ```typescript
 * getParallelMajorScale('A')  // 'A major'
 * getParallelMajorScale('E')  // 'E major'
 * getParallelMajorScale('Bb') // 'Bb major'
 * ```
 *
 * @since v2.0.0
 */
export function getParallelMajorScale(minorRoot: string): string {
  const majorRoot = getParallelMajor(minorRoot)
  return buildScaleName(majorRoot, 'major')
}

/**
 * Checks if a scale type supports relative major/minor relationships
 *
 * Only major and natural minor scales have relative relationships.
 *
 * @param scaleType - Scale type to check
 * @returns true if scale type supports relative relationships
 *
 * @since v2.0.0
 */
export function supportsRelativeRelationship(scaleType: string): boolean {
  const normalized = scaleType.toLowerCase().trim()

  const relativeTypes = new Set(['major', 'minor', 'natural minor', 'ionian', 'aeolian'])

  return relativeTypes.has(normalized)
}

/**
 * Checks if a scale type supports parallel major/minor relationships
 *
 * Major and minor scales (all variants) have parallel relationships.
 *
 * @param scaleType - Scale type to check
 * @returns true if scale type supports parallel relationships
 *
 * @since v2.0.0
 */
export function supportsParallelRelationship(scaleType: string): boolean {
  const normalized = scaleType.toLowerCase().trim()

  const parallelTypes = new Set([
    'major',
    'minor',
    'natural minor',
    'harmonic minor',
    'melodic minor',
    'ionian',
    'aeolian',
  ])

  return parallelTypes.has(normalized)
}

/**
 * Scale relationship information
 */
export interface ScaleRelationships {
  /** Relative minor scale (for major scales) */
  relativeMinor?: string
  /** Relative major scale (for minor scales) */
  relativeMajor?: string
  /** Parallel minor scale (for major scales) */
  parallelMinor?: string
  /** Parallel major scale (for minor scales) */
  parallelMajor?: string
}

/**
 * Calculates all scale relationships (relative and parallel) for a given scale
 *
 * This is a convenience function that determines the appropriate relationships
 * based on whether the scale is major or minor.
 *
 * @param root - Root note of the scale
 * @param scaleType - Normalized scale type (e.g., 'major', 'minor', 'harmonic minor')
 * @returns Object containing relative and/or parallel scale relationships
 *
 * @example
 * ```typescript
 * // C major
 * calculateScaleRelationships('C', 'major')
 * // { relativeMinor: 'A minor', parallelMinor: 'C minor' }
 *
 * // A minor
 * calculateScaleRelationships('A', 'minor')
 * // { relativeMajor: 'C major', parallelMajor: 'A major' }
 *
 * // D harmonic minor (no relative, but has parallel)
 * calculateScaleRelationships('D', 'harmonic minor')
 * // { parallelMajor: 'D major' }
 *
 * // D dorian (no relationships)
 * calculateScaleRelationships('D', 'dorian')
 * // {}
 * ```
 *
 * @since v2.0.0
 */
export function calculateScaleRelationships(root: string, scaleType: string): ScaleRelationships {
  const relationships: ScaleRelationships = {}

  // Import type checkers (assuming they're available)
  // Note: This creates a circular dependency, so we'll duplicate the logic
  const isMajor = scaleType === 'major' || scaleType === 'ionian'
  const isMinor =
    scaleType === 'minor' ||
    scaleType === 'natural minor' ||
    scaleType === 'aeolian' ||
    scaleType === 'harmonic minor' ||
    scaleType === 'melodic minor'

  // Add relative relationships (only for natural major/minor)
  if (supportsRelativeRelationship(scaleType)) {
    if (isMajor) {
      relationships.relativeMinor = getRelativeMinorScale(root)
    } else if (isMinor) {
      relationships.relativeMajor = getRelativeMajorScale(root)
    }
  }

  // Add parallel relationships (for all major/minor variants)
  if (supportsParallelRelationship(scaleType)) {
    if (isMajor) {
      relationships.parallelMinor = getParallelMinorScale(root)
    } else if (isMinor) {
      relationships.parallelMajor = getParallelMajorScale(root)
    }
  }

  return relationships
}
