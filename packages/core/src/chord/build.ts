/**
 * Chord Building Module
 *
 * Constructs chords from chord symbols (e.g., "Cmaj7", "Dm7", "G7b9").
 * Provides voicing generation and substitution suggestions.
 *
 * This module completes the bi-directional chord system:
 * - identify.ts: notes → chord symbol
 * - build.ts: chord symbol → notes
 *
 * @module chord/build
 * @since v1.0.0
 */

import { Chord, Note, Interval } from 'tonal'
import type {
  ChordBuild,
  ChordBuildOptions,
  ChordSubstitution,
  VoicingOptions,
} from '@music-reasoning/types'
import { MusicReasoningError } from '@music-reasoning/types'

/**
 * Constants for compound interval detection.
 * Extended chords (9th, 11th, 13th) appear after certain note positions:
 * - 9th: After 4 notes (1-3-5-7-9), appears as 2nd in next octave
 * - 11th: After 5 notes, appears as 4th in next octave
 * - 13th: After 6 notes, appears as 6th in next octave
 */
const COMPOUND_INTERVAL_THRESHOLD = {
  NINTH: 4, // Index where 2nd becomes 9th
  ELEVENTH: 5, // Index where 4th becomes 11th
  THIRTEENTH: 6, // Index where 6th becomes 13th
} as const

/**
 * Builds a chord from a chord symbol string.
 *
 * @param symbol - Chord symbol (e.g., "Cmaj7", "Dm7", "G7#5")
 * @param options - Optional build configuration
 * @returns Complete chord information including notes, intervals, and voicing
 * @throws {MusicReasoningError} If chord symbol is invalid or cannot be parsed
 *
 * @example
 * ```typescript
 * const chord = buildChord('Cmaj7')
 * // Returns: { chord: 'Cmaj7', root: 'C', notes: ['C', 'E', 'G', 'B'], ... }
 *
 * const voiced = buildChord('Dm7', { voicing: 'drop2', octave: 4 })
 * // Returns chord with voicing: { ..., voicing: { type: 'drop2', notes: ['D4', 'A3', 'F4', 'C5'] } }
 * ```
 */
export function buildChord(symbol: string, options?: ChordBuildOptions): ChordBuild {
  // Validate input
  if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
    throw new MusicReasoningError('INVALID_CHORD', 'Chord symbol cannot be empty', { symbol })
  }

  // Parse chord using tonal.js
  const chordData = Chord.get(symbol)

  // Chord.get always returns an object, but it might be empty or invalid
  if (chordData.empty || !chordData.tonic) {
    throw new MusicReasoningError(
      'INVALID_CHORD',
      `Unable to parse chord symbol: "${symbol}". Please provide a valid chord symbol (e.g., "C", "Dm7", "Gmaj7", "F#m7b5").`,
      { symbol, suggestion: 'Check the chord symbol format and try again' }
    )
  }

  // Extract chord information
  const root = chordData.tonic
  // Use aliases[0] for chord type (e.g., "maj7", "7", "m7"), fallback to quality
  // aliases and quality are always defined per tonal.js Chord type, but ESLint doesn't know this
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const rawQuality = chordData.aliases[0] ?? chordData.quality ?? 'major'
  const quality = rawQuality.toLowerCase()
  let notes = chordData.notes

  // Handle enharmonic preferences if specified
  if (options?.enharmonic) {
    notes = notes.map((note) => {
      if (options.enharmonic === 'sharps') {
        // Only convert if the note contains flats
        if (note.includes('b')) {
          return Note.enharmonic(note)
        }
        return note
      } else if (options.enharmonic === 'flats') {
        // Only convert if the note contains sharps
        if (note.includes('#')) {
          return Note.enharmonic(note)
        }
        return note
      }
      return note // preserve
    })
  }

  // Calculate intervals from root - keep raw format for calculations
  const rawIntervals = notes.map((note) => Interval.distance(root, note) || '1P')

  // Convert to quality-first format (P1, M3, etc.) for display
  const intervals = rawIntervals.map((interval, index) => convertIntervalFormat(interval, index))

  // Calculate scale degrees (1-based) using interval simple values
  // This correctly handles altered intervals (e.g., #4, b5, etc.)
  const degrees = rawIntervals.map((interval) => {
    const intervalData = Interval.get(interval)
    const simple = intervalData.simple
    return typeof simple === 'number' && simple > 0 ? simple : 1
  })

  // Generate voicing (default to close voicing at octave 4)
  const voicingType = options?.voicing || 'close'
  const octave = options?.octave || 4
  const voicing = {
    type: voicingType,
    notes: generateVoicingInternal(notes, voicingType, octave),
  }

  // Get enharmonic alternatives for the root
  const enharmonics = getEnharmonicAlternatives(root)

  // Get common substitutions (pass root to avoid re-parsing)
  const commonSubstitutions = getSimpleSubstitutions(root, quality)

  return {
    chord: symbol,
    root,
    quality,
    notes,
    intervals,
    degrees,
    voicing,
    enharmonics,
    commonSubstitutions,
  }
}

