/**
 * Chord Progression Analysis
 *
 * Main entry point for analyzing chord progressions. Provides comprehensive
 * harmonic analysis including:
 * - Key detection with confidence scoring
 * - Roman numeral analysis for each chord
 * - Harmonic function assignment
 * - Cadence identification
 * - Pattern matching (general and genre-specific)
 * - Borrowed chord detection
 * - Secondary dominant identification
 * - Loopability analysis
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import type {
  ProgressionAnalysis,
  ProgressionAnalysisOptions,
  ChordAnalysis,
  BorrowedChord,
  SecondaryDominant,
  GenreDetectionResult,
} from '@music-reasoning/types'
import { Chord, Note, Scale } from 'tonal'
import { detectKey } from './key-detection'
import { getRomanNumerals } from './roman-numerals'
import { getHarmonicFunction } from './analyze'
import { detectCadences } from './cadences'
import { detectPatterns } from './patterns'
import { detectGenre } from '../genre/detect'

/**
 * Analyze a chord progression
 *
 * @param chords - Array of chord symbols (e.g., ['C', 'Am', 'F', 'G'])
 * @param options - Optional analysis options (genre hint, etc.)
 * @returns Complete progression analysis with key, Roman numerals, cadences, patterns, etc.
 *
 * @throws {Error} If chords array is empty
 * @throws {Error} If any chord is invalid
 *
 * @example
 * ```typescript
 * const result = analyzeProgression(['C', 'F', 'G', 'C'])
 * // result.key === 'C major'
 * // result.confidence === 1.0
 * // result.analysis[0].roman === 'I'
 * // result.cadences[0].type === 'authentic'
 * // result.loopable === true
 * ```
 *
 * @example
 * With genre hint:
 * ```typescript
 * const result = analyzeProgression(['Dm7', 'G7', 'Cmaj7'], { genre: 'jazz' })
 * // Prioritizes jazz patterns in genre detection
 * ```
 *
 * @remarks
 * This function is fully synchronous and offline-capable. All analysis is
 * performed using deterministic algorithms without any AI or cloud dependencies.
 *
 * Performance: Typical analysis completes in <5ms for 4-chord progressions,
 * <20ms for 8-chord progressions, and <50ms for 16-chord progressions.
 * Target: p95 < 100ms for all progression lengths.
 */
export function analyzeProgression(
  chords: string[],
  options?: ProgressionAnalysisOptions
): ProgressionAnalysis {
  // Step 1: Validate input
  if (chords.length === 0) {
    throw new Error('Cannot analyze empty chord progression')
  }

  // Validate all chords
  for (const chord of chords) {
    const chordData = Chord.get(chord)
    if (!chordData.tonic) {
      throw new Error(`Invalid chord: ${chord}`)
    }
  }

  // Step 2: Detect key
  const keyDetection = detectKey(chords)
  const { key, confidence, root: keyRoot, scaleType } = keyDetection

  // Step 3: Convert chords to Roman numerals
  const romanNumerals = getRomanNumerals(chords, keyRoot, scaleType)

  // Step 4: Build chord analysis array
  const analysis: ChordAnalysis[] = romanNumerals.map((rn, index) => {
    const harmonicFunction = getHarmonicFunction(rn.degree, rn.quality)

    return {
      chord: chords[index] ?? '',
      roman: rn.roman,
      quality: rn.quality,
      degree: rn.degree,
      function: harmonicFunction,
    }
  })

  // Step 5: Detect cadences
  const cadences = detectCadences(analysis, chords)

  // Step 6: Detect general patterns
  const romanStrings = romanNumerals.map((rn) => rn.roman)
  const patterns = detectPatterns(romanStrings)

  // Step 7: Detect genre patterns using Roman numeral matching
  const genreResults: GenreDetectionResult[] = detectGenre(
    chords,
    options?.genre ? { genre: options.genre } : undefined
  )

  // Extract matched genre patterns
  const genrePatterns = genreResults.flatMap((r) => r.matchedPatterns)

  // Step 8: Detect borrowed chords
  const borrowedChords = detectBorrowedChords(analysis, keyRoot, scaleType)

  // Step 9: Detect secondary dominants
  const secondaryDominants = detectSecondaryDominants(analysis, chords)

  // Step 10: Update analysis with borrowed/secondary dominant markers
  const enrichedAnalysis = enrichAnalysis(analysis, borrowedChords, secondaryDominants)

  // Step 11: Determine loopability
  const loopable = isLoopable(enrichedAnalysis)

  // Step 12: Return complete analysis
  return {
    key,
    confidence,
    analysis: enrichedAnalysis,
    patterns,
    genrePatterns, // Now type-safe without casts
    suggestedGenres: genreResults,
    borrowedChords,
    secondaryDominants,
    cadences,
    loopable,
  }
}

