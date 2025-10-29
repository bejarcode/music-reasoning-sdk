/**
 * Unit tests for scale explanation API (User Story 5)
 * Tests scale.explain() function with deterministic data validation
 */

import { describe, test, expect } from 'vitest'
import { explain } from '../../../src/api/scale-explain'

describe('scale.explain() - Unit Tests (User Story 5)', () => {
  /**
   * Test Group 1: Input Validation
   * Validates graceful degradation for invalid inputs
   */
  describe('Input Validation', () => {
    test('rejects empty root note', async () => {
      const result = await explain('', 'major')

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('Root note must be a non-empty string')
      expect(result.data.scale).toBe('Invalid')
    })

    test('rejects null root note', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await explain(null as any, 'major')

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.data.scale).toBe('Invalid')
    })

    test('rejects empty scale type', async () => {
      const result = await explain('C', '')

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('Scale type must be a non-empty string')
    })

    test('rejects invalid scale type', async () => {
      const result = await explain('C', 'invalid-scale-type')

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('Unable to get scale')
    })

    test('error includes actionable suggestion', async () => {
      const result = await explain('', 'major')

      expect(result.error?.suggestion).toBeDefined()
      expect(result.error?.suggestion).toContain('C')
    })
  })

  /**
   * Test Group 2: Deterministic Data Validation
   * Ensures scale.explain() returns correct deterministic data
   */
  describe('Deterministic Data (Always Present)', () => {
    test('returns correct notes for C major scale', async () => {
      const result = await explain('C', 'major', { timeout: 1 })

      expect(result.data).toBeDefined()
      expect(result.data.root).toBe('C') // getScale preserves input case
      expect(result.data.type).toBe('major')
      expect(result.data.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    })

    test('returns correct intervals for major scale', async () => {
      const result = await explain('C', 'major', { timeout: 1 })

      expect(result.data.intervals).toEqual(['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'])
    })

    test('returns correct formula for major scale', async () => {
      const result = await explain('C', 'major', { timeout: 1 })

      expect(result.data.formula).toBe('W-W-H-W-W-W-H')
    })

    test('returns D dorian scale correctly', async () => {
      const result = await explain('D', 'dorian', { timeout: 1 })

      expect(result.data.root).toBe('D')
      expect(result.data.type).toBe('dorian')
      expect(result.data.notes).toContain('D')
      expect(result.data.notes).toContain('E')
      expect(result.data.notes).toContain('F') // Characteristic note (minor 3rd)
    })

    test('returns scale degrees with names', async () => {
      const result = await explain('C', 'major', { timeout: 1 })

      expect(result.data.degrees).toBeDefined()
      expect(result.data.degrees.length).toBe(7)
      expect(result.data.degrees[0].degree).toBe(1)
      expect(result.data.degrees[0].name).toContain('tonic')
    })

    test('handles sharps correctly (F# major)', async () => {
      const result = await explain('F#', 'major', { timeout: 1 })

      expect(result.data.root).toBe('F#')
      expect(result.data.notes).toContain('F#')
      expect(result.data.notes).toContain('G#')
    })

    test('handles flats correctly (Bb major)', async () => {
      const result = await explain('Bb', 'major', { timeout: 1 })

      expect(result.data.root).toBe('Bb')
      expect(result.data.notes).toContain('Bb')
      expect(result.data.notes).toContain('Eb')
    })
  })

  /**
   * Test Group 3: Options Validation
   * Tests configuration options and their validation
   */
  describe('Options Validation', () => {
    test('rejects invalid temperature', async () => {
      const result = await explain('C', 'major', {
        temperature: 2.0, // Invalid: >1.0
      })

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('Temperature')
      // But deterministic data still works
      expect(result.data.root).toBe('C') // getScale preserves input case
    })

    test('rejects NaN temperature', async () => {
      const result = await explain('C', 'major', {
        temperature: NaN,
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('Temperature')
    })

    test('rejects invalid maxTokens', async () => {
      const result = await explain('C', 'major', {
        maxTokens: -100,
      })

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('MaxTokens')
    })

    test('accepts valid options without error', async () => {
      const result = await explain('C', 'major', {
        temperature: 0.5,
        maxTokens: 150,
        useCache: true,
        timeout: 5000, // Min valid timeout (may trigger AI load on first run)
      })

      // No validation error (deterministic data always returned)
      expect(result.data).toBeDefined()
      expect(result.data.root).toBe('C') // getScale preserves input case
    }, 30000) // 30s test timeout (allows AI model loading)
  })

  /**
   * Test Group 4: Scale Type Coverage
   * Tests various scale types to ensure compatibility
   */
  describe('Scale Type Coverage', () => {
    test('handles minor scale', async () => {
      const result = await explain('A', 'minor', { timeout: 1 })

      expect(result.data.type).toContain('minor')
      expect(result.data.notes).toContain('A')
      expect(result.data.notes).toContain('C') // Minor 3rd
    })

    test('handles mixolydian mode', async () => {
      const result = await explain('G', 'mixolydian', { timeout: 1 })

      expect(result.data.type).toBe('mixolydian')
      expect(result.data.root).toBe('G')
    })

    test('handles lydian mode', async () => {
      const result = await explain('F', 'lydian', { timeout: 1 })

      expect(result.data.type).toBe('lydian')
      expect(result.data.root).toBe('F')
    })

    test('handles phrygian mode', async () => {
      const result = await explain('E', 'phrygian', { timeout: 1 })

      expect(result.data.type).toBe('phrygian')
      expect(result.data.root).toBe('E')
    })
  })

  /**
   * Test Group 5: Consistency with getScale()
   * Ensures explain() returns same deterministic data as getScale()
   */
  describe('Consistency with getScale()', () => {
    test('explain() data matches getScale() output', async () => {
      const { getScale } = await import('@music-reasoning/core')

      const explainResult = await explain('C', 'major', { timeout: 1 })
      const getScaleResult = getScale('C', 'major')

      // Deterministic data should match exactly
      expect(explainResult.data.scale).toBe(getScaleResult.scale)
      expect(explainResult.data.root).toBe(getScaleResult.root)
      expect(explainResult.data.type).toBe(getScaleResult.type)
      expect(explainResult.data.notes).toEqual(getScaleResult.notes)
      expect(explainResult.data.intervals).toEqual(getScaleResult.intervals)
    })
  })

  /**
   * Test Group 6: Case Sensitivity
   * Tests handling of different case inputs
   */
  describe('Case Sensitivity', () => {
    test('handles lowercase root note', async () => {
      const result = await explain('c', 'major', { timeout: 1 })

      // Core's getScale() handles normalization
      expect(result.data.root).toBe('c') // getScale preserves case
    })

    test('handles uppercase scale type', async () => {
      const result = await explain('C', 'MAJOR', { timeout: 1 })

      // Core's getScale() handles normalization
      expect(result.data.type).toBe('major')
    })

    test('handles mixed case scale type', async () => {
      const result = await explain('C', 'Major', { timeout: 1 })

      expect(result.data.type).toBe('major')
    })
  })

  /**
   * Test Group 7: Whitespace Normalization (Fix #4)
   * Tests that inputs with leading/trailing whitespace are handled correctly
   */
  describe('Whitespace Normalization', () => {
    test('trims leading/trailing spaces from root note', async () => {
      const result1 = await explain(' c ', 'major', { timeout: 5000 })
      const result2 = await explain('c', 'major', { timeout: 5000 })

      expect(result1.data.root).toBe('c')
      expect(result1.data.notes).toEqual(result2.data.notes)
      expect(result1.data.intervals).toEqual(result2.data.intervals)
    }, 15000) // 15s test timeout (2 API calls)

    test('trims leading/trailing spaces from scale type', async () => {
      const result1 = await explain('C', ' Major ', { timeout: 5000 })
      const result2 = await explain('C', 'Major', { timeout: 5000 })

      expect(result1.data.type).toBe('major')
      expect(result1.data.notes).toEqual(result2.data.notes)
    }, 15000) // 15s test timeout (2 API calls)

    test('whitespace-trimmed inputs produce consistent cache keys', async () => {
      const result1 = await explain('D', 'dorian', {
        useCache: true,
        timeout: 1,
      })

      const result2 = await explain(' D ', ' dorian ', {
        useCache: true,
        timeout: 1,
      })

      expect(result1.data.root).toBe(result2.data.root)
      expect(result1.data.type).toBe(result2.data.type)
      expect(result1.data.notes).toEqual(result2.data.notes)
    })

    test('handles mixed whitespace and case variations', async () => {
      const result = await explain('  F#  ', '  LYDIAN  ', { timeout: 5000 })

      expect(result.data.root).toBe('F#')
      expect(result.data.type).toBe('lydian')
      expect(result.data.notes).toContain('F#')
    }, 10000) // 10s test timeout
  })

  /**
   * Test Group 8: Graceful Degradation
   * T072: Validates scale.explain() works without AI
   */
  describe('Graceful Degradation (T072)', () => {
    test('returns deterministic data even when AI unavailable', async () => {
      const result = await explain('C', 'major', {
        timeout: 1, // Force timeout to simulate AI unavailable
      })

      // Error might be present (MODEL_UNAVAILABLE or TIMEOUT)
      if (result.error) {
        expect(['MODEL_UNAVAILABLE', 'TIMEOUT', 'INVALID_INPUT']).toContain(result.error.code)
      }

      // But deterministic data ALWAYS works
      expect(result.data).toBeDefined()
      expect(result.data.root).toBe('C') // getScale preserves input case
      expect(result.data.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    }, 10000) // 10s timeout

    test('error includes helpful suggestion when AI fails', async () => {
      const result = await explain('C', 'major', {
        timeout: 1, // Force timeout
      })

      if (result.error) {
        expect(result.error.suggestion).toBeDefined()
        expect(result.error.suggestion).toBeTruthy()
      }
    })

    test('multiple failures do not corrupt deterministic data', async () => {
      // Call multiple times with timeout to simulate AI failure
      const results = await Promise.all([
        explain('C', 'major', { timeout: 1 }),
        explain('D', 'minor', { timeout: 1 }),
        explain('G', 'mixolydian', { timeout: 1 }),
      ])

      // All should have valid deterministic data
      expect(results[0].data.root).toBe('C')
      expect(results[1].data.root).toBe('D')
      expect(results[2].data.root).toBe('G')
    })
  })
})
