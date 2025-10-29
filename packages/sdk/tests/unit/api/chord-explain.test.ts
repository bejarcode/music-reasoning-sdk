/**
 * Unit tests for chord.explain() - User Story 3: Configurable AI Creativity
 *
 * Tests validate input validation and options handling for the explain() API.
 * These are UNIT tests (no AI model required) - they test validation logic only.
 */

import { describe, test, expect } from 'vitest'
import { validateExplainOptions, createExplanationError } from '../../../src/types/errors'
import { DEFAULT_EXPLAIN_OPTIONS } from '../../../src/types/explain'

describe('User Story 3: Configurable AI Creativity - Unit Tests', () => {
  describe('T048: Temperature validation', () => {
    test('rejects temperature above 1.0', () => {
      const error = validateExplainOptions({ temperature: 1.5 })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Temperature must be between 0.0 and 1.0')
      expect(error?.message).toContain('1.5')
      expect(error?.suggestion).toBeTruthy()
    })

    test('rejects temperature below 0.0', () => {
      const error = validateExplainOptions({ temperature: -0.1 })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Temperature must be between 0.0 and 1.0')
      expect(error?.message).toContain('-0.1')
    })

    test('accepts temperature at lower boundary (0.0)', () => {
      const error = validateExplainOptions({ temperature: 0.0 })

      expect(error).toBeUndefined()
    })

    test('accepts temperature at upper boundary (1.0)', () => {
      const error = validateExplainOptions({ temperature: 1.0 })

      expect(error).toBeUndefined()
    })

    test('accepts mid-range temperature (0.5)', () => {
      const error = validateExplainOptions({ temperature: 0.5 })

      expect(error).toBeUndefined()
    })

    test('accepts factual temperature (0.3)', () => {
      const error = validateExplainOptions({ temperature: 0.3 })

      expect(error).toBeUndefined()
    })

    test('accepts creative temperature (0.7)', () => {
      const error = validateExplainOptions({ temperature: 0.7 })

      expect(error).toBeUndefined()
    })

    test('suggestion mentions recommended temperature range', () => {
      const error = validateExplainOptions({ temperature: 2.0 })

      expect(error?.suggestion).toMatch(/0\.3.*0\.7/)
    })

    test('rejects NaN temperature', () => {
      const error = validateExplainOptions({ temperature: NaN })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Temperature must be between 0.0 and 1.0')
      expect(error?.message).toContain('NaN')
    })

    test('rejects Infinity temperature', () => {
      const error = validateExplainOptions({ temperature: Infinity })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Temperature must be between 0.0 and 1.0')
      expect(error?.message).toContain('Infinity')
    })

    test('rejects -Infinity temperature', () => {
      const error = validateExplainOptions({ temperature: -Infinity })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Temperature must be between 0.0 and 1.0')
      expect(error?.message).toContain('Infinity')
    })
  })

  describe('T049: MaxTokens validation', () => {
    test('rejects maxTokens above 500', () => {
      const error = validateExplainOptions({ maxTokens: 600 })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('MaxTokens must be between 50 and 500')
      expect(error?.message).toContain('600')
      expect(error?.suggestion).toBeTruthy()
    })

    test('rejects maxTokens below 50', () => {
      const error = validateExplainOptions({ maxTokens: 30 })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('MaxTokens must be between 50 and 500')
      expect(error?.message).toContain('30')
    })

    test('rejects non-integer maxTokens', () => {
      const error = validateExplainOptions({ maxTokens: 150.5 })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('MaxTokens must be an integer')
      expect(error?.message).toContain('150.5')
    })

    test('accepts maxTokens at lower boundary (50)', () => {
      const error = validateExplainOptions({ maxTokens: 50 })

      expect(error).toBeUndefined()
    })

    test('accepts maxTokens at upper boundary (500)', () => {
      const error = validateExplainOptions({ maxTokens: 500 })

      expect(error).toBeUndefined()
    })

    test('accepts default maxTokens (150)', () => {
      const error = validateExplainOptions({ maxTokens: 150 })

      expect(error).toBeUndefined()
    })

    test('accepts mid-range maxTokens (200)', () => {
      const error = validateExplainOptions({ maxTokens: 200 })

      expect(error).toBeUndefined()
    })

    test('suggestion mentions recommended token range', () => {
      const error = validateExplainOptions({ maxTokens: 1000 })

      expect(error?.suggestion).toMatch(/100.*200/)
    })
  })

  describe('T050: Timeout validation', () => {
    test('rejects timeout below 5000ms', () => {
      const error = validateExplainOptions({ timeout: 1000 })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Timeout must be between 5000 and 120000 ms')
      expect(error?.message).toContain('1000')
      expect(error?.suggestion).toBeTruthy()
    })

    test('rejects timeout above 120000ms', () => {
      const error = validateExplainOptions({ timeout: 150000 })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Timeout must be between 5000 and 120000 ms')
      expect(error?.message).toContain('150000')
    })

    test('accepts timeout at lower boundary (5000ms)', () => {
      const error = validateExplainOptions({ timeout: 5000 })

      expect(error).toBeUndefined()
    })

    test('accepts timeout at upper boundary (120000ms)', () => {
      const error = validateExplainOptions({ timeout: 120000 })

      expect(error).toBeUndefined()
    })

    test('accepts default timeout (30000ms)', () => {
      const error = validateExplainOptions({ timeout: 30000 })

      expect(error).toBeUndefined()
    })

    test('accepts timeout for cold start (60000ms)', () => {
      const error = validateExplainOptions({ timeout: 60000 })

      expect(error).toBeUndefined()
    })

    test('suggestion mentions default timeout value', () => {
      const error = validateExplainOptions({ timeout: 100 })

      expect(error?.suggestion).toMatch(/30000|30s/)
    })

    test('rejects NaN timeout', () => {
      const error = validateExplainOptions({ timeout: NaN })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Timeout must be between 5000 and 120000 ms')
      expect(error?.message).toContain('NaN')
    })

    test('rejects Infinity timeout', () => {
      const error = validateExplainOptions({ timeout: Infinity })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Timeout must be between 5000 and 120000 ms')
      expect(error?.message).toContain('Infinity')
    })
  })

  describe('T051: Default options merging', () => {
    test('default temperature is 0.5 (balanced)', () => {
      expect(DEFAULT_EXPLAIN_OPTIONS.temperature).toBe(0.5)
    })

    test('default maxTokens is 150', () => {
      expect(DEFAULT_EXPLAIN_OPTIONS.maxTokens).toBe(150)
    })

    test('default timeout is 30000ms (30 seconds)', () => {
      expect(DEFAULT_EXPLAIN_OPTIONS.timeout).toBe(30000)
    })

    test('default useCache is true', () => {
      expect(DEFAULT_EXPLAIN_OPTIONS.useCache).toBe(true)
    })

    test('undefined options should result in defaults being used', () => {
      const error = validateExplainOptions({})

      expect(error).toBeUndefined()
    })

    test('partial options allow undefined values', () => {
      const error = validateExplainOptions({ temperature: 0.5 })

      expect(error).toBeUndefined()
    })

    test('all options can be provided together', () => {
      const error = validateExplainOptions({
        temperature: 0.7,
        maxTokens: 200,
        timeout: 60000,
        useCache: false,
      })

      expect(error).toBeUndefined()
    })
  })

  describe('Cross-option validation', () => {
    test('multiple invalid options report first error only', () => {
      const error = validateExplainOptions({
        temperature: 2.0, // Invalid
        maxTokens: 1000, // Invalid
      })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      // Should report temperature error (checked first)
      expect(error?.message).toContain('Temperature')
    })

    test('valid temperature + invalid maxTokens reports maxTokens error', () => {
      const error = validateExplainOptions({
        temperature: 0.5, // Valid
        maxTokens: 1000, // Invalid
      })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('MaxTokens')
    })

    test('valid temperature + valid maxTokens + invalid timeout reports timeout error', () => {
      const error = validateExplainOptions({
        temperature: 0.5, // Valid
        maxTokens: 150, // Valid
        timeout: 1000, // Invalid
      })

      expect(error).toBeDefined()
      expect(error?.code).toBe('INVALID_INPUT')
      expect(error?.message).toContain('Timeout')
    })

    test('all valid options pass validation', () => {
      const error = validateExplainOptions({
        temperature: 0.7,
        maxTokens: 200,
        timeout: 60000,
        useCache: false,
      })

      expect(error).toBeUndefined()
    })
  })

  describe('Error message quality', () => {
    test('error messages include received value', () => {
      const tempError = validateExplainOptions({ temperature: 1.5 })
      const tokensError = validateExplainOptions({ maxTokens: 600 })
      const timeoutError = validateExplainOptions({ timeout: 1000 })

      expect(tempError?.message).toContain('1.5')
      expect(tokensError?.message).toContain('600')
      expect(timeoutError?.message).toContain('1000')
    })

    test('all errors have non-empty suggestions', () => {
      const tempError = validateExplainOptions({ temperature: 2.0 })
      const tokensError = validateExplainOptions({ maxTokens: 1000 })
      const timeoutError = validateExplainOptions({ timeout: 100 })

      expect(tempError?.suggestion.length).toBeGreaterThan(0)
      expect(tokensError?.suggestion.length).toBeGreaterThan(0)
      expect(timeoutError?.suggestion.length).toBeGreaterThan(0)
    })

    test('suggestions are actionable (mention specific values or ranges)', () => {
      const tempError = validateExplainOptions({ temperature: 2.0 })
      const tokensError = validateExplainOptions({ maxTokens: 1000 })
      const timeoutError = validateExplainOptions({ timeout: 100 })

      // Temperature suggestion should mention 0.3-0.7 range (specific)
      expect(tempError?.suggestion).toMatch(/0\.3.*0\.7/)

      // MaxTokens suggestion should mention 100-200 range (specific)
      expect(tokensError?.suggestion).toMatch(/100.*200/)

      // Timeout suggestion should mention 30000ms or 30s (specific)
      expect(timeoutError?.suggestion).toMatch(/30000|30s/)
    })
  })

  describe('createExplanationError factory', () => {
    test('creates error with all required fields', () => {
      const error = createExplanationError('INVALID_INPUT', 'Test message', 'Test suggestion')

      expect(error.code).toBe('INVALID_INPUT')
      expect(error.message).toBe('Test message')
      expect(error.suggestion).toBe('Test suggestion')
    })

    test('handles all error codes', () => {
      const codes = [
        'MODEL_UNAVAILABLE',
        'TIMEOUT',
        'INVALID_INPUT',
        'INSUFFICIENT_RAM',
        'CORRUPTED_MODEL',
      ] as const

      codes.forEach((code) => {
        const error = createExplanationError(code, 'Message', 'Suggestion')
        expect(error.code).toBe(code)
      })
    })
  })
})
