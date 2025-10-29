/**
 * Chord Identification Module
 *
 * Provides the core chord identification functionality using tonal.js.
 * Analyzes a set of notes and returns comprehensive chord information including
 * root, quality, intervals, degrees, alternatives, and confidence score.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import { Chord as TonalChord, Note, Interval, distance } from 'tonal'
import type { ChordIdentification } from '@music-reasoning/types'
import { validateNote } from '../theory/notes'
import { getEnharmonics } from '../theory/enharmonics'
import { normalizeInterval } from '../theory/intervals'

/**
 * Error codes for chord identification failures.
 */
export const ChordIdentificationErrors = {
  INSUFFICIENT_NOTES: 'INSUFFICIENT_NOTES',
  INVALID_NOTES: 'INVALID_NOTES',
  CHORD_NOT_FOUND: 'CHORD_NOT_FOUND',
} as const

/**
 * Extended chord patterns that tonal.js may not detect.
 * Maps normalized semitone patterns (SORTED) to chord info.
 */
const EXTENDED_CHORD_PATTERNS: ReadonlyArray<{
  pattern: readonly number[]
  quality: string
  suffix: string
  intervals: readonly string[]
}> = [
  // 11th chords (patterns are SORTED semitones)
  {
    pattern: [0, 2, 4, 5, 7, 11], // Cmaj11: C(0), D(2), E(4), F(5), G(7), B(11)
    quality: 'maj11',
    suffix: 'maj11',
    intervals: ['P1', 'M9', 'M3', 'P11', 'P5', 'M7'],
  },
  {
    pattern: [0, 2, 4, 5, 7, 10], // C11: C(0), D(2), E(4), F(5), G(7), Bb(10)
    quality: 'dominant11',
    suffix: '11',
    intervals: ['P1', 'M9', 'M3', 'P11', 'P5', 'm7'],
  },
  {
    pattern: [0, 2, 3, 5, 7, 10], // Cm11: C(0), D(2), Eb(3), F(5), G(7), Bb(10)
    quality: 'm11',
    suffix: 'm11',
    intervals: ['P1', 'M9', 'm3', 'P11', 'P5', 'm7'],
  },
  // 13th chords (patterns are SORTED semitones)
  {
    pattern: [0, 2, 4, 5, 7, 9, 11], // Cmaj13: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
    quality: 'maj13',
    suffix: 'maj13',
    intervals: ['P1', 'M9', 'M3', 'P11', 'P5', 'M13', 'M7'],
  },
  {
    pattern: [0, 2, 4, 5, 7, 9, 10], // C13: C(0), D(2), E(4), F(5), G(7), A(9), Bb(10)
    quality: 'dominant13',
    suffix: '13',
    intervals: ['P1', 'M9', 'M3', 'P11', 'P5', 'M13', 'm7'],
  },
  {
    pattern: [0, 2, 3, 5, 7, 9, 10], // Cm13: C(0), D(2), Eb(3), F(5), G(7), A(9), Bb(10)
    quality: 'm13',
    suffix: 'm13',
    intervals: ['P1', 'M9', 'm3', 'P11', 'P5', 'M13', 'm7'],
  },
  // Suspended chords (already sorted)
  {
    pattern: [0, 2, 7], // Csus2: C(0), D(2), G(7)
    quality: 'sus2',
    suffix: 'sus2',
    intervals: ['P1', 'M2', 'P5'],
  },
  {
    pattern: [0, 5, 7], // Csus4: C(0), F(5), G(7)
    quality: 'sus4',
    suffix: 'sus4',
    intervals: ['P1', 'P4', 'P5'],
  },
  // Add chords (sorted)
  {
    pattern: [0, 2, 4, 7], // Cadd9: C(0), D(2), E(4), G(7)
    quality: 'add9',
    suffix: 'add9',
    intervals: ['P1', 'M9', 'M3', 'P5'],
  },
  {
    pattern: [0, 2, 3, 7], // Cmadd9: C(0), D(2), Eb(3), G(7)
    quality: 'madd9',
    suffix: 'madd9',
    intervals: ['P1', 'M9', 'm3', 'P5'],
  },
  // Incomplete chords / Dyads
  {
    pattern: [0, 3], // Minor dyad: C(0), Eb(3)
    quality: 'minor',
    suffix: '',
    intervals: ['P1', 'm3'],
  },
  {
    pattern: [0, 4], // Major dyad: C(0), E(4)
    quality: 'major',
    suffix: '',
    intervals: ['P1', 'M3'],
  },
  {
    pattern: [0, 7], // Power chord (P5): C(0), G(7)
    quality: '5',
    suffix: '5',
    intervals: ['P1', 'P5'],
  },
  // Shell voicings (7th chords without 5th)
  {
    pattern: [0, 3, 10], // Dm7 (no 5th): D(0), F(3), C(10)
    quality: 'm7',
    suffix: 'm7',
    intervals: ['P1', 'm3', 'm7'],
  },
  {
    pattern: [0, 4, 10], // G7 (no 5th): G(0), B(4), F(10)
    quality: 'dominant',
    suffix: '7',
    intervals: ['P1', 'M3', 'm7'],
  },
  {
    pattern: [0, 4, 11], // Cmaj7 (no 5th): C(0), E(4), B(11)
    quality: 'maj7',
    suffix: 'maj7',
    intervals: ['P1', 'M3', 'M7'],
  },
  {
    pattern: [0, 3, 11], // Cmmaj7 (no 5th): C(0), Eb(3), B(11)
    quality: 'mmaj7',
    suffix: 'mmaj7',
    intervals: ['P1', 'm3', 'M7'],
  },
] as const

