/**
 * Type Definitions for Music Theory Engine (packages/core)
 *
 * This file serves as the single source of truth for all types used in the
 * deterministic music theory engine. It re-exports types from:
 * 1. @music-reasoning/types (shared SDK types)
 * 2. Contract schemas (feature-specific type definitions)
 *
 * @packageDocumentation
 * @since v1.0.0
 */

// ============================================================================
// Re-export Core Types from @music-reasoning/types
// ============================================================================

export type {
  Chord,
  Scale,
  Progression,
  GenrePattern,
  Tier,
  SDKConfig,
  TierCapabilities,
} from '@music-reasoning/types'

export {
  MusicReasoningError,
  ChordNotFoundError,
  InvalidNoteError,
  TierNotAvailableError,
} from '@music-reasoning/types'

// ============================================================================
// Contract Schema Types (from @music-reasoning/types v2.0)
// ============================================================================
// NOTE: These detailed types are now part of @music-reasoning/types v2.0
// (moved from specs/002-complete-the-deterministic/contracts/)

// Chord System Types
export type {
  ChordIdentification,
  ChordBuild,
  Voicing,
  ChordBuildOptions,
} from '@music-reasoning/types'

// Scale System Types
export type { ScaleInfo, ScaleDegree } from '@music-reasoning/types'

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
} from '@music-reasoning/types'

// Genre Pattern Types (enhanced)
export type {
  Genre,
  GenreDetectionResult,
  // Intentionally exporting deprecated type for 6-month backward compatibility period (until v3.0.0)
  // This follows the constitution's requirement for graceful deprecation (SC-010)
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  GenreScore, // @deprecated - use GenreDetectionResult
  GenrePatternDetailed,
} from '@music-reasoning/types'

// Error Handling Types
export type {
  MusicTheoryErrorCode,
  MusicTheoryErrorData,
  MusicTheoryErrorOptions,
} from '@music-reasoning/types'

// ============================================================================
// Backward Compatibility Aliases
// ============================================================================

/**
 * @deprecated Use ChordIdentification instead
 * Provided for backward compatibility with existing code.
 */
export type { ChordIdentification as ChordResult } from '@music-reasoning/types'

/**
 * @deprecated Use ScaleInfo instead
 * Provided for backward compatibility with existing code.
 */
export type { ScaleInfo as ScaleResult } from '@music-reasoning/types'
