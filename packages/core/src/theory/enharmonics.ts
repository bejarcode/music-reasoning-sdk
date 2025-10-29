/**
 * Enharmonic Equivalence Utilities
 *
 * Provides functions for handling enharmonic equivalents (notes that sound the same
 * but are spelled differently, e.g., C# and Db).
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import { Note } from 'tonal'

/**
 * Gets all enharmonic equivalents for a given note.
 *
 * @param note - The note to find enharmonics for
 * @returns Array of enharmonic note names (includes the original note)
 *
 * @example
 * ```typescript
 * getEnharmonics('C#')  // ['C#', 'Db']
 * getEnharmonics('Db')  // ['Db', 'C#']
 * getEnharmonics('B#')  // ['B#', 'C'] (preserves original spelling)
 * getEnharmonics('C')   // ['C', 'B#', 'Dbb']
 * getEnharmonics('F#')  // ['F#', 'Gb']
 * getEnharmonics('C4')  // ['C', 'B#', 'Dbb'] (handles octaves correctly)
 * ```
 *
 * @since v1.0.0
 */
export function getEnharmonics(note: string): string[] {
  if (typeof note !== 'string' || note.trim() === '') {
    throw new Error(`Invalid note: ${note}`)
  }

  // Validate the note first
  const parsed = Note.get(note)
  // ESLint sees !parsed as always falsy (Note.get always returns object), but we check name instead
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!parsed || parsed.name === '' || parsed.name === 'unknown') {
    throw new Error(`Invalid note: ${note}`)
  }

  // Build list of enharmonics
  const enharmonics = new Set<string>()

  // IMPORTANT: Preserve the original pitch class spelling (e.g., 'B#' stays 'B#', not 'C')
  // Issue 1 fix: Add the original pitch class first, before simplification
  const originalPc = parsed.pc
  if (originalPc) {
    enharmonics.add(originalPc)
  }

  // Add simplified spelling (only if different from original)
  const simplified = Note.simplify(note)
  if (simplified && simplified !== originalPc) {
    enharmonics.add(simplified)
  }

  // Use tonal.js Note.enharmonic() to get the primary enharmonic
  const primary = Note.enharmonic(note)
  if (primary && primary !== originalPc && primary !== simplified) {
    enharmonics.add(primary)
  }

  // Find all notes with the same MIDI number
  // Issue 2 fix: Handle notes with or without octaves correctly
  // Use parsed.midi if available (note already has octave), else append '4'
  // Guard against undefined pitch class
  if (parsed.pc) {
    const midi = parsed.midi ?? Note.midi(`${parsed.pc}4`)
    // ESLint sees this check as unnecessary (midi types don't overlap with null/undefined)
    // But Note.midi() can return null for invalid notes
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (midi !== null && midi !== undefined) {
      // Get notes with the same MIDI pitch (optimize: call fromMidi once)
      const midiNote = Note.fromMidi(midi)
      const enharmonicNote = midiNote ? Note.enharmonic(midiNote) : null

      const allNotes = [midiNote, enharmonicNote].filter((n): n is string => n !== null && n !== '')

      allNotes.forEach((n) => {
        const pc = Note.pitchClass(n)
        if (pc) enharmonics.add(pc)
      })
    }
  }

  return Array.from(enharmonics)
}

/**
 * Checks if two notes are enharmonically equivalent.
 *
 * @param note1 - First note
 * @param note2 - Second note
 * @returns true if notes are enharmonic, false otherwise
 *
 * @example
 * ```typescript
 * areEnharmonic('C#', 'Db')   // true
 * areEnharmonic('F#', 'Gb')   // true
 * areEnharmonic('B#', 'C')    // true (preserves original spellings)
 * areEnharmonic('C', 'C#')    // false
 * areEnharmonic('C#', 'C#')   // true (same note)
 * areEnharmonic('C4', 'B#4')  // true (handles octaves correctly)
 * areEnharmonic('C4', 'C5')   // false (different octaves)
 * ```
 *
 * @since v1.0.0
 */
export function areEnharmonic(note1: string, note2: string): boolean {
  if (typeof note1 !== 'string' || typeof note2 !== 'string') {
    throw new Error(`Invalid notes: ${note1}, ${note2}`)
  }

  // Validate both notes
  const parsed1 = Note.get(note1)
  const parsed2 = Note.get(note2)

  // ESLint sees !parsed1/!parsed2 as always falsy (Note.get always returns object)
  // But we need to check name property for validity
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!parsed1 || !parsed2) {
    throw new Error(`Invalid notes: ${note1}, ${note2}`)
  }

  if (
    parsed1.name === '' ||
    parsed1.name === 'unknown' ||
    parsed2.name === '' ||
    parsed2.name === 'unknown'
  ) {
    throw new Error(`Invalid notes: ${note1}, ${note2}`)
  }

  // Compare MIDI pitch classes
  // Notes are enharmonic if they have the same MIDI number
  // Issue 2 fix: Use parsed.midi if available, else append '4'
  // Guard against undefined pitch classes
  if (!parsed1.pc || !parsed2.pc) {
    return false
  }

  const midi1 = parsed1.midi ?? Note.midi(`${parsed1.pc}4`)
  const midi2 = parsed2.midi ?? Note.midi(`${parsed2.pc}4`)

  if (midi1 === null || midi2 === null) {
    return false
  }

  // Normalize to same octave and compare
  return midi1 % 12 === midi2 % 12
}

/**
 * Simplifies a note to its most common enharmonic spelling.
 *
 * Wrapper for tonal.js Note.simplify() that handles double sharps/flats.
 *
 * @param note - The note to simplify
 * @returns Simplified note name
 * @throws {Error} If note is invalid
 *
 * @example
 * ```typescript
 * simplifyNote('C##')   // 'D'
 * simplifyNote('Dbb')   // 'C'
 * simplifyNote('C#')    // 'C#'
 * simplifyNote('Db')    // 'Db'
 * ```
 *
 * @since v1.0.0
 */
export function simplifyNote(note: string): string {
  if (typeof note !== 'string' || note.trim() === '') {
    throw new Error(`Invalid note: ${note}`)
  }

  // Validate the note
  const parsed = Note.get(note)
  // ESLint sees !parsed as always falsy (Note.get always returns object)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!parsed || parsed.name === '' || parsed.name === 'unknown') {
    throw new Error(`Invalid note: ${note}`)
  }

  // Use tonal.js Note.simplify()
  return Note.simplify(note)
}
