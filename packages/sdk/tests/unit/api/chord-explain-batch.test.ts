/**
 * Unit tests for explainBatch() edge cases and input validation
 * Complements integration tests (T058-T060) with comprehensive edge case coverage
 *
 * @remarks
 * These tests focus on:
 * - Input validation (null, undefined, empty, invalid types)
 * - Edge cases (single chord, very large batches)
 * - Error handling consistency with explain()
 * - Graceful degradation principle
 *
 * Integration tests validate performance and caching (see batch-processing.integration.test.ts)
 */

import { describe, test, expect } from 'vitest'
import { explainBatch } from '../../../src/api/chord-explain'

describe('explainBatch() - Input Validation & Edge Cases', () => {
  /**
   * Test Group 1: Null/Undefined Input Validation
   * Validates graceful degradation principle (no exceptions thrown)
   */
  describe('Null/Undefined Input Handling', () => {
    test('rejects null input gracefully (no exception thrown)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await explainBatch(null as any)

      expect(results).toHaveLength(1)
      expect(results[0].error).toBeDefined()
      expect(results[0].error?.code).toBe('INVALID_INPUT')
      expect(results[0].error?.message).toContain('non-null array')
      expect(results[0].data.chord).toBe('Invalid') // Sentinel value
    })

    test('rejects undefined input gracefully (no exception thrown)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await explainBatch(undefined as any)

      expect(results).toHaveLength(1)
      expect(results[0].error).toBeDefined()
      expect(results[0].error?.code).toBe('INVALID_INPUT')
      expect(results[0].error?.message).toContain('non-null array')
      expect(results[0].data.chord).toBe('Invalid')
    })

    test('error includes actionable suggestion for null input', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await explainBatch(null as any)

      expect(results[0].error?.suggestion).toBeDefined()
      expect(results[0].error?.suggestion).toContain('[["C","E","G"]')
    })
  })

  /**
   * Test Group 2: Invalid Type Input Validation
   * Validates type safety and error messages
   */
  describe('Invalid Type Input Handling', () => {
    test('rejects non-array input (string)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await explainBatch('invalid' as any)

      expect(results).toHaveLength(1)
      expect(results[0].error).toBeDefined()
      expect(results[0].error?.code).toBe('INVALID_INPUT')
      expect(results[0].error?.message).toContain('non-null array')
    })

    test('rejects non-array input (number)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await explainBatch(123 as any)

      expect(results).toHaveLength(1)
      expect(results[0].error?.code).toBe('INVALID_INPUT')
    })

    test('rejects non-array input (object)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await explainBatch({ notes: ['C', 'E', 'G'] } as any)

      expect(results).toHaveLength(1)
      expect(results[0].error?.code).toBe('INVALID_INPUT')
    })
  })

  /**
   * Test Group 3: Empty Array Handling
   * Validates that empty array is valid (no work to do)
   */
  describe('Empty Array Handling', () => {
    test('handles empty array gracefully (returns empty array)', async () => {
      const results = await explainBatch([])

      expect(results).toHaveLength(0)
      expect(results).toEqual([])
    })

    test('empty array does not trigger AI model loading', async () => {
      // This should complete instantly (<1ms) without model initialization
      const startTime = Date.now()
      const results = await explainBatch([])
      const elapsedMs = Date.now() - startTime

      expect(results).toHaveLength(0)
      expect(elapsedMs).toBeLessThan(100) // Should be near-instant
    })
  })

  /**
   * Test Group 4: Single Chord Batch (Degenerate Case)
   * Validates that single-element batches work correctly
   */
  describe('Single Chord Batch (Degenerate Case)', () => {
    test('handles single valid chord correctly', async () => {
      const results = await explainBatch([['C', 'E', 'G']], { timeout: 1 })

      expect(results).toHaveLength(1)
      expect(results[0].data).toBeDefined()
      expect(results[0].data.root).toBe('C')
      expect(results[0].data.quality).toBe('major')
      expect(results[0].data.chord).toContain('C')
    }) // Fast: deterministic data only (no AI)

    test('handles single invalid chord correctly', async () => {
      const results = await explainBatch([['X', 'Y', 'Z']])

      expect(results).toHaveLength(1)
      expect(results[0].error).toBeDefined()
      expect(results[0].error?.code).toBe('INVALID_INPUT')
      expect(results[0].data.chord).toBe('Invalid')
    })

    test('single chord batch provides deterministic data', async () => {
      const results = await explainBatch([['D', 'F#', 'A']], { timeout: 1 })

      expect(results[0].data.root).toBe('D')
      expect(results[0].data.intervals).toContain('P1')
      expect(results[0].data.intervals).toContain('M3')
      expect(results[0].data.intervals).toContain('P5')
    })
  })

  /**
   * Test Group 5: Mixed Valid/Invalid Elements
   * Validates partial success pattern (explainBatch delegates to explain())
   */
  describe('Mixed Valid/Invalid Elements', () => {
    test('handles mix of valid and invalid chords (partial success)', async () => {
      const results = await explainBatch(
        [
          ['C', 'E', 'G'], // Valid
          null as any, // Invalid (null element)
          ['D', 'F#', 'A'], // Valid
          undefined as any, // Invalid (undefined element)
          ['F', 'A', 'C'], // Valid
        ],
        { timeout: 1 }
      )

      expect(results).toHaveLength(5)

      // Valid chords return data
      expect(results[0].data.root).toBe('C')
      expect(results[2].data.root).toBe('D')
      expect(results[4].data.root).toBe('F')

      // Invalid elements return errors (explain() handles these)
      expect(results[1].error).toBeDefined()
      expect(results[3].error).toBeDefined()
    })

    test('invalid elements do not block subsequent valid chords', async () => {
      const results = await explainBatch([
        ['X', 'Y', 'Z'], // Invalid notes
        ['G', 'B', 'D'], // Valid - should still process
      ])

      expect(results).toHaveLength(2)
      expect(results[0].error).toBeDefined() // First chord fails
      expect(results[1].data.root).toBe('G') // Second chord succeeds
    }, 15000) // 15s timeout for AI inference
  })

  /**
   * Test Group 6: Options Validation
   * Validates that invalid options are handled gracefully
   */
  describe('Options Validation', () => {
    test('rejects invalid temperature in options', async () => {
      const results = await explainBatch([['C', 'E', 'G']], {
        temperature: 2.0, // Invalid: >1.0
      })

      expect(results).toHaveLength(1)
      expect(results[0].error).toBeDefined()
      expect(results[0].error?.code).toBe('INVALID_INPUT')
      expect(results[0].error?.message).toContain('Temperature')
    })

    test('rejects NaN temperature in options', async () => {
      const results = await explainBatch([['C', 'E', 'G']], {
        temperature: NaN,
      })

      expect(results).toHaveLength(1)
      expect(results[0].error).toBeDefined()
      expect(results[0].error?.message).toContain('Temperature')
    })

    test('rejects invalid maxTokens in options', async () => {
      const results = await explainBatch([['C', 'E', 'G']], {
        maxTokens: -100, // Invalid: negative
      })

      expect(results).toHaveLength(1)
      expect(results[0].error).toBeDefined()
      expect(results[0].error?.code).toBe('INVALID_INPUT')
      expect(results[0].error?.message).toContain('MaxTokens') // Note: Capital M
    })

    test('applies valid options to all chords in batch', async () => {
      const results = await explainBatch(
        [
          ['C', 'E', 'G'],
          ['D', 'F#', 'A'],
        ],
        {
          temperature: 0.3,
          maxTokens: 50,
          useCache: false,
        }
      )

      // Both chords should succeed (valid options applied)
      expect(results).toHaveLength(2)
      expect(results[0].data.root).toBe('C')
      expect(results[1].data.root).toBe('D')
    }, 15000) // 15s timeout for AI inference
  })

  /**
   * Test Group 7: Large Batch Stress Test
   * Validates that large batches don't cause issues (no size limit currently)
   */
  describe('Large Batch Stress Test', () => {
    test('handles 10-chord batch without errors', async () => {
      const chords = [
        ['C', 'E', 'G'],
        ['D', 'F#', 'A'],
        ['E', 'G#', 'B'],
        ['F', 'A', 'C'],
        ['G', 'B', 'D'],
        ['A', 'C#', 'E'],
        ['B', 'D#', 'F#'],
        ['C#', 'F', 'G#'],
        ['D#', 'G', 'A#'],
        ['F#', 'A#', 'C#'],
      ]

      const results = await explainBatch(chords, { timeout: 1, useCache: true })

      expect(results).toHaveLength(10)
      results.forEach((result, i) => {
        expect(result.data).toBeDefined()
        expect(result.data.root).toBeTruthy()
      })
    }, 30000) // 30s timeout for 10-chord batch

    test('handles 50-chord batch with cache (stress test)', async () => {
      // Create 50 chords (repeating pattern)
      const baseChords = [
        ['C', 'E', 'G'],
        ['D', 'F#', 'A'],
        ['E', 'G#', 'B'],
        ['F', 'A', 'C'],
        ['G', 'B', 'D'],
      ]

      const chords = Array(10).fill(baseChords).flat()

      const results = await explainBatch(chords, { timeout: 1, useCache: true })

      expect(results).toHaveLength(50)

      // Validate all deterministic data present
      results.forEach((result) => {
        expect(result.data).toBeDefined()
        expect(result.data.root).toBeTruthy()
      })
    })
  })

  /**
   * Test Group 8: Consistency with explain()
   * Validates that explainBatch() behavior matches explain() for single chord
   */
  describe('Consistency with explain()', () => {
    test('single-chord batch returns same error as explain() for invalid input', async () => {
      const { explain } = await import('../../../src/api/chord-explain')

      const batchResult = await explainBatch([['X', 'Y', 'Z']])
      const singleResult = await explain(['X', 'Y', 'Z'])

      // Error codes should match
      expect(batchResult[0].error?.code).toBe(singleResult.error?.code)
      expect(batchResult[0].data.chord).toBe(singleResult.data.chord)
    })

    test('single-chord batch returns same data as explain() for valid input', async () => {
      const { explain } = await import('../../../src/api/chord-explain')

      const batchResult = await explainBatch([['C', 'E', 'G']], { timeout: 1 })
      const singleResult = await explain(['C', 'E', 'G'], { timeout: 1 })

      // Deterministic data should match
      expect(batchResult[0].data.root).toBe(singleResult.data.root)
      expect(batchResult[0].data.quality).toBe(singleResult.data.quality)
      expect(batchResult[0].data.intervals).toEqual(singleResult.data.intervals)
    })
  })

  /**
   * Test Group 9: Array Elements Validation
   * Validates handling of non-array elements within the batch
   */
  describe('Array Elements Validation', () => {
    test('handles non-array element in batch (delegates to explain())', async () => {
      const results = await explainBatch(
        [
          ['C', 'E', 'G'], // Valid
          'not-an-array' as any, // Invalid type
          ['D', 'F#', 'A'], // Valid
        ],
        { timeout: 1 }
      )

      expect(results).toHaveLength(3)
      expect(results[0].data.root).toBe('C')
      expect(results[1].error).toBeDefined() // explain() handles invalid type
      expect(results[2].data.root).toBe('D')
    })

    test('handles empty sub-array (delegates to explain())', async () => {
      const results = await explainBatch(
        [
          ['C', 'E', 'G'], // Valid
          [], // Empty sub-array - explain() will reject
          ['D', 'F#', 'A'], // Valid
        ],
        { timeout: 1 }
      )

      expect(results).toHaveLength(3)
      expect(results[0].data.root).toBe('C')
      expect(results[1].error).toBeDefined() // explain() rejects empty array
      expect(results[1].error?.message).toContain('empty')
      expect(results[2].data.root).toBe('D')
    })
  })
})