/**
 * Map of semitones to scale degrees (1-based).
 * Used for converting intervals to diatonic scale positions.
 */
const SEMITONE_TO_DEGREE: Readonly<Record<number, number>> = {
  0: 1, // P1 - Root
  1: 2, // m2 - Minor second
  2: 2, // M2 - Major second
  3: 3, // m3 - Minor third
  4: 3, // M3 - Major third
  5: 4, // P4 - Perfect fourth
  6: 5, // d5/A4 - Tritone
  7: 5, // P5 - Perfect fifth
  8: 6, // m6 - Minor sixth
  9: 6, // M6 - Major sixth
  10: 7, // m7 - Minor seventh
  11: 7, // M7 - Major seventh
} as const

/**
 * Map of tonal.js chord quality strings to normalized lowercase quality.
 */
const QUALITY_MAP: Readonly<Record<string, string>> = {
  Major: 'major',
  Minor: 'minor',
  Augmented: 'augmented',
  Diminished: 'diminished',
  Dominant: 'dominant',
  '': 'major', // Default to major if no quality
} as const

/**
 * Error thrown when chord identification fails.
 */
export class ChordIdentificationError extends Error {
  constructor(
    public readonly code: keyof typeof ChordIdentificationErrors,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ChordIdentificationError'
  }
}

/**
 * Attempts to detect extended chords using pattern matching fallback.
 * Used when tonal.js Chord.detect() fails to identify a chord.
 *
 * @param notes - Array of unique pitch classes
 * @returns Synthetic chord data if pattern matches, null otherwise
 */
function detectExtendedChord(notes: string[]): {
  name: string
  symbol: string
  tonic: string
  quality: string
  notes: string[]
  intervals: readonly string[]
} | null {
  // Try all notes as potential roots
  for (const root of notes) {
    // Calculate semitones from this root
    const semitones = notes.map((note) => {
      const interval = distance(root, note)
      // Interval.semitones returns number | undefined, but ESLint sees it as always defined
      // Keep ?? 0 for runtime safety (tonal.js behavior can change)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return Interval.semitones(interval) ?? 0
    })

    // Normalize to start at 0 and sort
    const normalized = semitones.map((s) => s % 12).sort((a, b) => a - b)

    // Match against extended chord patterns
    for (const pattern of EXTENDED_CHORD_PATTERNS) {
      if (arraysEqual(normalized, pattern.pattern)) {
        // Found a match! Synthesize chord object
        const chordName = `${root}${pattern.suffix}`
        return {
          name: chordName,
          symbol: chordName, // Add symbol field for buildChordName
          tonic: root,
          quality: pattern.quality,
          notes: notes,
          intervals: pattern.intervals,
        }
      }
    }
  }

  return null
}