/**
 * Detect borrowed chords (modal mixture)
 *
 * @param analysis - Per-chord analysis array
 * @param keyRoot - Root of the detected key
 * @param scaleType - "major" or "minor"
 * @returns Array of borrowed chords
 *
 * @remarks
 * Borrowed chords are chords from the parallel key (e.g., Fm in C major,
 * borrowed from C minor). Common examples:
 * - iv in major (subdominant minor)
 * - bVI in major (flat submediant)
 * - bVII in major (flat subtonic)
 */
function detectBorrowedChords(
  analysis: readonly ChordAnalysis[],
  keyRoot: string,
  scaleType: 'major' | 'minor'
): BorrowedChord[] {
  const borrowed: BorrowedChord[] = []

  // Get expected diatonic scale
  const scale = Scale.get(`${keyRoot} ${scaleType}`)
  const scaleNotes = scale.notes.map((n) => Note.simplify(n))

  // Cache parallel key info (computed once, reused for all chords)
  const parallelScaleType = scaleType === 'major' ? 'minor' : 'major'
  const parallelKey = `${keyRoot} ${parallelScaleType}`
  const parallelScale = Scale.get(parallelKey)
  const parallelNotes = parallelScale.notes.map((n) => Note.simplify(n))

  for (const chordAnalysis of analysis) {
    const chordData = Chord.get(chordAnalysis.chord)
    if (!chordData.tonic) continue

    const chordRoot = Note.simplify(chordData.tonic)

    // Skip V7 in major keys - it's diatonic, not borrowed
    // isDominantVoicingOnV: degree 5 + dominant quality
    const isDominantVoicingOnV =
      chordAnalysis.degree === 5 &&
      (chordAnalysis.quality === 'dominant' || chordAnalysis.quality.includes('7'))
    if (scaleType === 'major' && isDominantVoicingOnV) {
      continue
    }

    // Check if chord root is diatonic
    if (!scaleNotes.includes(chordRoot)) {
      // Non-diatonic root = potential borrowed chord
      // Require ALL chord tones to exist in parallel scale (not just root)
      // ESLint sees !chordData.notes as always falsy, but tonal.js can return undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!chordData.notes || chordData.notes.length === 0) continue
      const chordTones = chordData.notes.map((n) => Note.simplify(n))
      const allTonesInParallel = chordTones.every((note) => parallelNotes.includes(note))

      if (parallelNotes.includes(chordRoot) && allTonesInParallel) {
        // This chord is fully diatonic to the parallel key
        borrowed.push({
          chord: chordAnalysis.chord,
          borrowedFrom: parallelKey,
          function: chordAnalysis.function,
        })
      }
    } else {
      // Root is diatonic, but check quality
      // Example: Fm in C major (root F is diatonic, but quality is minor instead of major)
      const expectedQuality = getExpectedQuality(chordAnalysis.degree, scaleType)
      if (expectedQuality && !areQualitiesEquivalent(chordAnalysis.quality, expectedQuality)) {
        // Quality doesn't match expected = potential borrowed chord
        // Require ALL chord tones to exist in parallel scale
        // ESLint sees !chordData.notes as always falsy, but tonal.js can return undefined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!chordData.notes || chordData.notes.length === 0) continue
        const chordTones = chordData.notes.map((n) => Note.simplify(n))
        const allTonesInParallel = chordTones.every((note) => parallelNotes.includes(note))

        if (allTonesInParallel) {
          borrowed.push({
            chord: chordAnalysis.chord,
            borrowedFrom: parallelKey,
            function: chordAnalysis.function,
          })
        }
      }
    }
  }

  return borrowed
}

