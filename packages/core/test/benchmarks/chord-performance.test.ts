/**
 * Chord Identification Performance Benchmarks
 *
 * Validates that chord identification meets the <50ms p95 performance requirement
 * for deterministic music theory operations.
 *
 * Target: p95 < 50ms for all chord identification operations
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import { describe, test, expect } from 'vitest'
import { identifyChord } from '../../src/chord/identify'
import { runBenchmark, assertPerformance, formatBenchmarkResult } from './benchmark-utils'

describe('Chord Identification Performance', () => {
  const TARGET_P95_MS = 50

  describe('Basic Triads (3 notes)', () => {
    test('identifies major triad within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'G'])
      }, 1000)

      console.log('Major Triad Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies minor triad within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['A', 'C', 'E'])
      }, 1000)

      console.log('Minor Triad Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies diminished triad within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['B', 'D', 'F'])
      }, 1000)

      console.log('Diminished Triad Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies augmented triad within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'G#'])
      }, 1000)

      console.log('Augmented Triad Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Seventh Chords (4 notes)', () => {
    test('identifies dominant 7th within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['G', 'B', 'D', 'F'])
      }, 1000)

      console.log('Dominant 7th Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies major 7th within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'G', 'B'])
      }, 1000)

      console.log('Major 7th Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies minor 7th within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['D', 'F', 'A', 'C'])
      }, 1000)

      console.log('Minor 7th Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies half-diminished 7th within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['B', 'D', 'F', 'A'])
      }, 1000)

      console.log('Half-Diminished 7th Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies diminished 7th within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['G#', 'B', 'D', 'F'])
      }, 1000)

      console.log('Diminished 7th Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Extended Chords (5+ notes)', () => {
    test('identifies 9th chord within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'G', 'Bb', 'D'])
      }, 1000)

      console.log('9th Chord Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies 11th chord within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'G', 'Bb', 'D', 'F'])
      }, 1000)

      console.log('11th Chord Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies 13th chord within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'G', 'Bb', 'D', 'F', 'A'])
      }, 1000)

      console.log('13th Chord Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Enharmonic Equivalents', () => {
    test('identifies C# major (enharmonic) within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C#', 'E#', 'G#'])
      }, 1000)

      console.log('C# Major (Enharmonic) Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies Db major (enharmonic) within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['Db', 'F', 'Ab'])
      }, 1000)

      console.log('Db Major (Enharmonic) Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Inversions', () => {
    test('identifies 1st inversion triad within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['E', 'G', 'C']) // C major, 1st inversion
      }, 1000)

      console.log('1st Inversion Triad Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies 2nd inversion triad within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['G', 'C', 'E']) // C major, 2nd inversion
      }, 1000)

      console.log('2nd Inversion Triad Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies 3rd inversion 7th chord within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['F', 'G', 'B', 'D']) // G7, 3rd inversion
      }, 1000)

      console.log('3rd Inversion 7th Chord Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Incomplete Chords', () => {
    test('identifies power chord (2 notes) within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'G'])
      }, 1000)

      console.log('Power Chord (2 notes) Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('identifies chord missing 5th within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'Bb']) // C7 no 5
      }, 1000)

      console.log('Chord Missing 5th Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Edge Cases', () => {
    test('handles notes with octaves within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C4', 'E4', 'G4'])
      }, 1000)

      console.log('Notes with Octaves Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('handles doubled notes within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'G', 'C5'])
      }, 1000)

      console.log('Doubled Notes Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })

    test('handles mixed octave notations within 50ms p95', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E4', 'G'])
      }, 1000)

      console.log('Mixed Octave Notations Performance:')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })

  describe('Stress Tests', () => {
    test('handles complex chord progressions (batch) within 50ms p95', () => {
      const progressions = [
        ['C', 'E', 'G'],
        ['F', 'A', 'C'],
        ['G', 'B', 'D', 'F'],
        ['C', 'E', 'G', 'B'],
        ['A', 'C', 'E', 'G'],
        ['D', 'F#', 'A', 'C'],
        ['G', 'B', 'D'],
        ['C', 'E', 'G'],
      ]

      const result = runBenchmark(() => {
        progressions.forEach((notes) => identifyChord(notes))
      }, 1000)

      console.log('Chord Progression Batch Performance:')
      console.log(formatBenchmarkResult(result))

      // For batch operations, allow slightly higher p95 (50ms per progression)
      assertPerformance(result, TARGET_P95_MS * progressions.length)
      expect(result.p95).toBeLessThan(TARGET_P95_MS * progressions.length)
    })

    test('maintains performance with repeated calls', () => {
      const result = runBenchmark(() => {
        identifyChord(['C', 'E', 'G', 'Bb', 'D', 'F', 'A'])
      }, 5000) // 5x more iterations to test consistency

      console.log('Repeated Calls Performance (5000 iterations):')
      console.log(formatBenchmarkResult(result))

      assertPerformance(result, TARGET_P95_MS)
      expect(result.p95).toBeLessThan(TARGET_P95_MS)
    })
  })
})
