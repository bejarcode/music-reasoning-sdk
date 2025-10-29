/**
 * Scale Definitions Database
 *
 * Comprehensive database of musical scales with their intervals and formulas.
 * Provides metadata for all scale types supported by the SDK.
 *
 * @packageDocumentation
 * @since v2.0.0
 */

/**
 * Scale definition with intervals and W-H formula
 */
export interface ScaleDefinition {
  /** Scale type identifier (matches tonal.js Scale.names) */
  readonly type: string
  /** Canonical interval pattern (e.g., ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']) */
  readonly intervals: readonly string[]
  /** Whole step (W) / Half step (H) formula (e.g., 'W-W-H-W-W-W-H') */
  readonly formula: string
  /** Aliases for this scale type */
  readonly aliases: readonly string[]
  /** Number of notes in the scale */
  readonly noteCount: number
}

/**
 * Complete scale definitions database
 *
 * Maps scale type names to their canonical intervals and formulas.
 * All intervals use proper notation (P1, M2, M3, P4, P5, M6, M7, etc.)
 */
export const SCALE_DEFINITIONS: Record<string, ScaleDefinition> = {
  // ==========================================================================
  // Major Scales
  // ==========================================================================

  major: {
    type: 'major',
    intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'],
    formula: 'W-W-H-W-W-W-H',
    aliases: ['ionian'],
    noteCount: 7,
  },

  // ==========================================================================
  // Minor Scales
  // ==========================================================================

  minor: {
    type: 'minor',
    intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7'],
    formula: 'W-H-W-W-H-W-W',
    aliases: ['natural minor', 'aeolian'],
    noteCount: 7,
  },

  'harmonic minor': {
    type: 'harmonic minor',
    intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'M7'],
    formula: 'W-H-W-W-H-W+H-H',
    aliases: [],
    noteCount: 7,
  },

  'melodic minor': {
    type: 'melodic minor',
    intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'M7'],
    formula: 'W-H-W-W-W-W-H',
    aliases: ['jazz minor'],
    noteCount: 7,
  },

  // ==========================================================================
  // Modal Scales (7 Modes of Major Scale)
  // ==========================================================================

  ionian: {
    type: 'ionian',
    intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'],
    formula: 'W-W-H-W-W-W-H',
    aliases: ['major'],
    noteCount: 7,
  },

  dorian: {
    type: 'dorian',
    intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'm7'],
    formula: 'W-H-W-W-W-H-W',
    aliases: [],
    noteCount: 7,
  },

  phrygian: {
    type: 'phrygian',
    intervals: ['P1', 'm2', 'm3', 'P4', 'P5', 'm6', 'm7'],
    formula: 'H-W-W-W-H-W-W',
    aliases: [],
    noteCount: 7,
  },

  lydian: {
    type: 'lydian',
    intervals: ['P1', 'M2', 'M3', 'A4', 'P5', 'M6', 'M7'],
    formula: 'W-W-W-H-W-W-H',
    aliases: [],
    noteCount: 7,
  },

  mixolydian: {
    type: 'mixolydian',
    intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'm7'],
    formula: 'W-W-H-W-W-H-W',
    aliases: [],
    noteCount: 7,
  },

  aeolian: {
    type: 'aeolian',
    intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7'],
    formula: 'W-H-W-W-H-W-W',
    aliases: ['natural minor', 'minor'],
    noteCount: 7,
  },

  locrian: {
    type: 'locrian',
    intervals: ['P1', 'm2', 'm3', 'P4', 'd5', 'm6', 'm7'],
    formula: 'H-W-W-H-W-W-W',
    aliases: [],
    noteCount: 7,
  },

  // ==========================================================================
  // Pentatonic Scales
  // ==========================================================================

  'major pentatonic': {
    type: 'major pentatonic',
    intervals: ['P1', 'M2', 'M3', 'P5', 'M6'],
    formula: 'W-W-WH-W-WH',
    aliases: [],
    noteCount: 5,
  },

  'minor pentatonic': {
    type: 'minor pentatonic',
    intervals: ['P1', 'm3', 'P4', 'P5', 'm7'],
    formula: 'WH-W-W-WH-W',
    aliases: [],
    noteCount: 5,
  },

  // ==========================================================================
  // Blues Scales
  // ==========================================================================

  blues: {
    type: 'blues',
    intervals: ['P1', 'm3', 'P4', 'd5', 'P5', 'm7'],
    formula: 'WH-W-H-H-WH-W',
    aliases: [],
    noteCount: 6,
  },

  'major blues': {
    type: 'major blues',
    intervals: ['P1', 'M2', 'm3', 'M3', 'P5', 'M6'],
    formula: 'W-H-H-WH-W-WH',
    aliases: [],
    noteCount: 6,
  },

  // ==========================================================================
  // Exotic & Symmetric Scales
  // ==========================================================================

  'whole tone': {
    type: 'whole tone',
    intervals: ['P1', 'M2', 'M3', 'A4', 'A5', 'A6'],
    formula: 'W-W-W-W-W-W',
    aliases: [],
    noteCount: 6,
  },

  diminished: {
    type: 'diminished',
    intervals: ['P1', 'M2', 'm3', 'P4', 'd5', 'm6', 'M6', 'M7'],
    formula: 'W-H-W-H-W-H-W-H',
    aliases: ['whole-half diminished', 'octatonic'],
    noteCount: 8,
  },

  'half-whole diminished': {
    type: 'half-whole diminished',
    intervals: ['P1', 'm2', 'm3', 'M3', 'A4', 'P5', 'M6', 'm7'],
    formula: 'H-W-H-W-H-W-H-W',
    aliases: ['dominant diminished'],
    noteCount: 8,
  },

  chromatic: {
    type: 'chromatic',
    intervals: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7'],
    formula: 'H-H-H-H-H-H-H-H-H-H-H-H',
    aliases: [],
    noteCount: 12,
  },
}

