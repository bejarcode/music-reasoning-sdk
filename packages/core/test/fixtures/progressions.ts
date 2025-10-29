/**
 * Test Fixtures: Common Chord Progressions
 *
 * Shared test data for golden and integration tests to maintain DRY principles.
 * These progressions represent canonical patterns across different genres.
 *
 * @packageDocumentation
 * @since v2.0.0
 */

/**
 * Common chord progressions used across test suites
 *
 * Each progression is a canonical example of a specific genre pattern,
 * used for consistent testing of genre detection accuracy.
 */
export const TEST_PROGRESSIONS = {
  /**
   * Jazz: ii-V-I turnaround (bebop/modern jazz standard)
   * Expected: jazz genre with high confidence (≥0.80)
   */
  jazzTurnaround: ['Dm7', 'G7', 'Cmaj7'] as const,

  /**
   * Pop: I-V-vi-IV axis progression (modern pop standard)
   * Expected: pop genre with high confidence (≥0.80)
   */
  popAxis: ['C', 'G', 'Am', 'F'] as const,

  /**
   * Pop: I-vi-IV-V doo-wop progression (1950s-60s pop)
   * Expected: pop genre with moderate-high confidence (≥0.75)
   */
  popDooWop: ['C', 'Am', 'F', 'G'] as const,

  /**
   * Classical: I-IV-V-I authentic cadence (baroque/classical)
   * Expected: classical genre with high confidence (≥0.80)
   */
  classicalCadence: ['C', 'F', 'G', 'C'] as const,

  /**
   * Rock: I-♭VII-IV modal borrowing (rock/classic rock)
   * Expected: rock genre with high confidence (≥0.80)
   * Note: May detect as F major (V-IV-I) due to key detection heuristics
   */
  rockModalBorrowing: ['C', 'Bb', 'F'] as const,

  /**
   * Blues: 12-bar blues form (I-I-I-I-IV-IV-I-I-V-IV-I-V)
   * Expected: blues genre with moderate-high confidence (≥0.75)
   */
  blues12Bar: ['C7', 'C7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'G7'] as const,

  /**
   * EDM: i-VII-VI-VII tension progression (minor key EDM)
   * Expected: EDM or rock genre with moderate-low confidence (≥0.65)
   */
  edmTension: ['Am', 'G', 'F', 'G'] as const,

  /**
   * Cross-genre: I-IV-V simple progression (pop/classical/rock/blues)
   * Expected: multiple genres with high confidence (0.90 for pop/rock)
   */
  crossGenre: ['C', 'F', 'G'] as const,

  /**
   * Ambiguous: Shared by multiple genres (pop/rock)
   * Expected: multiple genres with moderate confidence (0.40-0.70)
   * Note: May return single genre with high confidence if strong match
   */
  ambiguousPopRock: ['Am', 'F', 'C', 'G'] as const,

  /**
   * Edge case: Empty progression
   * Expected: 'unknown' genre with zero confidence
   */
  empty: [] as const,

  /**
   * Edge case: Single chord (insufficient for pattern matching)
   * Expected: 'unknown' genre with zero confidence
   */
  singleChord: ['C'] as const,

  /**
   * Edge case: Two chords (minimal for pattern matching)
   * Expected: low-moderate confidence or 'unknown'
   */
  twoChords: ['F', 'C'] as const,

  /**
   * Edge case: Invalid chord symbol
   * Expected: 'unknown' genre with zero confidence
   */
  invalid: ['InvalidChord'] as const,

  /**
   * Edge case: Chromatic progression (non-diatonic)
   * Expected: low confidence or 'unknown'
   */
  chromatic: ['C', 'Db', 'D', 'Eb', 'E', 'F'] as const,

  /**
   * Edge case: Mixed valid/invalid chords
   * Expected: attempts pattern matching, may return 'unknown'
   */
  mixedValidInvalid: ['C', 'InvalidChord', 'G'] as const,

  /**
   * Ambiguous minor: Could be multiple genres (blues/jazz/rock)
   * Expected: moderate confidence (0.40-0.70)
   */
  ambiguousMinor: ['Am', 'Dm', 'E7', 'Am'] as const,

  /**
   * Edge case: Long progression (30 chords, triggers windowing)
   * Expected: genre detection with adaptive windowing (>16 chords)
   */
  longProgression: [
    'C',
    'Am',
    'F',
    'G',
    'C',
    'Am',
    'F',
    'G',
    'Dm7',
    'G7',
    'Cmaj7',
    'Am7',
    'Dm7',
    'G7',
    'Cmaj7',
    'Am7',
    'C',
    'F',
    'G',
    'C',
    'C',
    'F',
    'G',
    'C',
    'C',
    'Bb',
    'F',
    'G',
    'C',
    'Bb',
  ] as const,
} as const

/**
 * Expected genre results for test assertions
 *
 * Maps progressions to their expected detection results, including
 * primary genre, confidence ranges, and notable patterns.
 */
export const EXPECTED_RESULTS = {
  jazzTurnaround: {
    genre: 'jazz' as const,
    minConfidence: 0.8,
    patterns: ['ii-V-I'],
  },
  popAxis: {
    genre: 'pop' as const,
    minConfidence: 0.8,
    patterns: ['I-V-vi-IV'],
  },
  popDooWop: {
    genre: 'pop' as const,
    minConfidence: 0.75,
    patterns: ['I-vi-IV-V'],
  },
  classicalCadence: {
    genre: 'classical' as const,
    minConfidence: 0.8,
    patterns: ['I-IV-V-I'],
  },
  blues12Bar: {
    genre: 'blues' as const,
    minConfidence: 0.75,
    patterns: ['I-I-I-I-IV-IV-I-I-V-IV-I-V'],
  },
} as const
