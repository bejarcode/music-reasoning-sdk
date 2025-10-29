/**
 * Error Handling Integration Tests
 *
 * Tests Phase 1 Fix #6: Enhanced error context preservation
 */

import { describe, test, expect, afterAll } from 'vitest'
import { generateExplanation, unloadModel } from '../../src/index.js'

describe('Error Handling', () => {
  afterAll(async () => {
    await unloadModel()
  })

  test('error includes prompt context', async () => {
    try {
      // Trigger error with invalid temperature
      await generateExplanation('What is a chord?', { temperature: 5.0 })
      expect.fail('Should have thrown error')
    } catch (error) {
      const errorMessage = (error as Error).message

      // Error should mention temperature validation
      expect(errorMessage).toContain('Invalid temperature')
      expect(errorMessage).toContain('5')
    }
  })

  test('error includes timeout context', async () => {
    try {
      // Very short timeout
      await generateExplanation('Explain all music theory', {
        timeoutMs: 1,
      })
      expect.fail('Should have thrown error')
    } catch (error) {
      const errorMessage = (error as Error).message

      // Should mention timeout
      expect(errorMessage).toContain('timeout')
    }
  })

  test('error preserves cause chain', async () => {
    try {
      await generateExplanation('', {}) // Empty prompt
      expect.fail('Should have thrown error')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('Prompt cannot be empty')
    }
  })

  test('prompt length error is actionable', async () => {
    try {
      const longPrompt = 'x'.repeat(1001)
      await generateExplanation(longPrompt)
      expect.fail('Should have thrown error')
    } catch (error) {
      const errorMessage = (error as Error).message

      // Error should be actionable
      expect(errorMessage).toContain('Prompt too long')
      expect(errorMessage).toContain('1001')
      expect(errorMessage).toContain('1000') // Max length
      expect(errorMessage).toContain('smaller parts') // Suggestion
    }
  })

  test('model not found error is clear', async () => {
    try {
      const { loadModel, unloadModel } = await import('../../src/index.js')
      // Unload cached model first to ensure fresh load attempt
      await unloadModel()
      await loadModel({ modelPath: '/nonexistent/path/model.gguf' })
      expect.fail('Should have thrown error')
    } catch (error) {
      const errorMessage = (error as Error).message

      // Should list expected locations
      expect(errorMessage).toContain('Model file not found')
      expect(errorMessage).toContain('Expected locations')
      expect(errorMessage).toContain('Research path')
      expect(errorMessage).toContain('Cache path')
    }
  })
})
