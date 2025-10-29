/**
 * Key Detection Algorithm
 *
 * Detects the most likely key of a chord progression by analyzing
 * chord relationships and diatonic membership.
 *
 * Algorithm:
 * 1. Score each possible major/minor key (24 total)
 * 2. For each key, count diatonic vs non-diatonic chords
 * 3. Give bonus points for progression ending on tonic (I/i)
 * 4. Return key with highest score and confidence percentage
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import { Note, Scale, Chord } from 'tonal'

/**
 * Maximum number of keys to cache before evicting oldest entries
 * Prevents unbounded memory growth with exotic key signatures
 */
const MAX_SCALE_CACHE_SIZE = 100

/**
 * Cache for scale notes to avoid repeated calculations
 * Key format: "{root}:{scaleType}" (e.g., "C:major", "A:minor")
 * Implements LRU eviction when MAX_SCALE_CACHE_SIZE is reached
 */
const scaleNotesCache = new Map<string, string[]>()

/**
 * Get natural scale notes (without harmonic/melodic alterations)
 * Used for accurate degree index calculations
 *
 * @param root - Root note of the key (e.g., "C", "A")
 * @param scaleType - "major" or "minor"
 * @returns Array of simplified note names in natural scale order
 */
function getNaturalScaleNotes(root: string, scaleType: 'major' | 'minor'): string[] {
  const scale = Scale.get(`${root} ${scaleType}`)
  return scale.notes.map((n) => Note.simplify(n))
}

/**
 * Get scale notes for a key with caching and bounded memory
 * For minor keys, returns natural scale notes + unique harmonic/melodic alterations
 *
 * @param root - Root note of the key (e.g., "C", "A")
 * @param scaleType - "major" or "minor"
 * @returns Array of simplified note names (natural scale order preserved)
 *
 * @remarks
 * - Maintains natural scale ordering for correct degree calculations
 * - Appends altered notes (raised 6th/7th) at end for membership tests
 * - Implements bounded LRU cache to prevent memory leaks
 */
function getScaleNotes(root: string, scaleType: 'major' | 'minor'): string[] {
  const cacheKey = `${root}:${scaleType}`

  // Check cache first
  const cached = scaleNotesCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Calculate scale notes - preserve natural scale ordering
  const naturalNotes = getNaturalScaleNotes(root, scaleType)
  let scaleNotes = [...naturalNotes]

  if (scaleType === 'minor') {
    // Add unique notes from harmonic + melodic minor (raised 6th/7th)
    // Append at end to preserve natural scale degree indices
    const harmonicScale = Scale.get(`${root} harmonic minor`)
    const melodicScale = Scale.get(`${root} melodic minor`)

    const extraNotes = [...harmonicScale.notes, ...melodicScale.notes]
      .map((n) => Note.simplify(n))
      .filter((note) => !scaleNotes.includes(note))

    scaleNotes = [...scaleNotes, ...extraNotes]
  }

  // Implement bounded cache with LRU eviction
  if (scaleNotesCache.size >= MAX_SCALE_CACHE_SIZE) {
    // Evict oldest entry (first key in Map)
    const oldestKey = scaleNotesCache.keys().next().value
    if (oldestKey) {
      scaleNotesCache.delete(oldestKey)
    }
  }

  // Cache and return
  scaleNotesCache.set(cacheKey, scaleNotes)
  return scaleNotes
}

/**
 * Key detection result with confidence score
 */
export interface KeyDetection {
  /** Detected key (e.g., "C major", "A minor") */
  readonly key: string

  /**
   * Confidence in detection (0.0-1.0)
   * - 1.0 = All chords diatonic
   * - 0.8+ = Mostly diatonic
   * - 0.5-0.8 = Moderately chromatic
   * - <0.5 = Highly chromatic or ambiguous
   */
  readonly confidence: number

  /** Root note of the key (e.g., "C", "A") */
  readonly root: string

  /** Scale type ("major" or "minor") */
  readonly scaleType: 'major' | 'minor'

  /** Number of diatonic chords found */
  readonly diatonicCount: number

  /** Total number of chords analyzed */
  readonly totalChords: number
}

/**
 * All possible major and minor keys (24 total)
 */
const ALL_KEYS = [
  // Major keys
  'C major',
  'G major',
  'D major',
  'A major',
  'E major',
  'B major',
  'F# major',
  'Db major',
  'Ab major',
  'Eb major',
  'Bb major',
  'F major',
  // Minor keys
  'A minor',
  'E minor',
  'B minor',
  'F# minor',
  'C# minor',
  'G# minor',
  'Eb minor',
  'Bb minor',
  'F minor',
  'C minor',
  'G minor',
  'D minor',
]