/**
 * Generates a voicing for a chord symbol.
 *
 * @param symbol - Chord symbol
 * @param options - Voicing configuration (type, octave, inversion)
 * @returns Array of notes with octave numbers
 * @throws {MusicReasoningError} If voicing type is invalid
 *
 * @example
 * ```typescript
 * const notes = generateVoicing('Cmaj7', { type: 'drop2', octave: 4 })
 * // Returns: ['C4', 'G3', 'E4', 'B4']
 * ```
 */
export function generateVoicing(symbol: string, options: VoicingOptions): string[] {
  // Validate voicing type
  const validTypes = ['close', 'open', 'drop2', 'drop3']
  if (!validTypes.includes(options.type)) {
    throw new MusicReasoningError(
      'INVALID_VOICING',
      `Invalid voicing type: "${options.type}". Must be one of: ${validTypes.join(', ')}`,
      { type: options.type, validTypes }
    )
  }

  // Parse chord to get notes
  const chordData = Chord.get(symbol)
  // Chord.get always returns an object, check if it's valid
  // notes might be empty array but is always defined per tonal.js type
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (chordData.empty || !chordData.notes) {
    throw new MusicReasoningError(
      'INVALID_CHORD',
      `Cannot generate voicing for invalid chord: "${symbol}"`,
      { symbol }
    )
  }

  let notes = chordData.notes

  // Handle inversion if specified
  if (options.inversion && options.inversion > 0) {
    const inv = options.inversion % notes.length
    notes = [...notes.slice(inv), ...notes.slice(0, inv)]
  }

  return generateVoicingInternal(notes, options.type, options.octave)
}

/**
 * Converts interval notation from tonal.js format (number+quality like '3M')
 * to theoretical notation (quality+number like 'M3'), handling compound intervals.
 *
 * @param interval - Interval in tonal.js format (e.g., '3M', '5P', '7m')
 * @param noteIndex - Position of note in chord (0-based), used to detect compound intervals
 * @returns Interval in theoretical format (e.g., 'M3', 'P5', 'm7')
 *
 * @internal
 * @remarks
 * Compound intervals (9th, 11th, 13th) are represented as simple intervals (2nd, 4th, 6th)
 * by tonal.js. We detect them based on their position in extended chords:
 * - 2nd at index ≥4 becomes 9th (after 1-3-5-7)
 * - 4th at index ≥5 becomes 11th
 * - 6th at index ≥6 becomes 13th
 */
function convertIntervalFormat(interval: string, noteIndex: number = 0): string {
  if (!interval || interval.length < 2) {
    return interval
  }

  // Match pattern: number + quality (e.g., '3M', '5P', '7m')
  const match = interval.match(/^(\d+)([APMmd]+)$/)
  if (match) {
    const [, number, quality] = match
    // Regex match guarantees number exists at index 1
    if (!number || !quality) {
      return interval // Fallback to original if parsing fails
    }
    let numValue = parseInt(number, 10)

    // Handle compound intervals for extended chords
    if (numValue === 2 && noteIndex >= COMPOUND_INTERVAL_THRESHOLD.NINTH) {
      numValue = 9
    } else if (numValue === 4 && noteIndex >= COMPOUND_INTERVAL_THRESHOLD.ELEVENTH) {
      numValue = 11
    } else if (numValue === 6 && noteIndex >= COMPOUND_INTERVAL_THRESHOLD.THIRTEENTH) {
      numValue = 13
    }

    return `${quality}${String(numValue)}` // Reverse to quality + number
  }

  return interval // Return as-is if no match
}

