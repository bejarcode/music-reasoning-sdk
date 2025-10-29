/**
 * Genre pattern type definitions for music theory analysis
 * Part of genre-aware intelligence (Constitution Principle VI)
 */

import type { Genre } from './genre.schema'

export interface GenrePattern {
  /** Roman numeral sequence (e.g., 'ii-V-I') */
  pattern: string
  /** Genre tag (jazz/pop/classical/rock/edm/blues) */
  genre: Genre
  /** Importance score (1-10) */
  weight: number
  /** Pattern explanation */
  description: string
  /** Famous song examples */
  examples: string[]
  /** Optional era tag (e.g., 'bebop', '80s') */
  era?: string
}