/**
 * Helper to compare two arrays for equality.
 */
function arraysEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Selects the best chord candidate from detected chords using a scoring algorithm.
 *
 * Scores candidates by:
 * - Root presence: Prefers chords whose tonic matches a provided note (+10)
 * - Alias quality: Prefers chords without "unknown" in aliases (+5)
 * - Interval coverage: Prefers chords with more matching intervals (+1 per interval)
 * - Confidence: Based on note matching
 *
 * This handles inversions correctly (e.g., ['E', 'G', 'C'] → C major, not Em).
 *
 * @param candidates - Array of chord names from Chord.detect()
 * @param providedNotes - Notes provided by user
 * @returns Best chord candidate name
 */
function selectBestChordCandidate(candidates: string[], providedNotes: string[]): string {
  if (candidates.length === 1) {
    const firstCandidate = candidates[0]
    if (!firstCandidate) {
      throw new Error('Candidates array is empty despite length check')
    }
    return firstCandidate
  }

  const firstCandidate = candidates[0]
  if (!firstCandidate) {
    throw new Error('Candidates array is empty despite length check')
  }
  let bestCandidate = firstCandidate
  let bestScore = -1

  for (const candidate of candidates) {
    const chordData = TonalChord.get(candidate)
    // Chord.get always returns object, check if valid
    if (chordData.empty || !chordData.tonic) continue

    let score = 0

    // Root presence: +10 if tonic matches a provided pitch class
    const providedSet = new Set(providedNotes)
    if (providedSet.has(chordData.tonic)) {
      score += 10
    }

    // Alias quality: +5 if no "unknown" in aliases
    // ESLint sees chordData.aliases as always defined, but tonal.js can return undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const aliases = chordData.aliases || []
    const hasUnknown = aliases.some((alias) => alias.toLowerCase().includes('unknown'))
    if (!hasUnknown && aliases.length > 0) {
      score += 5
    }

    // Interval coverage: +1 per matched interval
    // ESLint sees chordData.notes as always defined, but tonal.js can return undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const chordNotes = chordData.notes || []
    const chordSet = new Set(chordNotes)
    let matches = 0
    for (const note of providedNotes) {
      const enharmonics = getEnharmonics(note)
      if (enharmonics.some((e) => chordSet.has(e))) {
        matches++
      }
    }
    score += matches

    // Update best candidate
    if (score > bestScore) {
      bestScore = score
      bestCandidate = candidate
    }
  }

  return bestCandidate
}

/**
 * Identify a chord from an array of note names.
 *
 * Uses tonal.js Chord.detect() for primary identification, then calculates
 * intervals, degrees, alternatives, and confidence score.
 *
 * @param notes - Array of note names (e.g., ['C', 'E', 'G'])
 * @returns ChordIdentification object with comprehensive chord information
 * @throws {ChordIdentificationError} If notes are invalid or insufficient
 *
 * @example
 * ```typescript
 * const result = identifyChord(['C', 'E', 'G'])
 * // {
 * //   chord: 'C major',
 * //   root: 'C',
 * //   quality: 'major',
 * //   notes: ['C', 'E', 'G'],
 * //   intervals: ['P1', 'M3', 'P5'],
 * //   degrees: [1, 3, 5],
 * //   alternatives: ['C', 'Cmaj', 'CM'],
 * //   confidence: 1.0
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // Handles enharmonics
 * const result = identifyChord(['C#', 'E#', 'G#'])
 * // { chord: 'C# major', root: 'C#', ... }
 * ```
 *
 * @example
 * ```typescript
 * // Handles inversions
 * const result = identifyChord(['E', 'G', 'C'])
 * // { chord: 'C major', root: 'C', alternatives: ['C/E', ...], ... }
 * ```
 *
 * @since v1.0.0
 */
