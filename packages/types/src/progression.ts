/**
 * Progression type definitions for music theory analysis
 */

export interface Progression {
  /** Array of chord symbols in the progression */
  chords: string[]
  /** Key of the progression, optional */
  key?: string
  /** Roman numeral analysis, optional */
  romanNumerals?: string[]
}
