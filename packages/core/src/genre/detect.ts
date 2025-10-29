import type { GenrePattern, GenreDetectionResult, Genre } from '@music-reasoning/types'
import { Chord, Note } from 'tonal'
import { GENRE_PATTERNS } from './patterns'
import { detectKey } from '../progression/key-detection'
import { getRomanNumerals } from '../progression/roman-numerals'
import { getRelativeMajor, getRelativeMinor } from '../scale/relationships'

/**
 * Maximum weight value for a single genre pattern
 * Used in confidence score normalization
 */
const MAX_PATTERN_WEIGHT = 10

/**
 * Supported genre types for detection
 * Aligned with Genre type from @music-reasoning/types
 *
 * @deprecated Use Genre from @music-reasoning/types instead
 */
export type SupportedGenre = Genre

/**
 * Options for genre detection
 */
export interface GenreDetectionOptions {
  /**
   * Optional genre hint to prioritize specific genre patterns
   */
  genre?: Genre
}

/**
 * Detect genre from chord progression using Roman numeral pattern matching
 *
 * @param chords - Array of chord symbols (e.g., ['C', 'Am', 'F', 'G'])
 * @param options - Optional genre hint to prioritize patterns
 * @returns Array of detected genres sorted by confidence (highest first)
 *
 * @remarks
 * This function:
 * 1. Detects the key of the progression
 * 2. Converts chords to Roman numerals
 * 3. Matches Roman numeral sequence against 50+ genre patterns
 * 4. Returns top genres with confidence scores and evidence
 *
 * If a genre hint is provided, patterns from that genre are weighted higher.
 */