export function identifyChord(notes: string[]): ChordIdentification {
  // T018: Error handling - Validate input
  if (!Array.isArray(notes)) {
    throw new ChordIdentificationError(
      'INVALID_NOTES',
      'INVALID_NOTES: Input must be an array of note names',
      { input: notes }
    )
  }

  if (notes.length < 2) {
    throw new ChordIdentificationError(
      'INSUFFICIENT_NOTES',
      'INSUFFICIENT_NOTES: At least 2 notes are required for chord identification',
      { notes }
    )
  }

  // Validate all notes
  const invalidNotes = notes.filter((note) => !validateNote(note))
  if (invalidNotes.length > 0) {
    throw new ChordIdentificationError(
      'INVALID_NOTES',
      `INVALID_NOTES: Invalid note names: ${invalidNotes.join(', ')}`,
      { invalidNotes, allNotes: notes }
    )
  }

  // Strip octave information for chord detection (preserve pitch class only)
  const pitchClasses = notes.map((note) => {
    const parsed = Note.get(note)
    return parsed.pc || parsed.name
  })

  // Remove duplicates while preserving order
  const uniquePitchClasses = Array.from(new Set(pitchClasses))

  // Check for insufficient unique notes even after deduplication
  if (uniquePitchClasses.length < 2) {
    throw new ChordIdentificationError(
      'INSUFFICIENT_NOTES',
      'INSUFFICIENT_NOTES: At least 2 unique notes are required for chord identification',
      { notes: pitchClasses }
    )
  }

  // Use tonal.js Chord.detect() to identify possible chords
  const detectedChords = TonalChord.detect(uniquePitchClasses)

  // Also try fallback extended chord detection
  const extendedChord = detectExtendedChord(uniquePitchClasses)

  let chordData: ReturnType<typeof TonalChord.get>
  let usedFallback = false

  if (detectedChords.length === 0 && !extendedChord) {
    throw new ChordIdentificationError(
      'CHORD_NOT_FOUND',
      'CHORD_NOT_FOUND: Unable to identify chord from provided notes',
      {
        notes: pitchClasses,
        reason: 'Notes do not form a recognized chord',
      }
    )
  }

  if (detectedChords.length === 0 && extendedChord) {
    // Only fallback chord available
    chordData = extendedChord as ReturnType<typeof TonalChord.get>
    usedFallback = true
  } else if (detectedChords.length > 0 && extendedChord) {
    // Both tonal.js and fallback detected chords
    const fallbackNoteCount = extendedChord.notes.length

    // Prefer fallback for:
    // 1. Extended chords (5+ notes) - avoid wrong subset interpretations
    // 2. Incomplete chords (2-3 notes) - dyads, shell voicings
    // Trust tonal.js for standard triads and 7th chords (3-4 notes with complete structure)
    if (
      (fallbackNoteCount >= 5 && fallbackNoteCount === uniquePitchClasses.length) || // Extended chords
      fallbackNoteCount === 2 || // Dyads
      (fallbackNoteCount === 3 &&
        extendedChord.quality &&
        (extendedChord.quality === 'dominant' ||
          extendedChord.quality === 'm7' ||
          extendedChord.quality === 'maj7')) // Shell voicings
    ) {
      chordData = extendedChord as ReturnType<typeof TonalChord.get>
      usedFallback = true
    } else {
      // Use tonal.js detection for complete triads and 7th chords
      const primaryChordName = selectBestChordCandidate(detectedChords, uniquePitchClasses)
      chordData = TonalChord.get(primaryChordName)

      // ESLint sees !chordData as always falsy (TonalChord.get always returns object)
      // But we check chordData.empty instead, and validate tonic exists
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!chordData || !chordData.tonic) {
        throw new ChordIdentificationError(
          'CHORD_NOT_FOUND',
          'CHORD_NOT_FOUND: Could not parse chord information',
          { chordName: primaryChordName }
        )
      }
    }
  } else {
    // Only tonal.js detected chords
    const primaryChordName = selectBestChordCandidate(detectedChords, uniquePitchClasses)
    chordData = TonalChord.get(primaryChordName)

    // ESLint sees !chordData as always falsy (TonalChord.get always returns object)
    // But we check chordData.empty instead, and validate tonic exists
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!chordData || !chordData.tonic) {
      throw new ChordIdentificationError(
        'CHORD_NOT_FOUND',
        'CHORD_NOT_FOUND: Could not parse chord information',
        { chordName: primaryChordName }
      )
    }
  }

  // Calculate intervals from root to each unique note
  // TypeScript guard: chordData.tonic is non-null here (validated at line 461)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = chordData.tonic!
  // Keep raw intervals for semitone/degree lookups
  const rawIntervals = uniquePitchClasses.map((note) => distance(root, note) || '1P')

  // Convert to canonical format for output (quality before number)
  const intervals = rawIntervals.map((interval) => convertIntervalFormat(interval))

  // Calculate scale degrees (1-based) using constant lookup
  // Use raw intervals here because Interval.semitones() expects Tonal format ('3M', not 'M3')
  const degrees = rawIntervals.map((interval) => {
    // Interval.semitones returns number | undefined, but ESLint sees it as always defined
    // Keep ?? 0 for runtime safety (tonal.js behavior can change)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const semitones = Interval.semitones(interval) ?? 0
    return SEMITONE_TO_DEGREE[semitones % 12] ?? 1
  })

  // Get alternative interpretations (limit to 5)
  // For fallback chords, synthesize alternatives for ambiguous cases
  let alternatives: string[]
  if (usedFallback) {
    // ESLint sees chordData.quality as always truthy, but it can be empty string
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const chordName = chordData.name || `${root}${chordData.quality || ''}`
    // For 2-note dyads, generate multiple interpretations
    if (uniquePitchClasses.length === 2) {
      // Try both notes as potential roots for ambiguity
      const [note1, note2] = uniquePitchClasses
      // TypeScript guard: length === 2 guarantees both elements exist
      if (!note1 || !note2) {
        alternatives = [chordName]
      } else {
        const alt1 = chordName
        const interval12 = distance(note1, note2)
        const interval21 = distance(note2, note1)
        // Generate interpretations based on intervals
        const alts = [alt1]
        const suffix = mapIntervalToSuffix(interval21)
        if (interval12) alts.push(`${note2}${suffix}`)
        alternatives = alts.slice(0, 5)
      }
    } else {
      alternatives = [chordName]
    }
  } else {
    alternatives = detectedChords.slice(0, 5)
  }

  // Helper function to map intervals to chord suffixes for dyads
  function mapIntervalToSuffix(interval: string): string {
    if (interval === '5P' || interval === 'P5') return '5'
    if (interval === '4P' || interval === 'P4') return 'sus4'
    if (interval === '2M' || interval === 'M2') return 'sus2'
    return ''
  }

  // Calculate confidence score using ORIGINAL pitch classes (preserves duplicates for scoring)
  // This allows detection of incomplete chords, dyads, and missing tones
  const confidence = calculateConfidence(pitchClasses, chordData)

  // Build human-readable chord name (e.g., "C major", "Dm7")
  const chordName = buildChordName(chordData)

  // Detect richer quality string from chord data (handles 7ths, extensions properly)
  const normalizedQuality = detectChordQuality(chordData)

  return {
    chord: chordName,
    // TypeScript guard: chordData.tonic is non-null here (validated at line 461)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    root: chordData.tonic!,
    quality: normalizedQuality,
    notes: uniquePitchClasses, // Return unique notes in output
    intervals,
    degrees,
    alternatives,
    confidence,
  }
}