/**
 * Internal helper to generate voicing from notes array.
 *
 * @param notes - Array of note names without octaves (e.g., ['C', 'E', 'G'])
 * @param type - Voicing type to generate
 * @param octave - Starting octave number
 * @returns Array of notes with octave numbers (e.g., ['C4', 'E4', 'G4'])
 *
 * @internal
 */
function generateVoicingInternal(
  notes: string[],
  type: 'close' | 'open' | 'drop2' | 'drop3',
  octave: number
): string[] {
  if (notes.length === 0) return []

  switch (type) {
    case 'close':
      return generateCloseVoicing(notes, octave)
    case 'open':
      return generateOpenVoicing(notes, octave)
    case 'drop2':
      return generateDrop2Voicing(notes, octave)
    case 'drop3':
      return generateDrop3Voicing(notes, octave)
    default:
      return generateCloseVoicing(notes, octave)
  }
}

/**
 * Generates close voicing (all notes within one octave).
 * Notes are stacked vertically, moving to next octave when pitch would descend.
 *
 * @param notes - Note names without octaves
 * @param octave - Starting octave
 * @returns Voiced notes
 *
 * @internal
 * @example
 * ```typescript
 * generateCloseVoicing(['C', 'E', 'G', 'B'], 4)
 * // Returns: ['C4', 'E4', 'G4', 'B4']
 * ```
 */
function generateCloseVoicing(notes: string[], octave: number): string[] {
  const voiced: string[] = []
  let currentOctave = octave

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i]
    if (!note) continue // Type guard: skip if undefined

    const prevNote = i > 0 ? notes[i - 1] : null

    // If this note is lower than previous, move to next octave
    const prevVoiced = voiced[i - 1]
    if (prevNote && prevVoiced) {
      const currentPitch = Note.midi(note + String(currentOctave))
      const prevPitch = Note.midi(prevVoiced)

      if (currentPitch !== null && prevPitch !== null && currentPitch < prevPitch) {
        currentOctave++
      }
    }

    voiced.push(note + String(currentOctave))
  }

  return voiced
}

/**
 * Generates open voicing (root + 5th in lower octave, 3rd + 7th in upper octave).
 * Creates wider spacing by distributing notes across two octaves.
 *
 * @param notes - Note names without octaves
 * @param octave - Starting octave
 * @returns Voiced notes with open spacing
 *
 * @internal
 * @example
 * ```typescript
 * generateOpenVoicing(['C', 'E', 'G', 'B'], 4)
 * // Returns: ['C4', 'G4', 'E5', 'B5'] (root+5th low, 3rd+7th high)
 * ```
 */
function generateOpenVoicing(notes: string[], octave: number): string[] {
  if (notes.length < 3) return generateCloseVoicing(notes, octave)

  const voiced: string[] = []

  // Root in base octave
  if (notes[0]) voiced.push(notes[0] + String(octave))

  // 5th (if exists) in base octave
  if (notes.length >= 3 && notes[2]) {
    voiced.push(notes[2] + String(octave))
  }

  // 3rd in upper octave
  if (notes.length >= 2 && notes[1]) {
    voiced.push(notes[1] + String(octave + 1))
  }

  // 7th (if exists) in upper octave
  if (notes.length >= 4 && notes[3]) {
    voiced.push(notes[3] + String(octave + 1))
  }

  // Any remaining extensions
  for (let i = 4; i < notes.length; i++) {
    const note = notes[i]
    if (note) voiced.push(note + String(octave + 1))
  }

  return voiced
}

/**
 * Generates drop-2 voicing (second voice from top dropped one octave).
 */