/**
 * Scale type normalization map
 *
 * Maps common aliases and variations to canonical scale type names.
 * Handles case-insensitive matching and common alternative names.
 */
export const SCALE_TYPE_ALIASES: Record<string, string> = {
  // Major variations
  major: 'major',
  ionian: 'major',
  maj: 'major',

  // Minor variations
  minor: 'minor',
  'natural minor': 'minor',
  aeolian: 'minor',
  min: 'minor',

  // Harmonic minor
  'harmonic minor': 'harmonic minor',
  'harmonic-minor': 'harmonic minor',
  'harm minor': 'harmonic minor',

  // Melodic minor
  'melodic minor': 'melodic minor',
  'melodic-minor': 'melodic minor',
  'jazz minor': 'melodic minor',

  // Modes
  dorian: 'dorian',
  phrygian: 'phrygian',
  lydian: 'lydian',
  mixolydian: 'mixolydian',
  locrian: 'locrian',

  // Pentatonic
  'major pentatonic': 'major pentatonic',
  'major-pentatonic': 'major pentatonic',
  'minor pentatonic': 'minor pentatonic',
  'minor-pentatonic': 'minor pentatonic',

  // Blues
  blues: 'blues',
  'major blues': 'major blues',
  'major-blues': 'major blues',

  // Exotic
  'whole tone': 'whole tone',
  'whole-tone': 'whole tone',
  diminished: 'diminished',
  octatonic: 'diminished',
  'whole-half diminished': 'diminished',
  'half-whole diminished': 'half-whole diminished',
  'dominant diminished': 'half-whole diminished',
  chromatic: 'chromatic',
}

/**
 * Modal scale types (7-note diatonic scales that have 7 modes)
 *
 * Only these scale types support modal rotation.
 */
export const MODAL_SCALE_TYPES = new Set([
  'major',
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
  'minor',
])

/**
 * Scale types that have relative major/minor relationships
 */
export const RELATIVE_SCALE_TYPES = new Set(['major', 'minor', 'ionian', 'aeolian'])

/**
 * Gets the canonical scale type name from an alias
 *
 * @param scaleType - Scale type or alias (case-insensitive)
 * @returns Canonical scale type name, or null if not found
 */
export function normalizeScaleType(scaleType: string): string | null {
  // Normalize: lowercase, trim, and collapse multiple spaces to single space
  const normalized = scaleType.toLowerCase().trim().replace(/\s+/g, ' ')
  return SCALE_TYPE_ALIASES[normalized] ?? null
}

/**
 * Gets the scale definition for a given scale type
 *
 * @param scaleType - Scale type or alias
 * @returns Scale definition, or null if not found
 */
export function getScaleDefinition(scaleType: string): ScaleDefinition | null {
  const normalized = normalizeScaleType(scaleType)
  if (!normalized) return null

  return SCALE_DEFINITIONS[normalized] ?? null
}

/**
 * Checks if a scale type supports modal rotation
 *
 * @param scaleType - Scale type to check
 * @returns true if scale supports modes, false otherwise
 */
export function supportsModalRotation(scaleType: string): boolean {
  const normalized = normalizeScaleType(scaleType)
  if (!normalized) return false

  return MODAL_SCALE_TYPES.has(normalized)
}

/**
 * Checks if a scale type has relative major/minor relationships
 *
 * @param scaleType - Scale type to check
 * @returns true if scale has relative relationships, false otherwise
 */
export function hasRelativeScales(scaleType: string): boolean {
  const normalized = normalizeScaleType(scaleType)
  if (!normalized) return false

  return RELATIVE_SCALE_TYPES.has(normalized)
}

/**
 * Checks if a scale type is a major scale variant
 *
 * @param scaleType - Scale type to check (normalized or raw)
 * @returns true if scale is major or ionian, false otherwise
 *
 * @example
 * ```typescript
 * isMajorScaleType('major')   // true
 * isMajorScaleType('ionian')  // true
 * isMajorScaleType('minor')   // false
 * isMajorScaleType('dorian')  // false
 * ```
 *
 * @since v2.0.0
 */
export function isMajorScaleType(scaleType: string): boolean {
  const normalized = normalizeScaleType(scaleType)
  if (!normalized) return false

  // After normalization, 'ionian' becomes 'major'
  return normalized === 'major'
}

/**
 * Checks if a scale type is a minor scale variant
 *
 * Includes natural minor, harmonic minor, melodic minor, and aeolian.
 *
 * @param scaleType - Scale type to check (normalized or raw)
 * @returns true if scale is any minor variant, false otherwise
 *
 * @example
 * ```typescript
 * isMinorScaleType('minor')           // true
 * isMinorScaleType('harmonic minor')  // true
 * isMinorScaleType('melodic minor')   // true
 * isMinorScaleType('aeolian')         // true
 * isMinorScaleType('major')           // false
 * isMinorScaleType('dorian')          // false
 * ```
 *
 * @since v2.0.0
 */
export function isMinorScaleType(scaleType: string): boolean {
  const normalized = normalizeScaleType(scaleType)
  if (!normalized) return false

  // After normalization, 'natural minor' and 'aeolian' both become 'minor'
  return normalized === 'minor' || normalized === 'harmonic minor' || normalized === 'melodic minor'
}