/**
 * Check if two chord qualities are harmonically equivalent
 *
 * @param actual - Actual chord quality
 * @param expected - Expected chord quality
 * @returns true if qualities are harmonically equivalent
 *
 * @remarks
 * Treats dominant and major as equivalent since V7 is major quality + 7th extension.
 * This prevents false positives in borrowed chord detection where diatonic V7 chords
 * would otherwise be flagged as borrowed due to quality mismatch.
 *
 * @example
 * ```typescript
 * areQualitiesEquivalent('dominant', 'major') // => true
 * areQualitiesEquivalent('major', 'dominant') // => true
 * areQualitiesEquivalent('minor', 'major') // => false
 * ```
 */
function areQualitiesEquivalent(actual: string, expected: string): boolean {
  // Exact match
  if (actual === expected) return true

  // Dominant chords are major quality with extensions (harmonic equivalence)
  const isDominantMajorPair =
    (actual === 'dominant' && expected === 'major') ||
    (actual === 'major' && expected === 'dominant')

  return isDominantMajorPair
}

/**
 * Get expected chord quality for a scale degree
 *
 * @param degree - Scale degree (1-7)
 * @param scaleType - "major" or "minor"
 * @returns Expected quality, or null if ambiguous
 */
function getExpectedQuality(degree: number, scaleType: 'major' | 'minor'): string | null {
  if (scaleType === 'major') {
    // Major key: I, IV, V are major; ii, iii, vi are minor; vii° is diminished
    switch (degree) {
      case 1:
      case 4:
      case 5:
        return 'major'
      case 2:
      case 3:
      case 6:
        return 'minor'
      case 7:
        return 'diminished'
      default:
        return null
    }
  } else {
    // Minor key (natural minor): i, iv, v are minor; III, VI, VII are major; ii° is diminished
    switch (degree) {
      case 1:
      case 4:
        return 'minor'
      case 3:
      case 6:
      case 7:
        return 'major'
      case 2:
        return 'diminished'
      case 5:
        // v in natural minor, V in harmonic minor - both are valid
        return null
      default:
        return null
    }
  }
}

/**
 * Detect secondary dominants
 *
 * @param analysis - Per-chord analysis array
 * @param chords - Original chord symbols
 * @returns Array of secondary dominants
 *
 * @remarks
 * Secondary dominants are dominant chords (V7) that resolve to a chord
 * other than the tonic. Notation: V/x or V7/x (e.g., V/vi, V7/ii).
 *
 * Algorithm:
 * 1. Find all dominant quality chords (7th chords without maj7)
 * 2. Check if next chord is a fifth below (or fourth above)
 * 3. If yes, mark as secondary dominant
 */
