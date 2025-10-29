/**
 * Music Reasoning SDK - Type Definitions
 * Open-source TypeScript types for music theory intelligence
 *
 * @packageDocumentation
 * @version 2.0.0
 */

// ============================================================================
// Core Music Theory Types (v1.x - Basic types)
// ============================================================================

export type { Chord } from './chord'
export type { Scale } from './scale'
export type { Progression } from './progression'
export type { GenrePattern } from './genre-pattern'

// ============================================================================
// Detailed Music Theory Types (v2.0 - Feature 002 schemas)
// ============================================================================

// Chord System Types
export type {
  ChordIdentification,
  ChordBuild,
  Voicing,
  ChordBuildOptions,
  VoicingOptions,
  ChordSubstitution,
} from './chord.schema'

// Scale System Types
export type { ScaleInfo, ScaleDegree } from './scale.schema'

// Progression Analysis Types
export type {
  ProgressionAnalysis,
  ChordAnalysis,
  HarmonicFunction,
  Cadence,
  CadenceType,
  BorrowedChord,
  SecondaryDominant,
  Pattern,
  ProgressionAnalysisOptions,
} from './progression.schema'

// Genre Pattern Types (enhanced)
export type {
  Genre,
  GenreDetectionResult,
  GenreScore, // @deprecated - use GenreDetectionResult
  GenrePattern as GenrePatternDetailed,
} from './genre.schema'

// Error Handling Types
export type {
  MusicTheoryErrorCode,
  MusicTheoryErrorData,
  MusicTheoryErrorOptions,
} from './error.schema'

// ============================================================================
// Tier Infrastructure Types
// ============================================================================

export type { Tier, SDKConfig, TierCapabilities } from './tier'

// ============================================================================
// Error Classes (v1.x)
// ============================================================================

export {
  MusicReasoningError,
  ChordNotFoundError,
  InvalidNoteError,
  TierNotAvailableError,
} from './error'