/**
 * Get the diatonic chords for a given key
 *
 * @param root - Root note of the key (e.g., "C", "A")
 * @param scaleType - "major" or "minor"
 * @returns Array of diatonic chord roots
 *
 * @example
 * ```typescript
 * getDiatonicChords('C', 'major') // => ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']
 * getDiatonicChords('A', 'minor') // => ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G']
 * ```
 */
function getDiatonicChords(root: string, scaleType: 'major' | 'minor'): string[] {
  const scale = Scale.get(`${root} ${scaleType}`)
  // ESLint sees !scale.notes as always falsy (Scale.get always returns notes array)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!scale.notes || scale.notes.length === 0) {
    return []
  }

  // Build triads on each scale degree
  const diatonicChords: string[] = []

  for (let i = 0; i < scale.notes.length; i++) {
    const note = scale.notes[i]
    const third = scale.notes[(i + 2) % scale.notes.length]
    const fifth = scale.notes[(i + 4) % scale.notes.length]

    if (!note || !third || !fifth) continue

    // Detect chord from intervals
    const chordNotes = [note, third, fifth]
    const detected = Chord.detect(chordNotes)

    if (detected.length > 0 && detected[0]) {
      diatonicChords.push(detected[0])
    } else {
      // Fallback: just use the root note
      diatonicChords.push(note)
    }
  }

  return diatonicChords
}

/**
 * Check if a chord is diatonic to a given key
 *
 * @param chord - Chord to check (e.g., "Cmaj7", "Dm", "G7")
 * @param root - Root note of the key
 * @param scaleType - "major" or "minor"
 * @returns true if chord belongs to the key
 *
 * @remarks
 * Handles extended chords (7ths, 9ths, etc.) by checking root and quality
 */
function isChordDiatonic(chord: string, root: string, scaleType: 'major' | 'minor'): boolean {
  const diatonicChords = getDiatonicChords(root, scaleType)
  const chordData = Chord.get(chord)

  if (!chordData.tonic) {
    return false
  }

  // Normalize root notes for enharmonic equivalence
  const chordRoot = Note.simplify(chordData.tonic)

  // Check if chord root is in the scale
  // For minor keys, union natural + harmonic minor (includes raised 7th)
  const scaleNotes = getScaleNotes(root, scaleType)

  if (!scaleNotes.includes(chordRoot)) {
    return false
  }

  // For major/minor keys, check if the chord quality matches expected degree
  // This is a simplified check - extended chords (7ths, 9ths) are considered
  // diatonic if their root and basic quality (major/minor/dim) match

  for (const diatonicChord of diatonicChords) {
    const diatonicData = Chord.get(diatonicChord)

    if (!diatonicData.tonic) continue

    const diatonicRoot = Note.simplify(diatonicData.tonic)

    if (chordRoot === diatonicRoot) {
      // Same root - check if qualities are compatible
      // ESLint sees chord Data.quality/aliases as always truthy and doesn't need optional chaining
      // But tonal.js can return empty/undefined values
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const chordQuality = chordData.quality || chordData.aliases?.[0] || ''
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const diatonicQuality = diatonicData.quality || diatonicData.aliases?.[0] || ''

      // Major chord extensions (maj7, 6, 9) are diatonic if base chord is major
      if (
        diatonicQuality.includes('major') &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (chordQuality.includes('major') || !chordQuality)
      ) {
        return true
      }

      // Minor chord extensions (m7, m9, m11) are diatonic if base chord is minor
      if (
        diatonicQuality.includes('minor') &&
        (chordQuality.includes('minor') || chordQuality.startsWith('m'))
      ) {
        return true
      }

      // Diminished chords
      if (diatonicQuality.includes('diminished') && chordQuality.includes('diminished')) {
        return true
      }

      // Harmonic minor: Major V and V7 are diatonic (raised 7th)
      // Use natural scale for accurate degree calculation (index 4 = degree 5)
      const naturalScaleNotes = getNaturalScaleNotes(root, scaleType)
      const degreeIndex = naturalScaleNotes.indexOf(chordRoot)
      if (scaleType === 'minor' && degreeIndex === 4) {
        // In harmonic minor, V can be major or dominant 7th
        const chordType = (chordData.type || '').toLowerCase()
        if (chordType.includes('dominant') || chordQuality.includes('major')) {
          return true
        }
      }

      // Dominant 7th chords are diatonic on degree V in major keys
      if (chordQuality.includes('7') && !chordQuality.includes('maj7')) {
        if (scaleType === 'major' && degreeIndex === 4) return true // V7 in major
      }

      // Exact match
      if (chordQuality === diatonicQuality) {
        return true
      }
    }
  }

  return false
}

/**
 * Score a key based on chord progression
 *
 * @param chords - Array of chord symbols
 * @param root - Root note of candidate key
 * @param scaleType - "major" or "minor"
 * @returns Score object with points and diatonic count
 */
