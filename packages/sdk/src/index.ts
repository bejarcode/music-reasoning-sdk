/**
 * Music Reasoning SDK
 * Main entry point for the offline-first music theory intelligence SDK
 *
 * @packageDocumentation
 */

// Re-export chord API
export * from './api/chord'

// Re-export scale API (T064 - User Story 5)
export * from './api/scale'

// Re-export progression API (T069 - User Story 5)
export * from './api/progression'

// Re-export genre detection functionality from @music-reasoning/core
export { detectGenre, GENRE_PATTERNS } from '@music-reasoning/core'

// Re-export genre types from @music-reasoning/types
export type {
  GenreDetectionResult,
  Genre,
  GenrePatternDetailed as GenrePattern,
} from '@music-reasoning/types'

// Re-export SDK-specific explanation types
export type { ExplainOptions, ExplanationResult } from './types/explain'
export type { ExplanationError } from './types/errors'

// Re-export deterministic data types from @music-reasoning/types for user convenience
export type { ChordIdentification, ScaleInfo, ProgressionAnalysis } from '@music-reasoning/types'
