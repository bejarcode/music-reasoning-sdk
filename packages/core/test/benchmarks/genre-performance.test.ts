/**
 * Genre Pattern Detection Performance Benchmarks
 *
 * Validates that genre pattern matching meets the <10ms p95 performance requirement
 * for pattern detection across the full 50+ pattern database.
 *
 * Target: p95 < 10ms for all genre detection operations
 *
 * NOTE: These tests run 10,000 iterations each and can take 30+ seconds.
 * Set RUN_PERF_TESTS=1 to enable: `RUN_PERF_TESTS=1 pnpm test:benchmarks`
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import { describe, test, expect } from 'vitest'
import { detectGenre } from '../../src/genre/detect'
import { runBenchmark, assertPerformance, formatBenchmarkResult } from './benchmark-utils'

// Gate performance tests behind environment variable
// Only run when RUN_PERF_TESTS is explicitly set to '1' or 'true'
const perfFlag = (process.env.RUN_PERF_TESTS ?? '').toLowerCase()
const describePerf = perfFlag === '1' || perfFlag === 'true' ? describe : describe.skip

describePerf('Genre Pattern Detection Performance', () => {
  const TARGET_P95_MS = 10

  describe('Jazz Pattern Detection', () => {
    test('detects ii-V-I within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['Dm7', 'G7', 'Cmaj7'])
      }, 10000)

      console.log('Jazz ii-V-I Pattern Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('detects extended turnaround within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['Em7', 'A7', 'Dm7', 'G7'])
      }, 10000)

      console.log('Jazz Extended Turnaround Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Pop Pattern Detection', () => {
    test('detects I-V-vi-IV within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['C', 'G', 'Am', 'F'])
      }, 10000)

      console.log('Pop I-V-vi-IV Pattern Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('detects doo-wop progression within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['C', 'Am', 'F', 'G'])
      }, 10000)

      console.log('Pop Doo-Wop Pattern Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Classical Pattern Detection', () => {
    test('detects I-IV-V-I within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['C', 'F', 'G', 'C'])
      }, 10000)

      console.log('Classical I-IV-V-I Pattern Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('detects circle of fifths within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['Am', 'Dm', 'G', 'C'])
      }, 10000)

      console.log('Classical Circle of Fifths Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Rock Pattern Detection', () => {
    test('detects I-bVII-IV within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['C', 'Bb', 'F'])
      }, 10000)

      console.log('Rock I-bVII-IV Pattern Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('detects minor rock progression within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['Am', 'G', 'F', 'G'])
      }, 10000)

      console.log('Rock Minor Progression Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('EDM Pattern Detection', () => {
    test('detects i-VII-VI-V within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['Am', 'G', 'F', 'E'])
      }, 10000)

      console.log('EDM i-VII-VI-V Pattern Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('detects progressive house within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['Am', 'F', 'C', 'G'])
      }, 10000)

      console.log('EDM Progressive House Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Blues Pattern Detection', () => {
    test('detects 12-bar blues within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['C', 'F', 'C', 'G'])
      }, 10000)

      console.log('Blues 12-bar Pattern Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('detects full 12-bar progression within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'G', 'F', 'C', 'G'])
      }, 10000)

      console.log('Blues Full 12-bar Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Ambiguous Pattern Detection', () => {
    test('handles ambiguous I-IV-V within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['C', 'F', 'G'])
      }, 10000)

      console.log('Ambiguous I-IV-V Pattern Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('handles unknown progression within 10ms p95', () => {
      const result = runBenchmark(() => {
        detectGenre(['X', 'Y', 'Z'])
      }, 10000)

      console.log('Unknown Progression Detection:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Full Database Stress Test', () => {
    test('scans all 50+ patterns within 10ms p95', () => {
      // Test against full database scan with varied progressions
      const progressions = [
        ['Dm7', 'G7', 'Cmaj7'], // Jazz
        ['C', 'G', 'Am', 'F'], // Pop
        ['C', 'F', 'G', 'C'], // Classical
        ['C', 'Bb', 'F'], // Rock
        ['Am', 'G', 'F', 'E'], // EDM
        ['C', 'F', 'C', 'G'], // Blues
      ]

      const result = runBenchmark(() => {
        const index = Math.floor(Math.random() * progressions.length)
        detectGenre(progressions[index]!)
      }, 10000)

      console.log('Full Database Stress Test:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  /**
   * Adaptive Windowing Performance Tests (FR-007)
   *
   * These tests validate that adaptive windowing activates for progressions > 16 chords
   * and maintains performance requirements (<50ms p95 for detection).
   *
   * Test Strategy (TDD - Red-Green-Refactor):
   * 1. Write tests first (T004a - this section)
   * 2. Tests SKIP until T005 implements windowing
   * 3. Remove test.skip() after T005 implementation
   *
   * Performance Targets (from spec clarification 2025-10-13):
   * - 20-chord progression: <50ms p95 (windowing activated)
   * - 24-chord progression: <50ms p95 (3 windows: 12-chord, 6-overlap)
   * - 30-chord progression: <80ms p95 (stress test, 4 windows)
   */
  describe('Adaptive Windowing Performance (FR-007)', () => {
    const WINDOWING_THRESHOLD_MS = 50 // FR-007 requirement for windowed progressions

    test.skip('20-chord progression with windowing <50ms p95 (TODO: T005)', () => {
      // Create 20-chord progression (mix of patterns to stress-test windowing)
      const longProgression = [
        'C',
        'Am',
        'F',
        'G', // Pop pattern (I-vi-IV-V)
        'Dm7',
        'G7',
        'Cmaj7',
        'Am7', // Jazz pattern (ii-V-I-vi)
        'C',
        'F',
        'G',
        'C', // Classical pattern (I-IV-V-I)
        'C',
        'Bb',
        'F',
        'G', // Rock pattern (I-bVII-IV-V)
        'Am',
        'G',
        'F',
        'E', // EDM pattern (i-VII-VI-V)
      ]

      expect(longProgression.length).toBe(20)

      const result = runBenchmark(() => {
        detectGenre(longProgression)
      }, 1000) // Reduced iterations for long progressions

      console.log('20-Chord Windowing Performance:')
      console.log(formatBenchmarkResult(result))

      // Verify windowing is activated (>16 chords)
      const detectionResult = detectGenre(longProgression)
      expect(detectionResult.length).toBeGreaterThan(0)
      // TODO (T005): Add usedWindowing flag to result metadata

      assertPerformance(result, WINDOWING_THRESHOLD_MS)
      expect(result.p95).toBeLessThan(WINDOWING_THRESHOLD_MS)
    })

    test.skip('24-chord progression with windowing <50ms p95 (TODO: T005)', () => {
      // Create 24-chord progression (should create 3 windows: 12-chord, 6-overlap)
      const longProgression = [
        // Window 1 (chords 0-11): Jazz + Pop patterns
        'Dm7',
        'G7',
        'Cmaj7',
        'Am7', // Jazz turnaround
        'C',
        'G',
        'Am',
        'F', // Pop axis
        'C',
        'F',
        'G',
        'C', // Classical cadence

        // Overlap (chords 6-11, shared with window 1)

        // Window 2 (chords 6-17): Classical + Rock patterns
        'C',
        'F',
        'G',
        'C', // (overlap from window 1)
        'C',
        'Bb',
        'F',
        'G', // Rock progression
        'Am',
        'Dm',
        'G',
        'C', // Circle of fifths

        // Overlap (chords 12-17, shared with window 2)

        // Window 3 (chords 12-23): Rock + EDM patterns
        'Am',
        'Dm',
        'G',
        'C', // (overlap from window 2)
        'Am',
        'G',
        'F',
        'E', // EDM build
        'C',
        'F',
        'C',
        'G', // Blues progression
      ]

      expect(longProgression.length).toBe(24)

      const result = runBenchmark(() => {
        detectGenre(longProgression)
      }, 1000)

      console.log('24-Chord Windowing Performance (3 windows):')
      console.log(formatBenchmarkResult(result))

      // Verify windowing creates correct number of windows
      const detectionResult = detectGenre(longProgression)
      expect(detectionResult.length).toBeGreaterThan(0)
      // TODO (T005): Verify usedWindowing === true, windowCount === 3

      assertPerformance(result, WINDOWING_THRESHOLD_MS)
      expect(result.p95).toBeLessThan(WINDOWING_THRESHOLD_MS)
    })

    test.skip('30-chord progression with windowing <80ms p95 (TODO: T005)', () => {
      // Create 30-chord progression (stress test: 4 windows)
      const longProgression = [
        // Window 1 (chords 0-11)
        'Dm7',
        'G7',
        'Cmaj7',
        'Am7',
        'C',
        'G',
        'Am',
        'F',
        'C',
        'F',
        'G',
        'C',

        // Window 2 (chords 6-17)
        'C',
        'F',
        'G',
        'C', // overlap
        'C',
        'Bb',
        'F',
        'G',
        'Am',
        'Dm',
        'G',
        'C',

        // Window 3 (chords 12-23)
        'Am',
        'Dm',
        'G',
        'C', // overlap
        'Am',
        'G',
        'F',
        'E',
        'C',
        'F',
        'C',
        'G',

        // Window 4 (chords 18-29)
        'C',
        'F',
        'C',
        'G', // overlap
        'C7',
        'F7',
        'C7',
        'G7',
        'Em7',
        'A7',
        'Dm7',
        'G7',
      ]

      expect(longProgression.length).toBe(30)

      const result = runBenchmark(() => {
        detectGenre(longProgression)
      }, 1000)

      console.log('30-Chord Windowing Performance (4 windows):')
      console.log(formatBenchmarkResult(result))

      // Stress test allows slightly higher threshold (80ms vs 50ms)
      const STRESS_TEST_THRESHOLD_MS = 80

      // Verify windowing creates 4 windows
      const detectionResult = detectGenre(longProgression)
      expect(detectionResult.length).toBeGreaterThan(0)
      // TODO (T005): Verify usedWindowing === true, windowCount === 4

      assertPerformance(result, STRESS_TEST_THRESHOLD_MS)
      expect(result.p95).toBeLessThan(STRESS_TEST_THRESHOLD_MS)
    })
  })
})
