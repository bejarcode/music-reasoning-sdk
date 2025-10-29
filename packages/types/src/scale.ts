/**
 * Scale type definitions for music theory analysis
 */

export interface Scale {
  /** Tonic note of the scale (e.g., 'C', 'D#', 'Bb') */
  tonic: string
  /** Scale type (e.g., 'major', 'minor', 'dorian', 'mixolydian') */
  type: string
  /** Array of notes in the scale */
  notes: string[]
  /** Interval notation using proper format (P1, M2, M3, etc.) */
  intervals: string[]
}
