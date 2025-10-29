/**
 * Unit tests for progression analysis API (User Story 5)
 * Tests progression.analyze() function with deterministic data validation
 */

import { describe, test, expect } from 'vitest'
import { analyze } from '../../../src/api/progression-analyze'

describe('progression.analyze() - Unit Tests (User Story 5)', () => {
  /**
   * Test Group 1: Input Validation
   * Validates graceful degradation for invalid inputs
   */
  describe('Input Validation', () => {
    test('rejects null input', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await analyze(null as any)

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('non-null array')
      expect(result.data.key).toBe('Unknown')
    })

    test('rejects empty array', async () => {
      const result = await analyze([])

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('cannot be empty')
    })

    test('rejects single chord (needs at least 2)', async () => {
      const result = await analyze(['C'])

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('At least 2 chords required')
    })

    test('rejects non-array input', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await analyze('Cmaj7' as any)

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
    })

    test('error includes actionable suggestion', async () => {
      const result = await analyze([])

      expect(result.error?.suggestion).toBeDefined()
      expect(result.error?.suggestion).toContain('2 chord')
    })
  })

  /**
   * Test Group 2: Deterministic Data Validation (Jazz ii-V-I)
   * Tests classic jazz progression Dm7-G7-Cmaj7
   */
  describe('Deterministic Data - Jazz ii-V-I', () => {
    test('detects jazz ii-V-I progression', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 1 })

      expect(result.data).toBeDefined()
      expect(result.data.key).toContain('C')
      expect(result.data.suggestedGenres.length).toBeGreaterThan(0)
    })

    test('returns genre detection for jazz progression', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 1 })

      const topGenre = result.data.suggestedGenres[0]
      expect(topGenre).toBeDefined()
      expect(topGenre.genre).toBe('jazz')
      expect(topGenre.confidence).toBeGreaterThan(0)
    })

    test('returns matched patterns for jazz progression', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 1 })

      const topGenre = result.data.suggestedGenres[0]
      expect(topGenre.matchedPatterns).toBeDefined()
      expect(topGenre.matchedPatterns.length).toBeGreaterThan(0)

      if (topGenre.matchedPatterns.length > 0) {
        const pattern = topGenre.matchedPatterns[0]
        expect(pattern.pattern).toBeDefined() // Roman numeral sequence
        expect(pattern.description).toBeDefined() // Pattern explanation
      }
    })

    test('returns confidence score for progression', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 1 })

      expect(result.data.confidence).toBeGreaterThanOrEqual(0)
      expect(result.data.confidence).toBeLessThanOrEqual(1)
    })

    test('provides song examples for detected pattern', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 1 })

      const topGenre = result.data.suggestedGenres[0]
      if (topGenre.matchedPatterns.length > 0) {
        const pattern = topGenre.matchedPatterns[0]
        // Song examples should be present for jazz ii-V-I
        if (pattern.examples) {
          expect(pattern.examples.length).toBeGreaterThan(0)
        }
      }
    })
  })

  /**
   * Test Group 3: Pop Progression (I-V-vi-IV)
   * Tests emotional pop progression C-G-Am-F
   */
  describe('Deterministic Data - Pop I-V-vi-IV', () => {
    test('detects pop progression', async () => {
      const result = await analyze(['C', 'G', 'Am', 'F'], { timeout: 1 })

      expect(result.data).toBeDefined()
      expect(result.data.key).toContain('C')
    })

    test('returns genre detection for pop progression', async () => {
      const result = await analyze(['C', 'G', 'Am', 'F'], { timeout: 1 })

      const genres = result.data.suggestedGenres.map((g) => g.genre)
      expect(genres).toContain('pop')
    })

    test('progression has multiple chords analyzed', async () => {
      const result = await analyze(['C', 'G', 'Am', 'F'], { timeout: 1 })

      expect(result.data.analysis).toBeDefined()
      expect(result.data.analysis.length).toBe(4) // 4 chords
    })
  })

  /**
   * Test Group 4: Options Validation
   * Tests configuration options and their validation
   */
  describe('Options Validation', () => {
    test('rejects invalid temperature', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], {
        temperature: 2.0, // Invalid: >1.0
      })

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('Temperature')
      // But deterministic data still works
      expect(result.data.key).toContain('C')
    })

    test('rejects NaN temperature', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], {
        temperature: NaN,
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('Temperature')
    })

    test('rejects invalid maxTokens', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], {
        maxTokens: -100,
      })

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
      expect(result.error?.message).toContain('MaxTokens')
    })

    test('accepts valid options without error', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], {
        temperature: 0.5,
        maxTokens: 200,
        useCache: true,
        timeout: 5000, // Min valid timeout (may trigger AI load on first run)
      })

      // No validation error (deterministic data always returned)
      expect(result.data).toBeDefined()
      expect(result.data.key).toContain('C')
    }, 30000) // 30s test timeout (allows AI model loading)
  })

  /**
   * Test Group 5: Consistency with analyzeProgression()
   * Ensures analyze() returns same deterministic data as analyzeProgression()
   */
  describe('Consistency with analyzeProgression()', () => {
    test('analyze() data matches analyzeProgression() output', async () => {
      const { analyzeProgression } = await import('@music-reasoning/core')

      const chords = ['Dm7', 'G7', 'Cmaj7']
      const analyzeResult = await analyze(chords, { timeout: 1 })
      const directResult = analyzeProgression(chords)

      // Deterministic data should match exactly
      expect(analyzeResult.data.key).toBe(directResult.key)
      expect(analyzeResult.data.confidence).toBe(directResult.confidence)
      expect(analyzeResult.data.analysis.length).toBe(directResult.analysis.length)
      expect(analyzeResult.data.suggestedGenres.length).toBe(directResult.suggestedGenres.length)
    })
  })

  /**
   * Test Group 6: Various Chord Progressions
   * Tests different progression types for compatibility
   */
  describe('Various Progression Types', () => {
    test('handles blues progression (I-IV-V)', async () => {
      const result = await analyze(['C7', 'F7', 'G7'], { timeout: 1 })

      expect(result.data.key).toContain('C')
      const genres = result.data.suggestedGenres.map((g) => g.genre)
      expect(genres.length).toBeGreaterThan(0) // Genre detection varies
    })

    test('handles rock progression', async () => {
      const result = await analyze(['A', 'D', 'E', 'A'], { timeout: 1 })

      expect(result.data).toBeDefined()
      expect(result.data.key).toContain('A')
    })

    test('handles modal progression', async () => {
      const result = await analyze(['Dm', 'Em', 'Dm', 'Em'], { timeout: 1 })

      expect(result.data).toBeDefined()
      expect(result.data.analysis.length).toBe(4)
    })

    test('handles chromatic progression', async () => {
      const result = await analyze(['C', 'Db', 'D', 'Eb'], { timeout: 1 })

      expect(result.data).toBeDefined()
      // Chromatic progressions may have lower confidence
      expect(result.data.confidence).toBeGreaterThanOrEqual(0)
    })
  })

  /**
   * Test Group 7: Whitespace Normalization (Fix #4)
   * Tests that chord symbols with leading/trailing whitespace are handled correctly
   */
  describe('Whitespace Normalization', () => {
    test('trims leading/trailing spaces from chord symbols', async () => {
      const result1 = await analyze([' Dm7 ', ' G7 ', ' Cmaj7 '], { timeout: 5000 })
      const result2 = await analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 5000 })

      // Both should return identical deterministic data
      expect(result1.data.key).toBe(result2.data.key)
      expect(result1.data.analysis).toEqual(result2.data.analysis)
      expect(result1.data.suggestedGenres[0].genre).toBe(result2.data.suggestedGenres[0].genre)
    }, 15000) // 15s test timeout (2 API calls)

    test('whitespace-trimmed inputs produce consistent cache keys', async () => {
      // First call with trimmed input
      const result1 = await analyze(['C', 'G', 'Am', 'F'], {
        useCache: true,
        timeout: 1, // Force timeout to avoid AI call time
      })

      // Second call with whitespace - should use same cache key
      const result2 = await analyze([' C ', ' G ', ' Am ', ' F '], {
        useCache: true,
        timeout: 1,
      })

      // Deterministic data should be identical
      expect(result1.data.key).toBe(result2.data.key)
      expect(result1.data.analysis).toEqual(result2.data.analysis)
    })

    test('handles mixed whitespace variations in progression', async () => {
      const result = await analyze(['  C7  ', 'F7', '  G7  '], { timeout: 5000 })

      expect(result.data).toBeDefined()
      expect(result.data.key).toContain('C')
      expect(result.data.analysis.length).toBe(3)
    }, 10000) // 10s test timeout

    test('empty strings after trimming are handled as invalid', async () => {
      const result = await analyze(['   ', 'G7', 'Cmaj7'])

      // Should fail validation (empty chord after trim)
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('INVALID_INPUT')
    })
  })

  /**
   * Test Group 8: Graceful Degradation
   * T072: Validates progression.analyze() works without AI
   */
  describe('Graceful Degradation (T072)', () => {
    test('returns deterministic data even when AI unavailable', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], {
        timeout: 1, // Force timeout to simulate AI unavailable
      })

      // Error might be present (MODEL_UNAVAILABLE or TIMEOUT)
      if (result.error) {
        expect(['MODEL_UNAVAILABLE', 'TIMEOUT', 'INVALID_INPUT']).toContain(result.error.code)
      }

      // But deterministic data ALWAYS works
      expect(result.data).toBeDefined()
      expect(result.data.key).toContain('C')
      expect(result.data.suggestedGenres[0].genre).toBe('jazz')
    })

    test('error includes helpful suggestion when AI fails', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], {
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
        analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 1 }),
        analyze(['C', 'G', 'Am', 'F'], { timeout: 1 }),
        analyze(['C7', 'F7', 'G7'], { timeout: 1 }),
      ])

      // All should have valid deterministic data
      expect(results[0].data.key).toContain('C')
      expect(results[1].data.key).toContain('C')
      expect(results[2].data.key).toContain('C')

      // Genre detection works
      expect(results[0].data.suggestedGenres[0].genre).toBe('jazz')
      expect(results[1].data.suggestedGenres.map((g) => g.genre)).toContain('pop')
      // C7-F7-G7 may detect as blues, rock, or pop (all valid for I-IV-V)
      expect(results[2].data.suggestedGenres.length).toBeGreaterThan(0)
    })
  })

  /**
   * Test Group 9: Genre Context Integration (T068)
   * Validates that detected genre is available for AI prompt
   */
  describe('Genre Context Integration (T068)', () => {
    test('genre detection provides context for AI', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 1 })

      // Genre data should be available for AI prompt construction
      expect(result.data.suggestedGenres.length).toBeGreaterThan(0)

      const topGenre = result.data.suggestedGenres[0]
      expect(topGenre.genre).toBe('jazz')
      expect(topGenre.confidence).toBeGreaterThan(0)

      expect(topGenre.matchedPatterns).toBeDefined()
      expect(topGenre.matchedPatterns.length).toBeGreaterThan(0)

      if (topGenre.matchedPatterns.length > 0) {
        // Pattern details available for context
        const pattern = topGenre.matchedPatterns[0]
        expect(pattern.pattern).toBeDefined() // Roman numeral sequence
        expect(pattern.description).toBeDefined() // Pattern explanation
      }
    })

    test('pattern provides educational context', async () => {
      const result = await analyze(['Dm7', 'G7', 'Cmaj7'], { timeout: 1 })

      const pattern = result.data.suggestedGenres[0].matchedPatterns[0]

      // Educational metadata present
      if (pattern.description) {
        expect(pattern.description).toBeTruthy()
      }
      if (pattern.examples) {
        expect(pattern.examples.length).toBeGreaterThan(0)
      }
    })
  })
})
