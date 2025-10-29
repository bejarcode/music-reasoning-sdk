/**
 * Test Utilities and Helpers
 *
 * Common utilities for testing music theory operations including:
 * - Performance benchmarking helpers
 * - Test data constants
 * - Custom assertion helpers
 *
 * @packageDocumentation
 * @since v1.0.0
 */

/**
 * Valid chord test data for golden tests.
 *
 * Contains comprehensive examples of chords across all types.
 */
export const TEST_CHORDS = {
  /** Major triads in all 12 keys */
  majorTriads: [
    { notes: ['C', 'E', 'G'], expected: 'C major', root: 'C', quality: 'major' },
    { notes: ['G', 'B', 'D'], expected: 'G major', root: 'G', quality: 'major' },
    { notes: ['D', 'F#', 'A'], expected: 'D major', root: 'D', quality: 'major' },
    { notes: ['A', 'C#', 'E'], expected: 'A major', root: 'A', quality: 'major' },
    { notes: ['E', 'G#', 'B'], expected: 'E major', root: 'E', quality: 'major' },
    { notes: ['B', 'D#', 'F#'], expected: 'B major', root: 'B', quality: 'major' },
    { notes: ['F#', 'A#', 'C#'], expected: 'F# major', root: 'F#', quality: 'major' },
    { notes: ['Db', 'F', 'Ab'], expected: 'Db major', root: 'Db', quality: 'major' },
    { notes: ['Ab', 'C', 'Eb'], expected: 'Ab major', root: 'Ab', quality: 'major' },
    { notes: ['Eb', 'G', 'Bb'], expected: 'Eb major', root: 'Eb', quality: 'major' },
    { notes: ['Bb', 'D', 'F'], expected: 'Bb major', root: 'Bb', quality: 'major' },
    { notes: ['F', 'A', 'C'], expected: 'F major', root: 'F', quality: 'major' },
  ],

  /** Minor triads in all 12 keys */
  minorTriads: [
    { notes: ['A', 'C', 'E'], expected: 'A minor', root: 'A', quality: 'minor' },
    { notes: ['E', 'G', 'B'], expected: 'E minor', root: 'E', quality: 'minor' },
    { notes: ['B', 'D', 'F#'], expected: 'B minor', root: 'B', quality: 'minor' },
    { notes: ['F#', 'A', 'C#'], expected: 'F# minor', root: 'F#', quality: 'minor' },
    { notes: ['C#', 'E', 'G#'], expected: 'C# minor', root: 'C#', quality: 'minor' },
    { notes: ['G#', 'B', 'D#'], expected: 'G# minor', root: 'G#', quality: 'minor' },
    { notes: ['Eb', 'Gb', 'Bb'], expected: 'Eb minor', root: 'Eb', quality: 'minor' },
    { notes: ['Bb', 'Db', 'F'], expected: 'Bb minor', root: 'Bb', quality: 'minor' },
    { notes: ['F', 'Ab', 'C'], expected: 'F minor', root: 'F', quality: 'minor' },
    { notes: ['C', 'Eb', 'G'], expected: 'C minor', root: 'C', quality: 'minor' },
    { notes: ['G', 'Bb', 'D'], expected: 'G minor', root: 'G', quality: 'minor' },
    { notes: ['D', 'F', 'A'], expected: 'D minor', root: 'D', quality: 'minor' },
  ],

  /** Dominant 7th chords (illustrative sample - not all 12 keys) */
  dominant7ths: [
    { notes: ['C', 'E', 'G', 'Bb'], expected: 'C7', root: 'C', quality: 'dominant 7th' },
    { notes: ['G', 'B', 'D', 'F'], expected: 'G7', root: 'G', quality: 'dominant 7th' },
    { notes: ['D', 'F#', 'A', 'C'], expected: 'D7', root: 'D', quality: 'dominant 7th' },
  ],
} as const

/**
 * Valid scale test data for golden tests.
 */
export const TEST_SCALES = {
  /** C major scale */
  cMajor: {
    root: 'C',
    type: 'major',
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    formula: 'W-W-H-W-W-W-H',
  },

  /** A natural minor scale */
  aMinor: {
    root: 'A',
    type: 'minor',
    notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    formula: 'W-H-W-W-H-W-W',
  },

  /** G major scale */
  gMajor: {
    root: 'G',
    type: 'major',
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    formula: 'W-W-H-W-W-W-H',
  },
} as const