export function detectGenre(
  chords: string[],
  options?: GenreDetectionOptions
): GenreDetectionResult[] {
  // Validate input
  if (chords.length === 0) {
    return [{ genre: 'unknown', confidence: 0, matchedPatterns: [] }]
  }

  // Validate all chords
  for (const chord of chords) {
    const chordData = Chord.get(chord)
    if (!chordData.tonic) {
      return [{ genre: 'unknown', confidence: 0, matchedPatterns: [] }]
    }
  }

  /**
   * Step 1: Generate comprehensive key candidates for ambiguous progressions
   *
   * Key ambiguity resolution heuristic (from spec clarification 2025-10-13):
   *
   * 1. **Primary**: Use first chord's root as tonic hint (prefers matching key)
   *    - Rationale: Opening chord establishes tonal center (mirrors musical perception)
   *    - E.g., ['Am', 'F', 'C', 'G'] → try A minor first (first chord is Am)
   *
   * 2. **Secondary**: Try last chord as resolution target (dominant resolution)
   *    - Rationale: Ending chord often confirms key (V7 → I resolution)
   *    - E.g., ['Dm7', 'G7'] → try C major (G7 resolves to C)
   *
   * 3. **Fallback**: Try detected key with relative major/minor pairs
   *    - Rationale: Relative keys share notes, patterns may match both
   *    - E.g., C major ⇄ A minor (same notes, different tonal center)
   *
   * 4. **Ultimate**: Multi-genre confidence scoring reflects remaining uncertainty
   *    - Rationale: If multiple keys match patterns, return all with confidence scores
   *    - E.g., ['C', 'F', 'G'] matches pop, classical, rock → returns all 3 genres
   *
   * Strategy: Try detected key, relatives, first/last chords, AND their relatives
   */
  const keyDetection = detectKey(chords)
  // Safe: length check at line 53 guarantees at least 1 element
  const firstChord = chords[0] as string
  const lastChord = chords[chords.length - 1] as string
  const firstChordData = Chord.get(firstChord)
  const lastChordData = Chord.get(lastChord)

  // Use Set to deduplicate on "root:scaleType" to preserve same-root different-mode keys
  const keySet = new Set<string>()
  const keyCandidates: Array<{ root: string; scaleType: 'major' | 'minor' }> = []

  const addCandidate = (root: string, scaleType: 'major' | 'minor') => {
    const key = `${root}:${scaleType}`
    if (!keySet.has(key)) {
      keySet.add(key)
      keyCandidates.push({ root, scaleType })
    }
  }

  // Helper: add a root with both its major/minor AND their relatives
  const addCandidateWithRelatives = (root: string) => {
    // Add major and its relative minor
    addCandidate(root, 'major')
    const relativeOfMajor = getRelativeMinor(root)
    addCandidate(relativeOfMajor, 'minor')

    // Add minor and its relative major
    addCandidate(root, 'minor')
    const relativeOfMinor = getRelativeMajor(root)
    addCandidate(relativeOfMinor, 'major')
  }

  // 1. Add detected key with relatives
  addCandidateWithRelatives(keyDetection.root)

  // 2. Add first chord as tonic with relatives
  if (firstChordData.tonic) {
    addCandidateWithRelatives(firstChordData.tonic)
  }

  // 3. Add last chord as tonic with relatives
  if (lastChordData.tonic) {
    addCandidateWithRelatives(lastChordData.tonic)
  }

  // 4. If last chord is dominant 7th (not maj7), add perfect 4th resolution as candidate
  // E.g., G7 → C (V7 → I resolution)
  // Note: Exclude maj7 chords (Cmaj7 is not dominant, doesn't resolve)
  const isDominant = lastChordData.tonic && lastChordData.type === 'dominant seventh'

  if (isDominant && lastChordData.tonic) {
    try {
      const resolvedRoot = Note.transpose(lastChordData.tonic, '4P') // Perfect 4th up
      addCandidateWithRelatives(resolvedRoot)
    } catch {
      // Skip if transpose fails - this is optional enhancement, not critical
      // Dominant resolution is a bonus heuristic, not required for functionality
    }
  }

  /**
   * Step 2: Adaptive windowing for long progressions (FR-007)
   *
   * **Strategy** (from spec clarification 2025-10-13):
   * - **16 chords or fewer**: Analyze full progression (optimal performance path, 90%+ of cases)
   * - **More than 16 chords**: Split into 12-chord windows with 6-chord overlap (edge case handling)
   *
   * **Windowing Parameters**:
   * - Window size: 12 chords (captures most common patterns: 12-bar blues, extended turnarounds)
   * - Overlap: 6 chords (50% overlap ensures patterns spanning window boundaries are detected)
   *
   * **Rationale**: Optimizes common case (short progressions) while handling edge cases
   * (long progressions like full songs or medleys) without performance degradation.
   */
  const windowedChordSegments: string[][] = []

  if (chords.length <= 16) {
    // Optimal path: analyze full progression
    windowedChordSegments.push(chords)
  } else {
    // Edge case path: create overlapping windows
    const WINDOW_SIZE = 12
    const OVERLAP = 6
    const STEP_SIZE = WINDOW_SIZE - OVERLAP // 6 chords forward per window

    for (let start = 0; start < chords.length; start += STEP_SIZE) {
      const end = Math.min(start + WINDOW_SIZE, chords.length)
      const window = chords.slice(start, end)

      // Only add windows with at least 4 chords (minimum for pattern detection)
      if (window.length >= 4) {
        windowedChordSegments.push(window)
      }

      // Stop if this window reached the end
      if (end === chords.length) {
        break
      }
    }
  }

  // Step 3: Get Roman numerals for all key candidates across all windows
  const romanStringCandidates: string[] = []

  for (const windowChords of windowedChordSegments) {
    for (const candidate of keyCandidates) {
      try {
        const romanNumerals = getRomanNumerals(windowChords, candidate.root, candidate.scaleType)
        const romanString = romanNumerals.map((rn) => rn.roman).join('-')
        romanStringCandidates.push(romanString)
      } catch {
        // Skip invalid key candidates (e.g., chords don't fit in this key)
        // This is expected for many candidates - silent failure is intentional
        continue
      }
    }
  }

  // Step 4: Match against all genre patterns using all key interpretations
  const matches = new Map<Genre, GenrePattern[]>()

  for (const pattern of GENRE_PATTERNS) {
    // Skip if genre hint provided and this pattern doesn't match
    if (options?.genre && pattern.genre !== options.genre) {
      continue
    }

    // Check if pattern matches ANY of the key interpretations
    const matchesAnyKey = romanStringCandidates.some((romanString) =>
      matchesPattern(romanString, pattern.pattern)
    )

    if (matchesAnyKey) {
      const genreMatches = matches.get(pattern.genre)
      if (genreMatches) {
        genreMatches.push(pattern)
      } else {
        matches.set(pattern.genre, [pattern])
      }
    }
  }

  /**
   * Step 5: Calculate confidence scores
   *
   * Confidence scoring formula (FR-011 from spec clarification 2025-10-13):
   *
   * **Formula**:
   * ```
   * genreScore = Σ(pattern.weight) for all matched patterns of that genre
   * confidence = genreScore / maxPossibleScore
   * maxPossibleScore = matchedPatternCount × MAX_PATTERN_WEIGHT (10)
   * ```
   *
   * **Normalization**:
   * - Confidence is always in range [0.0, 1.0]
   * - Capped at 1.0 using Math.min() to handle edge cases
   *
   * **Semantic Ranges** (for calibration test validation SC-003):
   * - **≥0.80**: Strong match (canonical pattern detected)
   *   - Example: ii-V-I (weight 10) → jazz confidence 1.0
   *   - Example: I-V-vi-IV (weight 10) → pop confidence 1.0
   *
   * - **0.40-0.70**: Moderate match (some patterns found, ambiguity present)
   *   - Example: I-IV-V matches pop (weight 9), classical (weight 9), rock (weight 9)
   *   - All return ~0.90 confidence (normalized by 1 pattern each)
   *
   * - **<0.30**: Weak/no match
   *   - Example: Only low-weight patterns (weight 6-7) partially match
   *
   * **Rationale**: Weight-based scoring rewards canonical patterns (weight 10) while
   * still detecting less common patterns (weight 6-7). Normalization ensures scores
   * are comparable across genres regardless of pattern count.
   */
  const results: GenreDetectionResult[] = []
  for (const [genre, patterns] of matches.entries()) {
    const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0)
    // Confidence: normalize by max possible weight per pattern
    const maxPossibleWeight = patterns.length * MAX_PATTERN_WEIGHT
    // Defensive check: avoid division by zero (shouldn't happen, but be safe)
    const confidence = maxPossibleWeight > 0 ? Math.min(totalWeight / maxPossibleWeight, 1.0) : 0

    results.push({ genre, confidence, matchedPatterns: patterns })
  }

  // Step 6: Sort by confidence descending
  results.sort((a, b) => b.confidence - a.confidence)

  // Return 'unknown' if no patterns matched
  return results.length > 0 ? results : [{ genre: 'unknown', confidence: 0, matchedPatterns: [] }]
}