/**
 * Calculates confidence score for chord identification.
 *
 * @param providedNotes - Notes provided by the user (may include duplicates)
 * @param chordData - Chord data from tonal.js
 * @returns Confidence score (0.0-1.0)
 *
 * Scoring:
 * - 1.0 = Perfect match (all unique notes match exactly, has root and third)
 * - 0.7 = Subset match (missing notes, but no extra notes)
 * - 0.6 = Superset match (extra notes, but all chord tones present)
 * - ≤0.6 = Cap if no root or no third present
 * - ~0.5 = 2-note dyads
 * - <0.5 = Partial match
 *
 * NOTE: Deduplicates providedNotes to avoid counting the same note multiple times
 */
function calculateConfidence(
  providedNotes: string[],
  chordData: ReturnType<typeof TonalChord.get>
): number {
  // ESLint sees chordData.notes and chordData.intervals as always defined, but tonal.js can return undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const chordNotes = chordData.notes || []
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const intervals = chordData.intervals || []
  const root = chordData.tonic

  if (chordNotes.length === 0) {
    return 0.5 // Unknown chord structure
  }

  // Deduplicate provided notes for fair comparison
  const uniqueProvidedNotes = Array.from(new Set(providedNotes))

  // Check for enharmonic equivalents
  const chordSet = new Set(chordNotes)

  // Count matches (accounting for enharmonics)
  let matches = 0
  let rootPresent = false
  for (const providedNote of uniqueProvidedNotes) {
    const enharmonics = getEnharmonics(providedNote)
    if (enharmonics.some((e) => chordSet.has(e))) {
      matches++
    }
    // Check if root is present
    if (root && enharmonics.some((e) => e === root)) {
      rootPresent = true
    }
  }

  // Check if third interval is present (M3 or m3)
  const hasThird = intervals.some(
    (interval) => interval === '3M' || interval === 'M3' || interval === '3m' || interval === 'm3'
  )

  // Check if fifth interval is present (P5, d5, A5)
  const hasFifth = intervals.some(
    (interval) =>
      interval === '5P' ||
      interval === 'P5' ||
      interval === '5d' ||
      interval === 'd5' ||
      interval === '5A' ||
      interval === 'A5'
  )

  // Calculate base confidence
  let confidence = 0

  // 2-note dyads (incomplete, ambiguous) - check this FIRST
  if (uniqueProvidedNotes.length === 2) {
    confidence = 0.5
  }
  // Perfect match check first
  else if (
    matches === uniqueProvidedNotes.length &&
    uniqueProvidedNotes.length === chordNotes.length
  ) {
    // Shell voicings (3-note 7th chords missing 5th: root + 3rd + 7th)
    if (uniqueProvidedNotes.length === 3 && !hasFifth && hasThird) {
      confidence = 0.85 // Shell voicing confidence (higher because they're musically strong)
    }
    // Other incomplete chords (no 5th for triads/7ths)
    else if (!hasFifth && chordNotes.length <= 4) {
      confidence = 0.7
    }
    // Perfect complete match
    else {
      confidence = 1.0
    }
  }
  // 3-note incomplete chords (subset of larger chord)
  else if (uniqueProvidedNotes.length === 3 && chordNotes.length > 3 && hasThird) {
    confidence = 0.85
  }
  // Other 3-note incomplete chords
  else if (uniqueProvidedNotes.length === 3 && chordNotes.length > 3) {
    confidence = 0.7
  }
  // Subset match: missing notes, but no extra notes (reduced from 0.8 to 0.7)
  else if (
    matches === uniqueProvidedNotes.length &&
    uniqueProvidedNotes.length < chordNotes.length
  ) {
    confidence = 0.7
  }
  // Superset match: extra notes, but all chord tones present
  else if (matches === chordNotes.length && uniqueProvidedNotes.length > chordNotes.length) {
    confidence = 0.6
  }
  // Partial match
  else {
    confidence = Math.max(0.3, matches / Math.max(uniqueProvidedNotes.length, chordNotes.length))
  }

  // Cap confidence if root is missing
  if (!rootPresent && confidence > 0.6) {
    confidence = Math.min(confidence, 0.6)
  }

  // Cap confidence if third is missing (incomplete chord - power chords, sus chords)
  if (!hasThird && confidence > 0.6) {
    confidence = Math.min(confidence, 0.6)
  }

  return confidence
}

