/**
 * Modal Scale Calculations
 *
 * Provides functions for calculating the 7 modes of diatonic scales.
 * Handles modal rotation, mode identification, and modal relationships.
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import { Scale, Note } from 'tonal'
import { MODAL_SCALE_TYPES } from './list'

/**
 * The 7 modal scale types in order (starting from Ionian)
 */
const MODAL_NAMES = [
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
] as const

/**
 * Modal name type
 */
export type ModalName = (typeof MODAL_NAMES)[number]

/**
 * Modal scale information
 */
export interface ModalScale {
  /** Scale name (e.g., "D dorian") */
  readonly scale: string
  /** Root note of the mode */
  readonly root: string
  /** Modal type (e.g., "dorian") */
  readonly mode: ModalName
  /** Degree of the parent scale (1-7) */
  readonly degree: number
}

/**
 * Calculates all 7 modes of a given scale
 *
 * @param root - Root note of the parent scale (e.g., "C")
 * @param scaleType - Scale type (must be a diatonic 7-note scale)
 * @returns Array of 7 modal scales, or empty array if scale doesn't support modes
 *
 * @example
 * ```typescript
 * calculateModes('C', 'major')
 * // Returns:
 * // [
 * //   { scale: 'C ionian', root: 'C', mode: 'ionian', degree: 1 },
 * //   { scale: 'D dorian', root: 'D', mode: 'dorian', degree: 2 },
 * //   { scale: 'E phrygian', root: 'E', mode: 'phrygian', degree: 3 },
 * //   { scale: 'F lydian', root: 'F', mode: 'lydian', degree: 4 },
 * //   { scale: 'G mixolydian', root: 'G', mode: 'mixolydian', degree: 5 },
 * //   { scale: 'A aeolian', root: 'A', mode: 'aeolian', degree: 6 },
 * //   { scale: 'B locrian', root: 'B', mode: 'locrian', degree: 7 },
 * // ]
 * ```
 *
 * @since v2.0.0
 */
export function calculateModes(root: string, scaleType: string): ModalScale[] {
  // Normalize scale type
  const normalized = scaleType.toLowerCase().trim()

  // Check if scale supports modal rotation
  if (!MODAL_SCALE_TYPES.has(normalized)) {
    return []
  }

  /**
   * Maps scale types to their modal index (0-6) for rotation calculations.
   *
   * The seven modes rotate through the diatonic scale starting from different degrees:
   * - 0: Ionian (I) / Major      - The natural major scale
   * - 1: Dorian (ii)              - Starting from the 2nd degree
   * - 2: Phrygian (iii)           - Starting from the 3rd degree
   * - 3: Lydian (IV)              - Starting from the 4th degree
   * - 4: Mixolydian (V)           - Starting from the 5th degree
   * - 5: Aeolian (vi) / Minor     - The natural minor scale (6th degree)
   * - 6: Locrian (vii°)           - Starting from the 7th degree
   *
   * Example: When generating modes for D dorian (index 1), the first mode
   * will be labeled "dorian", followed by "phrygian", "lydian", etc.
   */
  const modeMap: Record<string, number> = {
    ionian: 0,
    major: 0,
    dorian: 1,
    phrygian: 2,
    lydian: 3,
    mixolydian: 4,
    aeolian: 5,
    minor: 5,
    locrian: 6,
  }

  // Find the starting mode index for rotation
  const startModeIndex = modeMap[normalized] ?? 0

  // Get the parent scale notes
  // Use 'major' as the canonical type for ionian, 'minor' for aeolian
  const canonicalType =
    normalized === 'ionian' ? 'major' : normalized === 'aeolian' ? 'minor' : normalized
  const parentScale = Scale.get(`${root} ${canonicalType}`)

  // ESLint sees !parentScale/!parentScale.notes as always falsy
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!parentScale || !parentScale.notes || parentScale.notes.length !== 7) {
    return []
  }

  // Calculate modes by rotating through the scale notes
  // Start from the requested mode, not always from Ionian
  const modes: ModalScale[] = []

  for (let i = 0; i < 7; i++) {
    const noteIndex = i
    const modeIndex = (startModeIndex + i) % 7

    const modalRoot = parentScale.notes[noteIndex]
    const modalName = MODAL_NAMES[modeIndex]

    if (!modalRoot) {
      throw new Error(
        `Missing note at index ${String(noteIndex)} in scale ${parentScale.name || root}`
      )
    }
    if (!modalName) {
      throw new Error(`Invalid mode index ${String(modeIndex)}. Expected 0-6.`)
    }

    modes.push({
      scale: `${modalRoot} ${modalName}`,
      root: modalRoot,
      mode: modalName,
      degree: i + 1, // 1-indexed (relative to the requested scale)
    })
  }

  return modes
}