function generateDrop2Voicing(notes: string[], octave: number): string[] {
  if (notes.length < 3) return generateCloseVoicing(notes, octave)

  // Start with close voicing
  const close = generateCloseVoicing(notes, octave)

  // Drop the second voice from the top down one octave
  const dropIndex = close.length - 2
  if (dropIndex < 0) return close

  const dropped = [...close]
  const noteToReduce = dropped[dropIndex]
  if (!noteToReduce) return close // Type guard

  // Use regex to parse note name and octave (handles multi-digit and negative octaves)
  const match = noteToReduce.match(/^([A-G][#b]?)(-?\d+)$/)
  if (!match) {
    // Fallback to close voicing if parsing fails
    return close
  }

  const noteName = match[1]
  const octaveStr = match[2]
  if (!noteName || !octaveStr) return close // Type guard

  const noteOctave = parseInt(octaveStr, 10)
  dropped[dropIndex] = noteName + String(noteOctave - 1)

  // Re-order to maintain bass note first
  const bassNote = dropped[0]
  const droppedNote = dropped[dropIndex]
  if (!bassNote || !droppedNote) return close // Type guard

  return [bassNote, droppedNote, ...dropped.slice(1, dropIndex), ...dropped.slice(dropIndex + 1)]
}

/**
 * Generates drop-3 voicing (third voice from top dropped one octave).
 */
function generateDrop3Voicing(notes: string[], octave: number): string[] {
  if (notes.length < 4) return generateCloseVoicing(notes, octave)

  // Start with close voicing
  const close = generateCloseVoicing(notes, octave)

  // Drop the third voice from the top down one octave
  const dropIndex = close.length - 3
  if (dropIndex < 0) return close

  const dropped = [...close]
  const noteToReduce = dropped[dropIndex]
  if (!noteToReduce) return close // Type guard

  // Use regex to parse note name and octave (handles multi-digit and negative octaves)
  const match = noteToReduce.match(/^([A-G][#b]?)(-?\d+)$/)
  if (!match) {
    // Fallback to close voicing if parsing fails
    return close
  }

  const noteName = match[1]
  const octaveStr = match[2]
  if (!noteName || !octaveStr) return close // Type guard

  const noteOctave = parseInt(octaveStr, 10)
  dropped[dropIndex] = noteName + String(noteOctave - 1)

  // Re-order to maintain bass note first
  const bassNote = dropped[0]
  const droppedNote = dropped[dropIndex]
  if (!bassNote || !droppedNote) return close // Type guard

  return [bassNote, droppedNote, ...dropped.slice(1, dropIndex), ...dropped.slice(dropIndex + 1)]
}

/**
 * Gets enharmonic alternatives for a note.
 *
 * @param note - Note to find alternatives for (e.g., "C#", "Db")
 * @returns Array containing the note and its enharmonic equivalent (if valid)
 *
 * @internal
 */
function getEnharmonicAlternatives(note: string): string[] {
  const alternatives = [note]

  try {
    const enharm = Note.enharmonic(note)
    if (enharm && enharm !== note) {
      alternatives.push(enharm)
    }
  } catch {
    // If enharmonic conversion fails (invalid note), return original only
    // This is expected for non-standard note names and doesn't require action
  }

  return alternatives
}

/**
 * Gets simple chord substitutions using basic harmonic rules.
 *
 * @param root - Root note of the chord (e.g., "C", "F#", "Bb")
 * @param quality - Normalized chord quality (lowercase)
 * @returns Array of substitute chord symbols (max 3)
 *
 * @internal
 * @remarks
 * This is a simplified version used internally by buildChord().
 * For detailed substitutions with explanations, use getSubstitutions().
 */
function getSimpleSubstitutions(root: string, quality: string): string[] {
  const subs: string[] = []

  // Validate root note
  if (!root || root.trim().length === 0) {
    return subs
  }

  // Basic substitution rules
  if (quality.includes('maj7') || quality.includes('M7')) {
    subs.push(root + '6')
  } else if (quality.includes('7') && !quality.includes('maj7')) {
    // Dominant 7th - tritone substitution
    const tritone = Note.transpose(root, '5d') // Diminished 5th (tritone)
    subs.push(tritone + '7')
  } else if (quality.includes('m7')) {
    subs.push(root + 'm6')
  }

  return subs.slice(0, 3) // Limit to 3 substitutions
}

/**
 * Gets detailed chord substitutions with explanations.
 *
 * @param symbol - Chord symbol
 * @returns Array of substitutions with reasons
 *
 * @example
 * ```typescript
 * const subs = getSubstitutions('Cmaj7')
 * // Returns: [
 * //   { chord: 'C6', reason: 'Major 7th and Major 6th share similar color...' },
 * //   { chord: 'Em7', reason: 'Relative minor provides similar tonal center...' },
 * //   ...
 * // ]
 * ```
 */
export function getSubstitutions(symbol: string): ChordSubstitution[] {
  const chordData = Chord.get(symbol)
  // Chord.get always returns an object, check if it's valid
  if (chordData.empty) {
    return []
  }

  const subs: ChordSubstitution[] = []
  const root = chordData.tonic || ''
  // Use aliases[0] for the chord type (e.g., "maj7", "7", "m7")
  const chordType = chordData.aliases[0] || ''

  // Major 7th substitutions
  if (
    chordType.includes('maj7') ||
    chordType.includes('M7') ||
    chordType.includes('Δ7') ||
    symbol.match(/maj7|M7|Δ7/)
  ) {
    subs.push({
      chord: root + '6',
      reason:
        'Major 7th and Major 6th chords share similar harmonic color and can often be used interchangeably in jazz and pop contexts.',
    })

    // Relative minor (minor 3rd below)
    const relativeMinor = Note.transpose(root, '-3m')
    subs.push({
      chord: relativeMinor + 'm7',
      reason:
        'The relative minor provides a similar tonal center and is commonly used as a substitute in modal contexts.',
    })

    // Add2 as simplified alternative
    subs.push({
      chord: root + 'add9',
      reason:
        'Add9 provides similar color without the 7th, offering a more open and contemporary sound.',
    })
  }

  // Dominant 7th substitutions (G7, C7, etc.)
  // Check if it's a dominant 7th (has '7' but not 'maj7' or 'm7')
  else if (
    chordType === '7' ||
    chordType.includes('dom') ||
    (symbol.includes('7') && !symbol.match(/maj7|m7|M7/))
  ) {
    // Tritone substitution (most important)
    const tritone = Note.transpose(root, '5d') // Diminished 5th = tritone
    subs.push({
      chord: tritone + '7',
      reason:
        'Tritone substitution (b5 substitution) shares the 3rd and 7th of the original chord, creating smooth voice leading and adding harmonic interest.',
    })

    // Diminished 7th approach
    const dim7Root = Note.transpose(root, 'm2')
    subs.push({
      chord: dim7Root + 'dim7',
      reason:
        'Diminished 7th chord a half-step below provides strong resolution and can substitute dominant function.',
    })

    // Altered dominant
    subs.push({
      chord: root + '7alt',
      reason:
        'Altered dominant adds tension through raised or lowered 5th and 9th, common in jazz and modern harmony.',
    })
  }

  // Minor 7th substitutions
  else if (chordType.includes('m7') || chordType.includes('minor7') || symbol.match(/m7/)) {
    subs.push({
      chord: root + 'm6',
      reason:
        'Minor 6th provides similar minor color with a brighter top note, commonly used in jazz standards.',
    })

    // Relative major
    const relativeMajor = Note.transpose(root, 'm3')
    subs.push({
      chord: relativeMajor + 'maj7',
      reason:
        'The relative major shares the same key signature and provides harmonic variety while maintaining tonal center.',
    })

    // Minor 9th for richer sound
    subs.push({
      chord: root + 'm9',
      reason: 'Minor 9th adds warmth and complexity, extending the basic minor 7th sound.',
    })
  }

  // Major triad substitutions (C, D, E, etc. without 7th)
  else if (
    !chordType ||
    chordType === '' ||
    chordType.toLowerCase() === 'major' ||
    (chordData.quality === 'Major' && !symbol.match(/7|m/))
  ) {
    subs.push({
      chord: root + 'maj7',
      reason: 'Major 7th adds sophistication and jazz flavor to the basic major triad.',
    })

    subs.push({
      chord: root + '6',
      reason: 'Major 6th provides a stable, consonant alternative with a jazzy character.',
    })

    // Relative minor (minor 3rd below)
    const relativeMinor = Note.transpose(root, '-3m')
    subs.push({
      chord: relativeMinor + 'm',
      reason:
        'Relative minor shares the same notes and provides contrast while maintaining tonal center.',
    })
  }

  // Diminished chords have fewer common substitutions
  else if (chordType.includes('dim') || symbol.includes('dim')) {
    // Diminished chords can be enharmonically reinterpreted from any chord tone
    subs.push({
      chord: Note.transpose(root, 'm3') + 'dim7',
      reason: 'Diminished 7th chords are symmetrical and can be reinterpreted from any chord tone.',
    })
  }

  // Limit to 2-5 substitutions
  return subs.slice(0, 5)
}
