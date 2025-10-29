/**
 * Genre detection and pattern database
 * Part of genre-aware intelligence (Constitution Principle VI)
 */

export { GENRE_PATTERNS } from './patterns'
export { detectGenre } from './detect'

// Re-export canonical types from @music-reasoning/types
export type { GenreDetectionResult, Genre, GenrePattern } from '@music-reasoning/types'
