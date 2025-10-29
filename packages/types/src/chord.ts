/**
 * Chord type definitions for music theory analysis
 */

export interface Chord {
  /** Root note of the chord (e.g., 'C', 'D#', 'Bb') */
  root: string
  /** Chord quality (e.g., 'major', 'minor', 'diminished', 'augmented') */
  quality: string
  /** Interval notation using proper format (P1, M3, P5, etc.) */
  intervals: string[]
  /** Confidence score for chord identification (0.0-1.0), optional */
  confidence?: number
}
