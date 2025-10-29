/**
 * Roman Numeral Conversion
 *
 * Converts chords to Roman numeral notation within a given key.
 * Handles major/minor/diminished/augmented chords with extensions (7ths, 9ths, etc.)
 *
 * Conventions:
 * - Uppercase (I, IV, V) = Major or augmented
 * - Lowercase (ii, iii, vi) = Minor
 * - Diminished = lowercase with ° (vii°)
 * - Extensions preserved (ii7, V7, Imaj7, etc.)
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import { Note, Scale, Chord } from 'tonal'

/**
 * Roman numeral analysis result for a single chord
 */
export interface RomanNumeralResult {
  /** Roman numeral (e.g., "I", "ii7", "V7", "vii°") */
  readonly roman: string

  /** Scale degree (1-7) */
  readonly degree: number

  /** Chord quality (e.g., "major", "minor", "dominant", "diminished") */
  readonly quality: string
}

/**
 * Roman numeral symbols for scale degrees
 */
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

/**
 * Get the scale degree of a note within a key
 *
 * @param note - The note to find (e.g., "D")
 * @param keyRoot - Root of the key (e.g., "C")
 * @param scaleType - "major" or "minor"
 * @returns Scale degree (1-7) or 0 if not in scale
 *
 * @example
 * ```typescript
 * getScaleDegree('D', 'C', 'major') // => 2 (D is the 2nd degree in C major)
 * getScaleDegree('E', 'A', 'minor') // => 5 (E is the 5th degree in A minor)
 * ```
 */
function getScaleDegree(note: string, keyRoot: string, scaleType: 'major' | 'minor'): number {
  const scale = Scale.get(`${keyRoot} ${scaleType}`)
  const normalizedNote = Note.simplify(note)
  const scaleNotes = scale.notes.map((n) => Note.simplify(n))

  const degree = scaleNotes.indexOf(normalizedNote)
  return degree === -1 ? 0 : degree + 1 // Return 1-indexed degree
}

/**
 * Determine chord quality from chord data
 *
 * @param chordData - Tonal.js Chord object
 * @returns Quality string (e.g., "major", "minor", "dominant", "diminished")
 */
function determineChordQuality(chordData: ReturnType<typeof Chord.get>): string {
  // ESLint sees chordData.quality/aliases as always truthy and doesn't need optional chaining
  // But tonal.js can return empty/undefined values
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const rawQuality = chordData.quality || chordData.aliases?.[0] || ''

  // Normalize to lowercase for consistent matching (Tonal returns "Major", "Minor", etc.)
  const quality = rawQuality.toLowerCase()
  const type = (chordData.type || '').toLowerCase()

  // Diminished (including half-diminished m7b5)
  if (quality.includes('dim') || quality.includes('°') || type.includes('diminished')) {
    return 'diminished'
  }

  // Augmented
  if (quality.includes('aug') || quality.includes('+') || type.includes('augmented')) {
    return 'augmented'
  }

  // Dominant - Check type field FIRST (most reliable)
  // Tonal.js returns type="dominant seventh", "dominant ninth", etc.
  if (type.includes('dominant')) {
    return 'dominant'
  }

  // Dominant (7th without maj7) - quality-based fallback
  // Examples: "7", "9", "13" in quality string
  if (
    (quality.includes('7') ||
      quality.includes('9') ||
      quality.includes('11') ||
      quality.includes('13')) &&
    !quality.includes('maj7') &&
    !quality.includes('m7') &&
    !quality.includes('major 7')
  ) {
    return 'dominant'
  }

  // Major 7th (still major quality, just with extensions)
  if (quality.includes('maj7') || quality.includes('major 7') || quality.includes('δ')) {
    return 'major'
  }

  // Minor - check for explicit 'minor' keyword only
  // CRITICAL: Do NOT check aliases because both major and minor have "m" alias after lowercasing
  // Major aliases: ["M", "^", "", "maj"] → lowercase → ["m", "^", "", "maj"]
  // Minor aliases: ["m", "min", "-"] → lowercase → ["m", "min", "-"]
  // The quality field is the only reliable discriminator
  if (quality.includes('minor')) {
    return 'minor'
  }

  // Major (default for triads without quality markers)
  if (!quality || quality.includes('major')) {
    return 'major'
  }

  // Suspended chords
  if (quality.includes('sus')) {
    return 'suspended'
  }

  return 'major' // Default fallback
}

