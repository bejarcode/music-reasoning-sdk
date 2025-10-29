/**
 * Performance Benchmarks for Scale Generation
 *
 * Tests performance characteristics of the scale generation engine.
 * Ensures p95 latency < 50ms for all scale operations.
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import { describe, test, expect } from 'vitest'
import { getScale } from '../../src/scale'

/**
 * Performance test helper - runs a function multiple times and measures p95 latency
 */
function benchmarkP95(
  fn: () => void,
  iterations: number = 1000
): { p95: number; median: number; mean: number } {
  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    const end = performance.now()
    times.push(end - start)
  }

  // Sort times for percentile calculations
  times.sort((a, b) => a - b)

  const p95Index = Math.floor(iterations * 0.95)
  const medianIndex = Math.floor(iterations * 0.5)
  const mean = times.reduce((sum, t) => sum + t, 0) / iterations

  return {
    p95: times[p95Index],
    median: times[medianIndex],
    mean,
  }
}

/**
 * Assertion helper for performance benchmarks
 */
function expectP95LessThan(fn: () => void, maxMs: number, iterations: number = 1000): void {
  const metrics = benchmarkP95(fn, iterations)

  expect(metrics.p95).toBeLessThan(maxMs)

  // Log metrics for visibility
  console.log(
    `  📊 p95: ${metrics.p95.toFixed(2)}ms | median: ${metrics.median.toFixed(2)}ms | mean: ${metrics.mean.toFixed(2)}ms`
  )
}

// ============================================================================
// Performance Benchmarks - Scale Generation
// ============================================================================

describe('Scale Generation Performance', () => {
  const ITERATIONS = 1000
  const MAX_P95_MS = 50 // Target: <50ms p95 latency

  // --------------------------------------------------------------------------
  // Major Scales
  // --------------------------------------------------------------------------

  describe('Major Scales', () => {
    test('C major generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('C', 'major'), MAX_P95_MS, ITERATIONS)
    })

    test('F# major generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('F#', 'major'), MAX_P95_MS, ITERATIONS)
    })

    test('Db major generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('Db', 'major'), MAX_P95_MS, ITERATIONS)
    })
  })

  // --------------------------------------------------------------------------
  // Minor Scales
  // --------------------------------------------------------------------------

  describe('Minor Scales', () => {
    test('A natural minor generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('A', 'minor'), MAX_P95_MS, ITERATIONS)
    })

    test('C# natural minor generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('C#', 'minor'), MAX_P95_MS, ITERATIONS)
    })

    test('C harmonic minor generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('C', 'harmonic minor'), MAX_P95_MS, ITERATIONS)
    })

    test('D melodic minor generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('D', 'melodic minor'), MAX_P95_MS, ITERATIONS)
    })
  })

  // --------------------------------------------------------------------------
  // Modal Scales
  // --------------------------------------------------------------------------

  describe('Modal Scales', () => {
    test('D dorian generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('D', 'dorian'), MAX_P95_MS, ITERATIONS)
    })

    test('E phrygian generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('E', 'phrygian'), MAX_P95_MS, ITERATIONS)
    })

    test('F lydian generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('F', 'lydian'), MAX_P95_MS, ITERATIONS)
    })

    test('G mixolydian generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('G', 'mixolydian'), MAX_P95_MS, ITERATIONS)
    })

    test('A aeolian generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('A', 'aeolian'), MAX_P95_MS, ITERATIONS)
    })

    test('B locrian generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('B', 'locrian'), MAX_P95_MS, ITERATIONS)
    })
  })

  // --------------------------------------------------------------------------
  // Pentatonic & Blues Scales
  // --------------------------------------------------------------------------

  describe('Pentatonic & Blues Scales', () => {
    test('C major pentatonic generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('C', 'major pentatonic'), MAX_P95_MS, ITERATIONS)
    })

    test('A minor pentatonic generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('A', 'minor pentatonic'), MAX_P95_MS, ITERATIONS)
    })

    test('E blues generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('E', 'blues'), MAX_P95_MS, ITERATIONS)
    })
  })

  // --------------------------------------------------------------------------
  // Exotic Scales
  // --------------------------------------------------------------------------

  describe('Exotic Scales', () => {
    test('C whole tone generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('C', 'whole tone'), MAX_P95_MS, ITERATIONS)
    })

    test('C diminished generation p95 < 50ms', () => {
      expectP95LessThan(() => getScale('C', 'diminished'), MAX_P95_MS, ITERATIONS)
    })
  })

  // --------------------------------------------------------------------------
  // Mixed Workload (Realistic Usage Pattern)
  // --------------------------------------------------------------------------

  describe('Mixed Workload', () => {
    test('alternating scale types p95 < 50ms', () => {
      const scales = [
        { root: 'C', type: 'major' },
        { root: 'A', type: 'minor' },
        { root: 'D', type: 'dorian' },
        { root: 'E', type: 'phrygian' },
        { root: 'F#', type: 'major' },
        { root: 'C', type: 'harmonic minor' },
        { root: 'G', type: 'mixolydian' },
        { root: 'Bb', type: 'major' },
      ]

      let index = 0
      expectP95LessThan(
        () => {
          const scale = scales[index % scales.length]
          getScale(scale.root, scale.type)
          index++
        },
        MAX_P95_MS,
        ITERATIONS
      )
    })

    test('all 12 chromatic roots (major) p95 < 50ms', () => {
      const roots = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

      let index = 0
      expectP95LessThan(
        () => {
          const root = roots[index % roots.length]
          getScale(root, 'major')
          index++
        },
        MAX_P95_MS,
        ITERATIONS
      )
    })
  })

  // --------------------------------------------------------------------------
  // Full ScaleInfo Object Access (Worst Case)
  // --------------------------------------------------------------------------

  describe('Full ScaleInfo Object Access', () => {
    test('accessing all ScaleInfo properties p95 < 50ms', () => {
      expectP95LessThan(
        () => {
          const result = getScale('C', 'major')

          // Access all properties to ensure no lazy evaluation penalties
          const _scale = result.scale
          const _root = result.root
          const _type = result.type
          const _notes = result.notes
          const _intervals = result.intervals
          const _degrees = result.degrees
          const _formula = result.formula
          const _relativeMinor = result.relativeMinor
          const _parallelMinor = result.parallelMinor
          const _modes = result.modes

          // Iterate over arrays to ensure materialization
          result.notes.forEach((n) => n)
          result.intervals.forEach((i) => i)
          result.degrees.forEach((d) => {
            const _note = d.note
            const _degree = d.degree
            const _name = d.name
          })
          result.modes.forEach((m) => m)
        },
        MAX_P95_MS,
        ITERATIONS
      )
    })
  })

  // --------------------------------------------------------------------------
  // Error Handling Performance
  // --------------------------------------------------------------------------

  describe('Error Handling Performance', () => {
    test('invalid root note error p95 < 50ms', () => {
      expectP95LessThan(
        () => {
          try {
            getScale('X', 'major')
          } catch (error) {
            // Expected error
          }
        },
        MAX_P95_MS,
        ITERATIONS
      )
    })

    test('invalid scale type error p95 < 50ms', () => {
      expectP95LessThan(
        () => {
          try {
            getScale('C', 'invalid-scale-type')
          } catch (error) {
            // Expected error
          }
        },
        MAX_P95_MS,
        ITERATIONS
      )
    })
  })
})
