/**
 * Note Validation and Normalization Utilities
 *
 * Provides functions for validating, normalizing, and parsing musical notes.
 * Uses tonal.js Note module as the underlying implementation.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import { Note } from 'tonal'

/**
 * Validates if a string represents a valid musical note.
 *
 * @param note - The note string to validate (e.g., "C", "C#", "Db", "C4")
 * @returns true if the note is valid, false otherwise
 *
 * @example
 * ```typescript
 * validateNote('C')    // true
 * validateNote('C#')   // true
 * validateNote('Db')   // true
 * validateNote('C4')   // true
 * validateNote('X')    // false
 * validateNote('')     // false
 * ```
 *
 * @since v1.0.0
 */
export function validateNote(note: string): boolean {
  if (typeof note !== 'string' || note.trim() === '') {
    return false
  }

  // Use tonal.js Note.get() to validate
  // Valid notes return an object with a non-empty name
  const parsed = Note.get(note)
  return parsed.name !== '' && parsed.name !== 'unknown'
}

/**
 * Normalizes a note string to its canonical form.
 *
 * @param note - The note string to normalize
 * @returns The normalized note string
 * @throws {Error} If the note is invalid
 *
 * @example
 * ```typescript
 * normalizeNote('c')     // 'C'
 * normalizeNote('C#')    // 'C#'
 * normalizeNote('Db')    // 'Db'
 * normalizeNote('C##')   // 'D' (simplifies double sharps)
 * normalizeNote('Dbb')   // 'C' (simplifies double flats)
 * ```
 *
 * @since v1.0.0
 */
export function normalizeNote(note: string): string {
  if (!validateNote(note)) {
    throw new Error(`Invalid note: ${note}`)
  }

  // Use tonal.js Note.simplify() for normalization
  // This handles enharmonics and double accidentals
  const simplified = Note.simplify(note)
  return simplified
}

/**
 * Parses a note string that may include octave information.
 *
 * @param note - The note string to parse (e.g., "C", "C4", "C#5")
 * @returns Object containing the note name and optional octave number
 * @throws {Error} If the note is invalid
 *
 * @example
 * ```typescript
 * parseNoteWithOctave('C')    // { note: 'C', octave: undefined }
 * parseNoteWithOctave('C4')   // { note: 'C', octave: 4 }
 * parseNoteWithOctave('C#5')  // { note: 'C#', octave: 5 }
 * parseNoteWithOctave('Db3')  // { note: 'Db', octave: 3 }
 * ```
 *
 * @since v1.0.0
 */
export function parseNoteWithOctave(note: string): {
  note: string
  octave?: number
} {
  if (!validateNote(note)) {
    throw new Error(`Invalid note: ${note}`)
  }

  const parsed = Note.get(note)

  return {
    // ESLint sees parsed.pc as always defined, but tonal.js returns empty string for invalid notes
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    note: parsed.pc ?? parsed.name, // pc = pitch class (note without octave), use nullish coalescing to handle empty strings
    octave: parsed.oct ?? undefined, // oct = octave number
  }
}