/**
 * Build Roman numeral string from degree and quality
 *
 * @param degree - Scale degree (1-7)
 * @param quality - Chord quality
 * @param extensions - Chord extensions (e.g., "7", "maj7", "9")
 * @returns Roman numeral string
 *
 * @example
 * ```typescript
 * buildRomanNumeral(2, 'minor', '7') // => "ii7"
 * buildRomanNumeral(5, 'dominant', '7') // => "V7"
 * buildRomanNumeral(7, 'diminished', '') // => "vii°"
 * ```
 */
function buildRomanNumeral(degree: number, quality: string, extensions: string): string {
  if (degree < 1 || degree > 7) {
    return 'I' // Fallback
  }

  const baseRoman = ROMAN_NUMERALS[degree - 1]
  if (!baseRoman) return 'I' // Safety fallback

  // Determine case and modifiers based on quality
  let romanStr = ''

  if (quality === 'minor') {
    romanStr = baseRoman.toLowerCase()
  } else if (quality === 'diminished') {
    romanStr = baseRoman.toLowerCase() + '°'
  } else if (quality === 'augmented') {
    romanStr = baseRoman + '+'
  } else if (quality === 'dominant') {
    romanStr = baseRoman // Uppercase
  } else {
    // Major
    romanStr = baseRoman // Uppercase
  }

  // Add extensions
  if (extensions) {
    romanStr += extensions
  }

  return romanStr
}

/**
 * Extract chord extensions from chord symbol
 *
 * @param chordSymbol - Chord symbol (e.g., "Dm7", "Cmaj7", "G9")
 * @param chordData - Pre-parsed chord data from Chord.get() (avoids redundant parsing)
 * @returns Extension string (e.g., "7", "maj7", "9")
 */
function extractExtensions(chordSymbol: string, chordData: ReturnType<typeof Chord.get>): string {
  // Parse the original chord symbol directly (most reliable)
  // Examples: "Dm7", "G7", "Cmaj7", "Am9", "D13"

  // Extract quality and type from pre-parsed chord data
  // ESLint sees chordData.quality/type as always truthy, but can be empty/undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const quality = (chordData.quality || '').toLowerCase()
  const type = (chordData.type || '').toLowerCase()

  // Check for major 7th variants first (maj7, M7, Δ7, major7)
  if (/maj7/i.test(chordSymbol) || /Δ7/.test(chordSymbol) || /major7/i.test(chordSymbol)) {
    return 'maj7'
  }

  // Check for M7 (capital M) - supports both major seventh (CM7) and minor-major seventh (CmM7)
  // Must come BEFORE /m7/i check to avoid false match on CmM7 → m7
  if (/M7/.test(chordSymbol)) {
    return 'maj7'
  }

  // Check for minor 7th (m7 with minor quality)
  if (/m7/i.test(chordSymbol) && quality.includes('minor')) {
    return '7'
  }

  // Check for extensions in descending order (13, 11, 9, 7, 6)
  if (/13/i.test(chordSymbol)) return '13'
  if (/11/i.test(chordSymbol)) return '11'
  if (/9/i.test(chordSymbol)) return '9'
  if (/7/i.test(chordSymbol)) return '7'
  if (/6/i.test(chordSymbol)) return '6'

  // Fallback to Tonal.js type field
  if (type.includes('thirteenth')) return '13'
  if (type.includes('eleventh')) return '11'
  if (type.includes('ninth')) return '9'
  if (type.includes('seventh')) return '7'
  if (type.includes('sixth')) return '6'

  return ''
}

/**
 * Convert a chord to Roman numeral notation within a key
 *
 * @param chord - Chord symbol (e.g., "Dm7", "G7", "Cmaj7")
 * @param keyRoot - Root of the key (e.g., "C")
 * @param scaleType - "major" or "minor"
 * @returns Roman numeral analysis result
 *
 * @throws {Error} If chord is invalid or cannot be parsed
 *
 * @example
 * ```typescript
 * getRomanNumeral('Dm', 'C', 'major')
 * // => { roman: 'ii', degree: 2, quality: 'minor' }
 *
 * getRomanNumeral('G7', 'C', 'major')
 * // => { roman: 'V7', degree: 5, quality: 'dominant' }
 *
 * getRomanNumeral('Cmaj7', 'C', 'major')
 * // => { roman: 'Imaj7', degree: 1, quality: 'major' }
 * ```
 *
 * @remarks
 * - Uppercase Roman numerals (I, IV, V) indicate major or augmented chords
 * - Lowercase Roman numerals (ii, iii, vi) indicate minor chords
 * - Diminished chords use lowercase with ° (vii°)
 * - Extensions are preserved (7, maj7, 9, etc.)
 */