function detectSecondaryDominants(
  analysis: readonly ChordAnalysis[],
  chords: string[]
): SecondaryDominant[] {
  const secondaries: SecondaryDominant[] = []

  for (let i = 0; i < analysis.length - 1; i++) {
    const current = analysis[i]
    const next = analysis[i + 1]

    if (!current || !next) continue

    // Check if current chord has dominant function
    // Includes: dominant 7th, augmented (V+), and altered dominants
    const isDominant =
      current.quality === 'dominant' ||
      current.quality === 'augmented' || // V+, V7#5 function as dominants
      (current.quality.includes('7') && !current.quality.includes('maj'))

    if (!isDominant) continue

    // Skip primary dominant (V → I) - that's not a secondary dominant
    if (current.degree === 5 && next.degree === 1) continue

    // Check if current chord resolves to next chord (fifth relationship)
    const currentChord = chords[i]
    const nextChord = chords[i + 1]

    if (!currentChord || !nextChord) continue

    const currentChordData = Chord.get(currentChord)
    const nextChordData = Chord.get(nextChord)

    // Validate chord data before processing to prevent crashes
    if (!currentChordData.tonic || !nextChordData.tonic) continue
    // ESLint sees !chordData.notes as always falsy, but tonal.js can return undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!currentChordData.notes || currentChordData.notes.length === 0) continue
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!nextChordData.notes || nextChordData.notes.length === 0) continue

    const currentRoot = Note.simplify(currentChordData.tonic)
    const nextRoot = Note.simplify(nextChordData.tonic)

    // Calculate interval (should be descending fifth / ascending fourth)
    // ESLint sees Note.get().chroma as always defined, but can be undefined for invalid notes
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const currentPitch = Note.get(currentRoot).chroma ?? 0
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const nextPitch = Note.get(nextRoot).chroma ?? 0
    const interval = (nextPitch - currentPitch + 12) % 12

    // Perfect fourth up (or perfect fifth down) = 5 semitones
    if (interval === 5 || interval === 7) {
      // This is a secondary dominant!
      // Normalize target Roman numeral:
      // 1. Strip extensions (maj7, 7, 9, 11, 13, 6)
      // 2. Strip accidentals (♭, ♯, #, b)
      // 3. Preserve case (uppercase for major, lowercase for minor)
      let targetRoman = next.roman
        .replace(/maj7|7|9|11|13|6/g, '') // Remove extensions
        .replace(/[♭♯#b]/g, '') // Remove accidentals

      // Ensure proper case (uppercase for major/aug, lowercase for minor/dim)
      // Extract the roman numeral part (I, II, III, IV, V, VI, VII, i, ii, iii, iv, v, vi, vii)
      const romanMatch = targetRoman.match(/^([ivIV]+)/)
      if (romanMatch && romanMatch[1]) {
        targetRoman = romanMatch[1]
      }

      secondaries.push({
        chord: currentChord,
        targetChord: nextChord,
        romanNotation: `V7/${targetRoman}`,
      })
    }
  }

  return secondaries
}

/**
 * Enrich analysis with borrowed/secondary dominant markers
 *
 * @param analysis - Base analysis array
 * @param borrowedChords - Detected borrowed chords
 * @param secondaryDominants - Detected secondary dominants
 * @returns Enriched analysis array
 */
function enrichAnalysis(
  analysis: readonly ChordAnalysis[],
  borrowedChords: readonly BorrowedChord[],
  secondaryDominants: readonly SecondaryDominant[]
): ChordAnalysis[] {
  return analysis.map((chord) => {
    const borrowed = borrowedChords.find((b) => b.chord === chord.chord)
    const secondary = secondaryDominants.find((s) => s.chord === chord.chord)

    if (borrowed || secondary) {
      return {
        ...chord,
        borrowed: borrowed ? true : undefined,
        secondaryDominant: secondary ? secondary.targetChord : undefined,
      }
    }

    return chord
  })
}

/**
 * Determine if a progression is loopable
 *
 * @param analysis - Per-chord analysis array
 * @returns true if progression loops back to tonic
 *
 * @remarks
 * A progression is loopable if:
 * - Last chord is V (dominant) and first is I (tonic), OR
 * - Both first and last are I (tonic)
 */
function isLoopable(analysis: readonly ChordAnalysis[]): boolean {
  if (analysis.length < 2) return false

  const first = analysis[0]
  const last = analysis[analysis.length - 1]

  if (!first || !last) return false

  // Case 1: Ends on V, starts on I (classic turnaround)
  if (last.degree === 5 && first.degree === 1) {
    return true
  }

  // Case 2: Both start and end on I
  if (first.degree === 1 && last.degree === 1) {
    return true
  }

  return false
}

// Re-export types and helper functions
export type { ProgressionAnalysis, ProgressionAnalysisOptions, ChordAnalysis }
export { detectKey } from './key-detection'
export { getRomanNumeral, getRomanNumerals } from './roman-numerals'
export { getHarmonicFunction } from './analyze'
export { detectCadences } from './cadences'
export { detectPatterns } from './patterns'