/**
 * Check if a progression matches a genre pattern
 *
 * @param progressionRoman - Roman numeral string from progression (e.g., "I-V-vi-IV" or "I7-V7-vi-IVmaj7")
 * @param patternRoman - Pattern to match against (e.g., "I-V-vi-IV" or "I7-IV7-I7-V7")
 * @returns true if pattern matches
 *
 * @remarks
 * Matching rules:
 * 1. Extensions are stripped from progression ONLY if pattern doesn't specify them
 * 2. If pattern has "I7", progression must have "I7" (preserves blues vs pop distinction)
 * 3. If pattern has "I", progression "I7" or "I" both match (flexible)
 * 4. Accidentals (b, #) are preserved
 * 5. Case-sensitive (uppercase = major, lowercase = minor)
 *
 * @example
 * ```typescript
 * matchesPattern("ii7-V7-Imaj7", "ii-V-I") // => true (pattern allows any extensions)
 * matchesPattern("I7-IV7-I7-V7", "I7-IV7-I7-V7") // => true (exact match with 7ths)
 * matchesPattern("I-IV-I-V", "I7-IV7-I7-V7") // => false (pattern requires 7ths)
 * ```
 */
function matchesPattern(progressionRoman: string, patternRoman: string): boolean {
  // Normalize accidentals (♭→b, ♯→#) for both strings
  const normalizeAccidentals = (roman: string): string => {
    return roman.replace(/♭/g, 'b').replace(/♯/g, '#').trim()
  }

  const progression = normalizeAccidentals(progressionRoman)
  const pattern = normalizeAccidentals(patternRoman)

  // Split into tokens for comparison
  const progTokens = progression.split('-')
  const patternTokens = pattern.split('-')

  // Helper: strip extensions from a progression token only if pattern token doesn't have them
  const normalizeToken = (progToken: string, patternToken: string): string => {
    const extensions = ['maj7', 'add9', 'sus4', 'sus2', '13', '11', '9', '7', '6']
    let normalized = progToken

    for (const ext of extensions) {
      // Only strip this extension if the pattern token doesn't contain it
      if (!patternToken.includes(ext)) {
        normalized = normalized.replace(new RegExp(`${ext}$`), '')
      }
    }

    return normalized
  }

  // Helper: check if pattern sequence matches progression at given offset
  const matchesAtOffset = (offset: number): boolean => {
    if (offset + patternTokens.length > progTokens.length) {
      return false
    }

    for (let i = 0; i < patternTokens.length; i++) {
      const progToken = progTokens[offset + i]
      const patToken = patternTokens[i]
      // Length check above guarantees these indices are valid
      if (!progToken || !patToken) {
        return false
      }
      const normalizedProg = normalizeToken(progToken, patToken)

      if (normalizedProg !== patToken) {
        return false
      }
    }

    return true
  }

  // Try matching pattern at every position in progression (substring match)
  for (let offset = 0; offset <= progTokens.length - patternTokens.length; offset++) {
    if (matchesAtOffset(offset)) {
      return true
    }
  }

  return false
}