/**
 * Converts tonal.js interval format to canonical format.
 *
 * Tonal.js returns intervals like '1P', '3M', '5P' but our API spec requires
 * 'P1', 'M3', 'P5' format (quality before number).
 *
 * @param interval - Interval from tonal.js (e.g., '3M', '5P', '7m')
 * @returns Canonical interval format (e.g., 'M3', 'P5', 'm7')
 */
function convertIntervalFormat(interval: string): string {
  if (!interval || interval.length < 2) {
    return interval
  }

  // Match pattern: number + quality (e.g., '3M', '5P', '7m')
  const match = interval.match(/^(\d+)([APMmd]+)$/)
  if (match) {
    const [, number, quality] = match
    // Guard against undefined match groups
    if (!number || !quality) return interval
    return `${quality}${number}` // Reverse to quality + number
  }

  // If no match, try normalizeInterval from utilities (handles edge cases)
  try {
    return normalizeInterval(interval)
  } catch {
    return interval // Return as-is if normalization fails
  }
}

/**
 * Detects chord quality from tonal.js chord data with richer quality strings for 7th chords.
 *
 * tonal.js returns generic "Major" or "Minor" even for 7th chords, but we need
 * specific qualities like "dominant", "maj7", "m7", etc.
 *
 * @param chordData - Chord data from tonal.js
 * @returns Normalized lowercase quality (e.g., "major", "dominant", "maj7", "m7")
 */