function scoreKey(
  chords: string[],
  root: string,
  scaleType: 'major' | 'minor'
): { score: number; diatonicCount: number } {
  let score = 0
  let diatonicCount = 0

  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i]
    if (!chord) continue

    if (isChordDiatonic(chord, root, scaleType)) {
      score += 2 // Points for diatonic chords
      diatonicCount++
    } else {
      score -= 1 // Penalty for non-diatonic chords
    }
  }

  // Bonus points for progression starting on tonic
  // Starting on tonic is a STRONGER indicator than ending, so weight it higher
  const firstChord = chords[0]
  if (firstChord) {
    const firstChordData = Chord.get(firstChord)

    if (firstChordData.tonic) {
      const firstRoot = Note.simplify(firstChordData.tonic)
      const keyRoot = Note.simplify(root)

      if (firstRoot === keyRoot) {
        score += 4 // Strong bonus for starting on tonic
      }
    }
  }

  // Bonus points for progression ending on tonic
  const lastChord = chords[chords.length - 1]
  if (lastChord) {
    const lastChordData = Chord.get(lastChord)

    if (lastChordData.tonic) {
      const lastRoot = Note.simplify(lastChordData.tonic)
      const keyRoot = Note.simplify(root)

      if (lastRoot === keyRoot) {
        score += 2 // Moderate bonus for ending on tonic
      }
    }
  }

  // Bonus for major keys: Check for deceptive cadence (V → vi)
  // This helps distinguish C major (I-IV-V-vi) from A minor (III-VI-VII-i)
  if (scaleType === 'major') {
    const scaleNotes = getScaleNotes(root, 'major')

    for (let i = 0; i < chords.length - 1; i++) {
      const current = chords[i]
      const next = chords[i + 1]
      // TypeScript needs explicit null check for array indexing (noUncheckedIndexedAccess)
      if (!current || !next) continue

      const currentData = Chord.get(current)
      const nextData = Chord.get(next)

      // Validate chord data before processing to prevent crashes
      if (!currentData.tonic || !nextData.tonic) continue
      // ESLint sees !currentData.notes as always truthy, but tonal.js can return undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!currentData.notes || currentData.notes.length === 0) continue
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!nextData.notes || nextData.notes.length === 0) continue

      const currentRoot = Note.simplify(currentData.tonic)
      const nextRoot = Note.simplify(nextData.tonic)

      const currentDegree = scaleNotes.indexOf(currentRoot)
      const nextDegree = scaleNotes.indexOf(nextRoot)

      // Detect V → vi motion (deceptive cadence)
      if (currentDegree === 4 && nextDegree === 5) {
        // degree 5 is index 4, degree 6 is index 5
        const currentType = (currentData.type || '').toLowerCase()
        // ESLint sees nextData.quality as always truthy, but can be empty/undefined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const nextQuality = (nextData.quality || '').toLowerCase()

        // V (major/dominant) → vi (minor)
        if (
          (currentType.includes('dominant') || currentData.quality.includes('major')) &&
          nextQuality.includes('minor')
        ) {
          score += 3 // Bonus for deceptive cadence pattern in major key
        }
      }
    }
  }

  return { score, diatonicCount }
}

/**
 * Detect the key of a chord progression
 *
 * @param chords - Array of chord symbols (e.g., ['C', 'F', 'G', 'C'])
 * @returns Key detection result with confidence score
 *
 * @throws {Error} If chords array is empty
 *
 * @example
 * ```typescript
 * const result = detectKey(['C', 'F', 'G', 'C'])
 * // result.key === 'C major'
 * // result.confidence === 1.0
 * // result.diatonicCount === 4
 * ```
 *
 * @remarks
 * The algorithm scores all 24 major and minor keys and returns the highest-scoring key.
 * Confidence is calculated as the percentage of diatonic chords in the progression.
 */
export function detectKey(chords: string[]): KeyDetection {
  if (chords.length === 0) {
    throw new Error('Cannot detect key from empty chord progression')
  }

  let bestKey = 'C major'
  let bestScore = -Infinity
  let bestDiatonicCount = 0
  let bestRoot = 'C'
  let bestScaleType: 'major' | 'minor' = 'major'

  // Score all possible keys
  for (const keyName of ALL_KEYS) {
    const [root, scaleType] = keyName.split(' ') as [string, 'major' | 'minor']
    const { score, diatonicCount } = scoreKey(chords, root, scaleType)

    if (score > bestScore) {
      bestScore = score
      bestKey = keyName
      bestDiatonicCount = diatonicCount
      bestRoot = root
      bestScaleType = scaleType
    }
  }

  // Calculate confidence based on diatonic percentage
  const diatonicPercentage = bestDiatonicCount / chords.length
  const confidence = Math.min(1.0, diatonicPercentage)

  return {
    key: bestKey,
    confidence,
    root: bestRoot,
    scaleType: bestScaleType,
    diatonicCount: bestDiatonicCount,
    totalChords: chords.length,
  }
}