/**
 * Valid progression test data for golden tests.
 */
export const TEST_PROGRESSIONS = {
  /** I-V-vi-IV in C major (Axis progression) */
  axisCMajor: {
    chords: ['C', 'G', 'Am', 'F'],
    expectedKey: 'C major',
    expectedRomanNumerals: ['I', 'V', 'vi', 'IV'],
  },

  /** ii-V-I in C major (jazz turnaround) */
  jazzTurnaround: {
    chords: ['Dm7', 'G7', 'Cmaj7'],
    expectedKey: 'C major',
    expectedRomanNumerals: ['ii7', 'V7', 'Imaj7'],
    expectedPattern: 'ii-V-I',
  },

  /** I-IV-V-I in C major (authentic cadence) */
  authenticCadence: {
    chords: ['C', 'F', 'G', 'C'],
    expectedKey: 'C major',
    expectedRomanNumerals: ['I', 'IV', 'V', 'I'],
  },
} as const

/**
 * Assertion helper for comparing arrays with tolerance for order differences.
 * Uses multiset-style comparison to handle duplicates correctly.
 *
 * @param actual - Actual array
 * @param expected - Expected array
 * @returns true if arrays contain same elements with same frequencies (order doesn't matter)
 *
 * @remarks
 * Previous implementation used .sort() without comparator, which coerces to strings
 * and fails on objects. This version uses a Map to count occurrences (multiset).
 */
export function arrayContainsSameElements<T>(actual: T[], expected: T[]): boolean {
  if (actual.length !== expected.length) return false

  // Build frequency map from expected elements
  const expectedCounts = new Map<T, number>()
  for (const item of expected) {
    expectedCounts.set(item, (expectedCounts.get(item) || 0) + 1)
  }

  // Decrement counts with actual elements
  for (const item of actual) {
    const count = expectedCounts.get(item)
    if (count === undefined || count === 0) {
      return false // Item not in expected or already exhausted
    }
    expectedCounts.set(item, count - 1)
  }

  // All counts should be zero if arrays match
  return Array.from(expectedCounts.values()).every((count) => count === 0)
}

/**
 * Assertion helper for checking if a value is within a numeric range.
 *
 * @param value - Value to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Helper to measure execution time of a function.
 *
 * @param fn - Function to measure
 * @param iterations - Number of iterations to run (default: 1)
 * @returns Execution time statistics (single run returns time, multiple returns p50/p95/p99)
 *
 * @remarks
 * Only measures synchronous work. Async functions will return immediately.
 * Time is recorded even if the function throws (via try/finally).
 *
 * @example
 * ```typescript
 * // Single execution
 * const time = measureExecutionTime(() => {
 *   identifyChord(['C', 'E', 'G'])
 * })
 * expect(time).toBeLessThan(50) // Should be under 50ms
 *
 * // Multiple iterations with percentiles
 * const stats = measureExecutionTime(() => {
 *   identifyChord(['C', 'E', 'G'])
 * }, 1000)
 * expect(stats.p95).toBeLessThan(50)
 * ```
 */
export function measureExecutionTime(
  fn: () => void,
  iterations?: number
): number | { p50: number; p95: number; p99: number } {
  // Guard against invalid iteration counts
  if (iterations !== undefined && iterations < 1) {
    throw new Error('iterations must be a positive integer')
  }

  if (!iterations || iterations === 1) {
    // Single execution - return simple time
    const start = performance.now()
    try {
      fn()
    } finally {
      const end = performance.now()
      return end - start
    }
  }

  // Multiple iterations - return percentile statistics
  const times: number[] = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    try {
      fn()
    } finally {
      const end = performance.now()
      times.push(end - start)
    }
  }

  // Sort times for percentile calculation
  times.sort((a, b) => a - b)

  // Calculate percentiles
  const getPercentile = (arr: number[], p: number): number => {
    const index = Math.ceil((arr.length * p) / 100) - 1
    return arr[index] || 0
  }

  return {
    p50: getPercentile(times, 50),
    p95: getPercentile(times, 95),
    p99: getPercentile(times, 99),
  }
}