function detectChordQuality(chordData: ReturnType<typeof TonalChord.get>): string {
  // ESLint sees these chordData properties as always defined, but tonal.js can return undefined/empty
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const intervals = chordData.intervals || []
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const aliases = chordData.aliases || []
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const quality = chordData.quality || ''

  // Check aliases for quality hints (aliases often contain richer quality info)
  for (const alias of aliases) {
    const lower = alias.toLowerCase()
    // Dominant 7th (e.g., "7", "dom7")
    if (lower === '7' || lower === 'dom7' || lower.includes('dominant')) {
      return 'dominant'
    }
    // Major 7th (e.g., "maj7", "M7", "∆7")
    if (lower.includes('maj7') || lower === 'M7' || lower === '∆7') {
      return 'maj7'
    }
    // Minor 7th (e.g., "m7", "min7") - check this AFTER maj7 to avoid false matches
    if ((lower === 'm7' || lower.includes('min7')) && !lower.includes('maj')) {
      return 'm7'
    }
    // Half-diminished (e.g., "m7b5", "ø")
    if (lower.includes('m7b5') || lower === 'ø' || lower.includes('half') || lower.includes('ø7')) {
      return 'm7b5'
    }
    // Diminished 7th (e.g., "dim7", "°7")
    if (lower.includes('dim7') || lower === '°7' || lower.includes('o7')) {
      return 'dim7'
    }
  }

  // Check intervals for 7th chord detection
  if (intervals.length === 4) {
    const hasM7 = intervals.includes('7M') || intervals.includes('M7')
    const hasm7 = intervals.includes('7m') || intervals.includes('m7')
    const hasM3 = intervals.includes('3M') || intervals.includes('M3')
    const hasm3 = intervals.includes('3m') || intervals.includes('m3')
    const hasd5 = intervals.includes('5d') || intervals.includes('d5')

    // Dominant 7th: Major triad + m7
    if (hasM3 && hasm7) {
      return 'dominant'
    }
    // Major 7th: Major triad + M7
    if (hasM3 && hasM7) {
      return 'maj7'
    }
    // Minor 7th: Minor triad + m7
    if (hasm3 && hasm7 && !hasd5) {
      return 'm7'
    }
    // Half-diminished: Diminished triad + m7
    if (hasm3 && hasd5 && hasm7) {
      return 'm7b5'
    }
  }

  // Fall back to basic quality normalization
  return QUALITY_MAP[quality] || quality.toLowerCase()
}

/**
 * Builds a human-readable chord name from tonal.js chord data.
 *
 * @param chordData - Chord data from tonal.js
 * @returns Human-readable chord name (e.g., "C major", "Dm7", "G7#5")
 */
function buildChordName(chordData: ReturnType<typeof TonalChord.get>): string {
  const root = chordData.tonic || 'C'
  const quality = detectChordQuality(chordData) // Use rich quality detection

  // For triads with "unknown" quality, prefer symbol (handles sus chords)
  if (quality === 'unknown' && chordData.symbol) {
    return chordData.symbol
  }

  // For triads, use full name (e.g., "C major")
  // For extended chords, use symbol (e.g., "Dm7", "G7#5")
  // ESLint sees chordData.intervals as always defined, but tonal.js can return undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (chordData.intervals && chordData.intervals.length <= 3) {
    return `${root} ${quality}`
  }

  // Use chord symbol for complex chords
  return chordData.symbol || `${root} ${quality}`
}