/**
 * Gets the mode names as an array of strings (for ScaleInfo.modes)
 *
 * @param root - Root note of the parent scale
 * @param scaleType - Scale type
 * @returns Array of mode names (e.g., ["C ionian", "D dorian", ...])
 *
 * @example
 * ```typescript
 * getModalScaleNames('C', 'major')
 * // ['C ionian', 'D dorian', 'E phrygian', 'F lydian', 'G mixolydian', 'A aeolian', 'B locrian']
 * ```
 *
 * @since v2.0.0
 */
export function getModalScaleNames(root: string, scaleType: string): string[] {
  const modes = calculateModes(root, scaleType)
  return modes.map((m) => m.scale)
}

/**
 * Identifies which mode a scale represents relative to its parent major scale
 *
 * @param root - Root note of the scale
 * @param scaleType - Scale type
 * @returns Modal information, or null if scale is not a mode
 *
 * @example
 * ```typescript
 * identifyMode('D', 'dorian')
 * // { parentScale: 'C major', mode: 'dorian', degree: 2 }
 *
 * identifyMode('E', 'phrygian')
 * // { parentScale: 'C major', mode: 'phrygian', degree: 3 }
 * ```
 *
 * @since v2.0.0
 */
export function identifyMode(
  root: string,
  scaleType: string
): { parentScale: string; mode: ModalName; degree: number } | null {
  const normalized = scaleType.toLowerCase().trim()

  // Check if this is a modal scale type
  if (!MODAL_SCALE_TYPES.has(normalized)) {
    return null
  }

  // Find the mode index (0-6)
  const modeIndex = MODAL_NAMES.findIndex((m) => m === normalized)
  if (modeIndex === -1) {
    // If it's 'major' or 'minor', map to their modal equivalents
    if (normalized === 'major') {
      return identifyMode(root, 'ionian')
    }
    if (normalized === 'minor') {
      return identifyMode(root, 'aeolian')
    }
    return null
  }

  // Get the scale notes
  const canonicalType =
    normalized === 'ionian' ? 'major' : normalized === 'aeolian' ? 'minor' : normalized
  const scale = Scale.get(`${root} ${canonicalType}`)

  // ESLint sees !scale/!scale.notes as always falsy
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!scale || !scale.notes || scale.notes.length !== 7) {
    return null
  }

  // Calculate the parent major scale root
  // Each mode has a known relationship to its parent scale root
  // Example: D dorian (mode index 1) → parent is C major (down 1 step)
  const intervals = ['P1', '-M2', '-M3', '-P4', '-P5', '-M6', '-M7']

  if (modeIndex < 0 || modeIndex >= intervals.length) {
    throw new Error(`Invalid mode index ${String(modeIndex)}. Expected 0-6.`)
  }

  const interval = intervals[modeIndex]
  // TypeScript guard: bounds check above guarantees interval exists
  if (!interval) throw new Error('Interval is undefined')

  const parentRoot = Note.transpose(root, interval)

  const modalName = MODAL_NAMES[modeIndex]
  if (!modalName) return null

  return {
    parentScale: `${parentRoot} major`,
    mode: modalName,
    degree: modeIndex + 1,
  }
}

/**
 * Gets the characteristic intervals that define each mode
 *
 * These are the intervals that distinguish each mode from the major scale.
 *
 * @param mode - Modal name
 * @returns Characteristic intervals as a descriptive string
 *
 * @example
 * ```typescript
 * getModalCharacteristics('dorian')
 * // 'Major 6th, minor 3rd and 7th'
 *
 * getModalCharacteristics('phrygian')
 * // 'Minor 2nd, 3rd, 6th, and 7th'
 * ```
 *
 * @since v2.0.0
 */
export function getModalCharacteristics(mode: ModalName): string {
  const characteristics: Record<ModalName, string> = {
    ionian: 'Major scale (all major intervals)',
    dorian: 'Major 6th, minor 3rd and 7th',
    phrygian: 'Minor 2nd, 3rd, 6th, and 7th',
    lydian: 'Augmented 4th, all other intervals major',
    mixolydian: 'Minor 7th, all other intervals major',
    aeolian: 'Natural minor (minor 3rd, 6th, and 7th)',
    locrian: 'Diminished 5th, minor 2nd, 3rd, 6th, and 7th',
  }

  // ESLint sees characteristics[mode] as always truthy, but can be undefined for unknown modes
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return characteristics[mode] ?? ''
}

/**
 * Checks if a scale type represents a modal scale
 *
 * @param scaleType - Scale type to check
 * @returns true if the scale is a mode, false otherwise
 *
 * @since v2.0.0
 */
export function isModalScale(scaleType: string): boolean {
  const normalized = scaleType.toLowerCase().trim()
  return MODAL_SCALE_TYPES.has(normalized)
}
