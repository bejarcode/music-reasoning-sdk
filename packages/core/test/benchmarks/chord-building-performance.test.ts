/**
 * Performance Benchmark Suite: Chord Building
 *
 * Validates that chord building operations meet the <50ms p95 requirement
 * mandated by the Constitution for deterministic operations.
 *
 * Performance Targets:
 * - buildChord(): <50ms p95
 * - generateVoicing(): <50ms p95
 * - getSubstitutions(): <50ms p95
 *
 * @group benchmarks
 * @group performance
 */

import { describe, test, expect } from 'vitest'
import { buildChord, generateVoicing, getSubstitutions } from '../../src/chord/build'
import { measureExecutionTime } from '../utils/test-helpers'

// Performance test gating - only run if explicitly enabled
const perfFlag = (process.env.RUN_PERF_TESTS ?? '').toLowerCase()
const describePerf = perfFlag === '1' || perfFlag === 'true' ? describe : describe.skip

describePerf('Chord Building Performance', () => {
  const ITERATIONS = 1000
  const P95_THRESHOLD_MS = 50 // Constitution mandate

  describe('buildChord() performance', () => {
    test('builds simple triads within threshold', () => {
      const symbols = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          buildChord(symbol)
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(`${symbols[i]}: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`)
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('builds seventh chords within threshold', () => {
      const symbols = ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          buildChord(symbol)
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(`${symbols[i]}: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`)
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('builds extended chords within threshold', () => {
      const symbols = ['Cmaj9', 'G9', 'Dm11', 'Cmaj13']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          buildChord(symbol)
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(`${symbols[i]}: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`)
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('builds altered chords within threshold', () => {
      const symbols = ['G7#5', 'C7b9', 'F#m7b5', 'Dbaug']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          buildChord(symbol)
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(`${symbols[i]}: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`)
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })
  })

  describe('generateVoicing() performance', () => {
    test('generates close voicings within threshold', () => {
      const symbols = ['C', 'Dm7', 'Gmaj7', 'F#m7b5']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          generateVoicing(symbol, { type: 'close', octave: 4 })
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(
          `${symbols[i]} close: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
        )
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('generates open voicings within threshold', () => {
      const symbols = ['C', 'Gmaj7', 'Am7']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          generateVoicing(symbol, { type: 'open', octave: 4 })
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(
          `${symbols[i]} open: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
        )
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('generates drop-2 voicings within threshold', () => {
      const symbols = ['Cmaj7', 'Dm7', 'G7', 'Am7']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          generateVoicing(symbol, { type: 'drop2', octave: 4 })
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(
          `${symbols[i]} drop2: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
        )
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('generates drop-3 voicings within threshold', () => {
      const symbols = ['Cmaj7', 'Fmaj7', 'Bbmaj7']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          generateVoicing(symbol, { type: 'drop3', octave: 4 })
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(
          `${symbols[i]} drop3: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
        )
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('handles inversions within threshold', () => {
      const result = measureExecutionTime(() => {
        generateVoicing('Cmaj7', { type: 'close', octave: 4, inversion: 1 })
      }, ITERATIONS)

      console.log(
        `Cmaj7 1st inversion: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
      )
      expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
    })
  })

  describe('getSubstitutions() performance', () => {
    test('finds substitutions for major 7th chords within threshold', () => {
      const symbols = ['Cmaj7', 'Dmaj7', 'Fmaj7', 'Gmaj7']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          getSubstitutions(symbol)
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(
          `${symbols[i]} subs: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
        )
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('finds substitutions for dominant 7th chords within threshold', () => {
      const symbols = ['G7', 'D7', 'C7', 'F7']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          getSubstitutions(symbol)
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(
          `${symbols[i]} subs: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
        )
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })

    test('finds substitutions for minor 7th chords within threshold', () => {
      const symbols = ['Dm7', 'Em7', 'Am7']

      const results = symbols.map((symbol) => {
        return measureExecutionTime(() => {
          getSubstitutions(symbol)
        }, ITERATIONS)
      })

      results.forEach((result, i) => {
        console.log(
          `${symbols[i]} subs: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
        )
        expect(result.p95).toBeLessThan(P95_THRESHOLD_MS)
      })
    })
  })

  describe('Stress Testing', () => {
    test('handles rapid sequential builds within threshold', () => {
      const symbols = [
        'C',
        'Dm',
        'Em',
        'F',
        'G',
        'Am',
        'Bdim',
        'Cmaj7',
        'Dm7',
        'Em7',
        'Fmaj7',
        'G7',
        'Am7',
        'Bm7b5',
      ]

      const result = measureExecutionTime(() => {
        symbols.forEach((symbol) => buildChord(symbol))
      }, 100) // 100 iterations of building 14 chords = 1400 builds

      console.log(
        `Sequential builds: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
      )
      // Each iteration builds 14 chords, so we're more lenient here
      expect(result.p95).toBeLessThan(P95_THRESHOLD_MS * 2)
    })

    test('handles complex chord with multiple operations within threshold', () => {
      const result = measureExecutionTime(() => {
        buildChord('Cmaj13')
        generateVoicing('Cmaj13', { type: 'drop2', octave: 4 })
        getSubstitutions('Cmaj13')
      }, ITERATIONS)

      console.log(
        `Complex operations: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms`
      )
      // Multiple operations, so allow some overhead
      expect(result.p95).toBeLessThan(P95_THRESHOLD_MS * 2)
    })
  })
})

/**
 * Performance Summary:
 * - buildChord() tests: 4 test groups (triads, 7ths, extended, altered)
 * - generateVoicing() tests: 5 test groups (close, open, drop2, drop3, inversions)
 * - getSubstitutions() tests: 3 test groups (maj7, dom7, min7)
 * - Stress tests: 2 tests (sequential, complex)
 *
 * Total: 14 performance benchmarks
 * All operations must meet <50ms p95 threshold (Constitution mandate)
 */
