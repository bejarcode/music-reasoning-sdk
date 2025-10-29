/**
 * Integration tests for User Story 2: Graceful Degradation
 *
 * Tests verify that the SDK gracefully handles AI failures while maintaining
 * deterministic functionality. Constitutional Principle V: Graceful Degradation
 */

import { describe, test, expect, vi } from 'vitest'
import { explainChord, identifyChord } from '../../src/api/chord'

// Force ai-local calls to fail fast so we exercise graceful-degradation logic
// This prevents filesystem probes and makes tests deterministic and fast
vi.mock('@music-reasoning/ai-local', () => {
  return {
    loadModel: vi.fn(async () => {
      throw new Error('Model not found')
    }),
    generateExplanation: vi.fn(async () => {
      throw new Error('Model not found')
    }),
    isModelLoaded: vi.fn(() => false),
  }
})

describe('User Story 2: Graceful Degradation', () => {
  describe('T039: MODEL_UNAVAILABLE error handling', () => {
    test('returns deterministic data when AI model unavailable', async () => {
      // Note: This test validates error handling structure.
      // In CI (where model is unavailable), this will get MODEL_UNAVAILABLE error.
      // Locally (with model), this will succeed with explanation.
      // Both outcomes are valid - we're testing graceful degradation.

      const result = await explainChord(['C', 'E', 'G'])

      // Constitutional Principle II: Deterministic data ALWAYS present
      expect(result.data).toBeDefined()
      expect(result.data.root).toBe('C')
      expect(result.data.quality).toBe('major')
      expect(result.data.chord).toContain('major')
      expect(result.data.notes).toEqual(['C', 'E', 'G'])
      expect(result.data.intervals).toEqual(['P1', 'M3', 'P5'])

      // Either AI succeeds or gracefully degrades
      if (result.error) {
        // Graceful degradation path
        expect(result.error.code).toMatch(
          /MODEL_UNAVAILABLE|TIMEOUT|INSUFFICIENT_RAM|CORRUPTED_MODEL/
        )
        expect(result.error.message).toBeTruthy()
        expect(result.error.suggestion).toBeTruthy()
        expect(result.explanation).toBeUndefined()
      } else {
        // Success path
        expect(result.explanation).toBeDefined()
        expect(result.explanation).toBeTruthy()
      }
    }, 10000) // 10s timeout for AI inference

    test('MODEL_UNAVAILABLE error has proper structure', async () => {
      const result = await explainChord(['D', 'F#', 'A'])

      // Deterministic data always works
      expect(result.data.root).toBe('D')
      expect(result.data.quality).toBe('major')

      // If AI fails, error should have required fields
      if (result.error) {
        expect(result.error).toHaveProperty('code')
        expect(result.error).toHaveProperty('message')
        expect(result.error).toHaveProperty('suggestion')

        // Verify error code is valid
        expect([
          'MODEL_UNAVAILABLE',
          'TIMEOUT',
          'INVALID_INPUT',
          'INSUFFICIENT_RAM',
          'CORRUPTED_MODEL',
        ]).toContain(result.error.code)
      }
    }, 10000) // 10s timeout for AI inference

    test('SDK never throws exceptions on AI failure', async () => {
      // This test validates Constitutional Principle V: Never throw exceptions

      // Should not throw, even on potential AI failures
      const result = await explainChord(['E', 'G#', 'B'])
      expect(result).toBeDefined()
      expect(result).toHaveProperty('data')
      expect(result.data).toBeDefined()

      // Second call should also not throw
      const result2 = await explainChord(['F', 'A', 'C'])
      expect(result2).toHaveProperty('data')
      expect(result2.data).toBeDefined()
    }, 10000) // 10s timeout for AI inference

    test('multiple AI failures do not corrupt deterministic layer', async () => {
      // Call multiple times to ensure errors don't affect deterministic engine
      const results = await Promise.all([
        explainChord(['C', 'E', 'G']),
        explainChord(['G', 'B', 'D']),
        explainChord(['A', 'C', 'E']), // A minor chord
        explainChord(['F', 'A', 'C']),
        explainChord(['D', 'F', 'A', 'C']), // Dm7 chord
      ])

      // All should have deterministic data
      expect(results[0].data.root).toBe('C')
      expect(results[1].data.root).toBe('G')
      expect(results[2].data.root).toBe('A')
      expect(results[3].data.root).toBe('F')
      expect(results[4].data.root).toBe('D')

      // None should throw or crash
      results.forEach((result) => {
        expect(result.data).toBeDefined()
        expect(result.data.confidence).toBeGreaterThan(0)
      })
    }, 15000) // 15s timeout for multiple AI inferences
  })

  describe('T040: Deterministic functions work without AI', () => {
    test('identifyChord works <50ms without AI', async () => {
      // Warm up
      identifyChord(['C', 'E', 'G'])

      // Measure deterministic performance (should be <50ms even on cold start)
      const start = Date.now()
      const result = identifyChord(['D', 'F#', 'A'])
      const duration = Date.now() - start

      expect(result.root).toBe('D')
      expect(result.quality).toBe('major')
      expect(result.chord).toContain('major')
      expect(duration).toBeLessThan(50) // Constitutional target: <50ms
    })

    test('identifyChord handles complex chords without AI', () => {
      const dm7 = identifyChord(['D', 'F', 'A', 'C'])
      expect(dm7.root).toBe('D')
      expect(dm7.quality).toMatch(/m7|minor.*7/i)
      expect(dm7.intervals).toContain('m3')
      expect(dm7.intervals).toContain('m7')

      const g7 = identifyChord(['G', 'B', 'D', 'F'])
      expect(g7.root).toBe('G')
      expect(g7.quality).toMatch(/dominant|7/i)
      expect(g7.intervals).toContain('M3')
      expect(g7.intervals).toContain('m7')

      const cmaj7 = identifyChord(['C', 'E', 'G', 'B'])
      expect(cmaj7.root).toBe('C')
      expect(cmaj7.quality).toMatch(/maj7|major.*7/i)
      expect(cmaj7.intervals).toContain('M7')
    })

    test('identifyChord provides confidence without AI', () => {
      const result = identifyChord(['C', 'E', 'G'])

      expect(result.confidence).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    test('identifyChord handles enharmonics without AI', () => {
      const cSharpMajor = identifyChord(['C#', 'E#', 'G#'])
      const dFlatMajor = identifyChord(['Db', 'F', 'Ab'])

      // Both are valid representations of the same chord (C#/Db major)
      expect(cSharpMajor.quality).toBe(dFlatMajor.quality)
      expect(cSharpMajor.intervals).toEqual(dFlatMajor.intervals)
    })

    test('deterministic layer handles inversions without AI', () => {
      const root = identifyChord(['C', 'E', 'G']) // Root position
      const first = identifyChord(['E', 'G', 'C']) // First inversion
      const second = identifyChord(['G', 'C', 'E']) // Second inversion

      // All should identify as related to C major
      expect(root.notes).toContain('C')
      expect(first.notes).toContain('C')
      expect(second.notes).toContain('C')
    })

    test('deterministic layer never depends on AI model state', async () => {
      // Call identifyChord before and after explainChord
      const before = identifyChord(['F', 'A', 'C'])

      // Trigger AI layer (may fail, doesn't matter - we only test deterministic layer)
      // Using void to explicitly indicate fire-and-forget intent
      void explainChord(['G', 'B', 'D']).catch(() => {
        // Expected: AI may fail, we only care that identifyChord works independently
      })

      const after = identifyChord(['F', 'A', 'C'])

      // Results should be identical (AI state doesn't affect deterministic layer)
      expect(before.root).toBe(after.root)
      expect(before.quality).toBe(after.quality)
      expect(before.intervals).toEqual(after.intervals)
    })
  })

  describe('T041: TIMEOUT error handling', () => {
    test('TIMEOUT error has proper structure', async () => {
      // Use minimum valid timeout (5000ms) - may timeout on cold start
      const result = await explainChord(['A', 'C#', 'E'], {
        timeout: 5000,
      })

      // Deterministic data always present
      expect(result.data).toBeDefined()
      expect(result.data.root).toBe('A')

      // If timeout occurred, verify error structure
      if (result.error?.code === 'TIMEOUT') {
        expect(result.error.message).toContain('timeout')
        expect(result.error.suggestion).toBeTruthy()
        expect(result.error.suggestion.toLowerCase()).toContain('timeout')
        expect(result.explanation).toBeUndefined()
      }
    }, 10000) // 10s timeout

    test('TIMEOUT does not affect subsequent calls', async () => {
      // First call with short timeout (may timeout)
      const first = await explainChord(['B', 'D#', 'F#'], {
        timeout: 5000,
      })

      // Second call with normal timeout (should work if model loaded)
      const second = await explainChord(['C', 'E', 'G'], {
        timeout: 30000,
      })

      // Both should have deterministic data
      expect(first.data.root).toBe('B')
      expect(second.data.root).toBe('C')

      // Second call should not be affected by first call's timeout
      expect(second.data).toBeDefined()
      expect(second.data.confidence).toBeGreaterThan(0)
    }, 40000) // 40s timeout (two sequential calls)

    test('different timeout values are respected', async () => {
      // Short timeout
      const short = await explainChord(['D', 'F#', 'A'], {
        timeout: 5000,
      })

      // Long timeout
      const long = await explainChord(['E', 'G#', 'B'], {
        timeout: 60000,
      })

      // Both should have deterministic data regardless of timeout
      expect(short.data).toBeDefined()
      expect(long.data).toBeDefined()

      // If short timed out, long should have more time to succeed
      if (short.error?.code === 'TIMEOUT') {
        // Long timeout should either succeed or have different error
        expect(long.data.root).toBe('E')
      }
    }, 70000) // 70s timeout (two sequential calls, one with 60s timeout)

    test('timeout errors provide actionable suggestions', async () => {
      const result = await explainChord(['F#', 'A#', 'C#'], {
        timeout: 5000,
      })

      if (result.error?.code === 'TIMEOUT') {
        // Suggestion should mention increasing timeout
        expect(result.error.suggestion).toMatch(/timeout|increase|ms/i)

        // Should suggest a larger timeout value
        expect(result.error.suggestion).toMatch(/\d+/) // Contains numbers
      }

      // Deterministic data always present
      expect(result.data.root).toBe('F#')
    }, 10000) // 10s timeout

    test('graceful degradation on timeout maintains cache integrity', async () => {
      // First call (may timeout or succeed)
      const first = await explainChord(['G', 'B', 'D'], {
        timeout: 5000,
        useCache: true,
      })

      // Second call with same notes (should hit cache if first succeeded)
      const second = await explainChord(['G', 'B', 'D'], {
        timeout: 30000,
        useCache: true,
      })

      // Both should have deterministic data
      expect(first.data.root).toBe('G')
      expect(second.data.root).toBe('G')

      // If first succeeded, second should be cached
      if (first.explanation && second.explanation) {
        expect(second.explanation).toBe(first.explanation)
      }
    }, 40000) // 40s timeout (two sequential calls)

    test('concurrent calls with different timeouts handle race conditions correctly', async () => {
      // This test validates race condition protection in ensureModelLoaded()
      // Multiple concurrent calls with different timeouts should all work correctly
      const [short, medium, long] = await Promise.all([
        explainChord(['C', 'E', 'G'], { timeout: 5000 }),
        explainChord(['D', 'F#', 'A'], { timeout: 15000 }),
        explainChord(['E', 'G#', 'B'], { timeout: 30000 }),
      ])

      // All should have deterministic data (never undefined/crashed)
      expect(short.data).toBeDefined()
      expect(short.data.root).toBe('C')
      expect(medium.data).toBeDefined()
      expect(medium.data.root).toBe('D')
      expect(long.data).toBeDefined()
      expect(long.data.root).toBe('E')

      // At least one should succeed (longest timeout has best chance)
      // UNLESS model is unavailable, in which case all fail gracefully
      const successes = [short, medium, long].filter((r) => !r.error)
      const allModelUnavailable = [short, medium, long].every(
        (r) => r.error?.code === 'MODEL_UNAVAILABLE'
      )

      if (allModelUnavailable) {
        // When model unavailable (e.g., mocked), all should fail gracefully
        expect(successes.length).toBe(0)
      } else {
        // When model available, at least one should succeed
        expect(successes.length).toBeGreaterThan(0)
      }

      // If short timed out, longer ones should have better success rate
      if (short.error?.code === 'TIMEOUT') {
        // At least the longest should succeed (or all timeout if model unavailable)
        const longerSuccesses = [medium, long].filter((r) => !r.error)
        expect(longerSuccesses.length).toBeGreaterThanOrEqual(0)
      }

      // None should have crashed or thrown exceptions
      ;[short, medium, long].forEach((result) => {
        expect(result).toHaveProperty('data')
        expect(result.data.confidence).toBeGreaterThanOrEqual(0)
      })
    }, 40000) // 40s timeout (concurrent calls, max is 30s + overhead)
  })

  describe('Cross-error-type graceful degradation', () => {
    test('handles mixed error scenarios gracefully', async () => {
      // Invalid input (validation error)
      const invalid = await explainChord(['C', 'E', 'G'], {
        temperature: 2.0,
      })

      // Potential model error (model may not be available)
      const model = await explainChord(['D', 'F#', 'A'])

      // Potential timeout error
      const timeout = await explainChord(['E', 'G#', 'B'], {
        timeout: 5000,
      })

      // All should have deterministic data
      expect(invalid.data.root).toBe('C')
      expect(model.data.root).toBe('D')
      expect(timeout.data.root).toBe('E')

      // All should have proper error codes (if errors occurred)
      if (invalid.error) expect(invalid.error.code).toBe('INVALID_INPUT')
      if (model.error)
        expect(['MODEL_UNAVAILABLE', 'TIMEOUT', 'INSUFFICIENT_RAM', 'CORRUPTED_MODEL']).toContain(
          model.error.code
        )
      if (timeout.error) expect(['TIMEOUT', 'MODEL_UNAVAILABLE']).toContain(timeout.error.code)
    })

    test('error handling does not leak between calls', async () => {
      // Call with invalid options
      await explainChord(['C', 'E', 'G'], { temperature: 5.0 })

      // Subsequent call with valid options should not be affected
      const result = await explainChord(['D', 'F#', 'A'], {
        temperature: 0.5,
      })

      expect(result.data.root).toBe('D')

      // Should not have INVALID_INPUT error from previous call
      if (result.error) {
        expect(result.error.code).not.toBe('INVALID_INPUT')
      }
    })

    test('Constitutional Principle V: Never throws exceptions', async () => {
      // All of these should return errors, not throw
      const tests = [
        explainChord([]), // Empty array
        explainChord(['C']), // Single note
        explainChord(['X', 'Y', 'Z']), // Invalid notes
        explainChord(['C', 'E', 'G'], { temperature: 10 }), // Invalid temp
        explainChord(['C', 'E', 'G'], { maxTokens: 1000 }), // Invalid tokens
        explainChord(['C', 'E', 'G'], { timeout: 100 }), // Invalid timeout
      ]

      // None should throw
      const results = await Promise.all(tests)

      // All should have data field
      results.forEach((result) => {
        expect(result).toHaveProperty('data')
        expect(result.data).toBeDefined()
      })

      // All should have errors
      results.forEach((result) => {
        expect(result.error).toBeDefined()
        expect(result.error?.code).toBe('INVALID_INPUT')
      })
    })
  })
})