export function getRomanNumeral(
  chord: string,
  keyRoot: string,
  scaleType: 'major' | 'minor'
): RomanNumeralResult {
  const chordData = Chord.get(chord)

  if (!chordData.tonic) {
    throw new Error(`Invalid chord: ${chord}`)
  }

  // Get scale degree
  const degree = getScaleDegree(chordData.tonic, keyRoot, scaleType)

  if (degree === 0) {
    // Chord root is not in the scale - it's a chromatic/borrowed chord
    // Calculate degree by chromatic distance and preserve accidentals
    const rootPitch = Note.get(chordData.tonic).chroma
    const keyPitch = Note.get(keyRoot).chroma

    // ESLint sees chroma as always number, but can be undefined for invalid notes
    // These checks are necessary for runtime safety
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (rootPitch === undefined || keyPitch === undefined) {
      throw new Error(`Cannot determine chromatic distance for ${chord} in key ${keyRoot}`)
    }

    const distance = (rootPitch - keyPitch + 12) % 12

    // Map chromatic distance to closest scale degree WITH accidentals
    // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    // [I, ♭II, II, ♭III, III, IV, ♯IV/♭V, V, ♭VI, VI, ♭VII, VII]
    const chromaticMap = [
      { degree: 1, accidental: '' }, // 0: I (unison)
      { degree: 2, accidental: '♭' }, // 1: ♭II (flat 2)
      { degree: 2, accidental: '' }, // 2: II (major 2)
      { degree: 3, accidental: '♭' }, // 3: ♭III (minor 3)
      { degree: 3, accidental: '' }, // 4: III (major 3)
      { degree: 4, accidental: '' }, // 5: IV (perfect 4)
      { degree: 5, accidental: '♭' }, // 6: ♭V/♯IV (tritone)
      { degree: 5, accidental: '' }, // 7: V (perfect 5)
      { degree: 6, accidental: '♭' }, // 8: ♭VI (minor 6)
      { degree: 6, accidental: '' }, // 9: VI (major 6)
      { degree: 7, accidental: '♭' }, // 10: ♭VII (minor 7)
      { degree: 7, accidental: '' }, // 11: VII (major 7)
    ]

    const mapping = chromaticMap[distance]
    if (!mapping) {
      throw new Error(`Cannot determine degree for distance ${String(distance)}`)
    }

    const quality = determineChordQuality(chordData)
    const extensions = extractExtensions(chord, chordData)

    // Build Roman numeral with accidental prefix
    const baseRoman = buildRomanNumeral(mapping.degree, quality, extensions)
    const roman = mapping.accidental + baseRoman

    return { roman, degree: mapping.degree, quality }
  }

  // Determine quality
  const quality = determineChordQuality(chordData)

  // Extract extensions (pass pre-parsed chordData to avoid redundant Chord.get())
  const extensions = extractExtensions(chord, chordData)

  // Build Roman numeral
  const roman = buildRomanNumeral(degree, quality, extensions)

  return { roman, degree, quality }
}

/**
 * Convert an array of chords to Roman numerals
 *
 * @param chords - Array of chord symbols
 * @param keyRoot - Root of the key
 * @param scaleType - "major" or "minor"
 * @returns Array of Roman numeral analysis results
 *
 * @example
 * ```typescript
 * getRomanNumerals(['C', 'F', 'G', 'C'], 'C', 'major')
 * // => [
 * //   { roman: 'I', degree: 1, quality: 'major' },
 * //   { roman: 'IV', degree: 4, quality: 'major' },
 * //   { roman: 'V', degree: 5, quality: 'major' },
 * //   { roman: 'I', degree: 1, quality: 'major' }
 * // ]
 * ```
 */
export function getRomanNumerals(
  chords: string[],
  keyRoot: string,
  scaleType: 'major' | 'minor'
): RomanNumeralResult[] {
  return chords.map((chord) => getRomanNumeral(chord, keyRoot, scaleType))
}
