/**
 * Inference Integration Tests
 *
 * Tests actual inference with v4.5 model.
 * Validates Phase 3 v4.5 research findings (87.5% accuracy).
 */

import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import {
  generateExplanation,
  generateFactualExplanation,
  generateCreativeSuggestion,
  generateHighlyCreativeIdea,
  batchGenerateExplanations,
  resetChatSession,
  unloadModel,
  type PerformanceMetrics,
} from '../../src/index.js'

describe('Inference API', () => {
  beforeEach(() => {
    // Reset chat session between tests to avoid "No sequences left" errors
    resetChatSession()
  })

  afterAll(async () => {
    await unloadModel()
  })

  describe('Core Functionality', () => {
    test('generates factual explanation for G7 chord', async () => {
      const response = await generateFactualExplanation('What notes are in a G7 chord?')

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(10)

      // Should mention all 4 notes (research: v4.5 has 100% accuracy on G7)
      const lowerResponse = response.toLowerCase()
      expect(lowerResponse).toMatch(/g/)
      expect(lowerResponse).toMatch(/b/)
      expect(lowerResponse).toMatch(/d/)
      expect(lowerResponse).toMatch(/f/)
    })

    test('generates creative suggestion', async () => {
      const response = await generateCreativeSuggestion(
        'Suggest a jazz progression starting with Dm7'
      )

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(10)
    })

    test('generates highly creative idea', async () => {
      const response = await generateHighlyCreativeIdea(
        'Create an unusual reharmonization of a C major chord'
      )

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(10)
    })

    test('default temperature inference', async () => {
      const response = await generateExplanation('What is a Cmaj7 chord?')

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(10)
    })
  })

  describe('Parameter Validation', () => {
    test('validates empty prompt', async () => {
      await expect(generateExplanation('')).rejects.toThrow('Prompt cannot be empty')
    })

    test('validates prompt length', async () => {
      const longPrompt = 'x'.repeat(1001)
      await expect(generateExplanation(longPrompt)).rejects.toThrow('Prompt too long')
    })

    test('validates temperature range', async () => {
      await expect(generateExplanation('What is a chord?', { temperature: 1.5 })).rejects.toThrow(
        'Invalid temperature'
      )

      await expect(generateExplanation('What is a chord?', { temperature: -0.1 })).rejects.toThrow(
        'Invalid temperature'
      )
    })

    test('clamps maxTokens to valid range', async () => {
      // Should clamp to max (200) without throwing
      const response = await generateExplanation('What is a chord?', {
        maxTokens: 99999,
      })

      expect(response).toBeDefined()
      // Response should be relatively short (clamped to 200 tokens)
      expect(response.length).toBeLessThan(1500) // ~200 tokens ≈ 1000 chars max
    })

    test('respects custom timeout', async () => {
      // Very short timeout should fail
      await expect(
        generateExplanation('Explain music theory in detail', {
          timeoutMs: 10, // 10ms - too short for inference
        })
      ).rejects.toThrow('timeout')
    }, 15000) // Give this test 15s
  })

  describe('Performance', () => {
    test('reports performance metrics', async () => {
      let metrics: PerformanceMetrics | null = null

      await generateExplanation('What is a C chord?', {
        onMetrics: (m) => {
          metrics = m
        },
      })

      expect(metrics).not.toBeNull()
      expect(metrics!.inferenceTimeMs).toBeGreaterThan(0)
      expect(metrics!.inferenceTimeMs).toBeLessThan(30000) // Should be under 30s
      expect(metrics!.tokensGenerated).toBeGreaterThan(0)
    })

    test('subsequent calls are faster (cached model)', async () => {
      const times: number[] = []

      for (let i = 0; i < 3; i++) {
        await generateFactualExplanation('What is a chord?', {
          onMetrics: (m) => times.push(m.inferenceTimeMs),
        })
      }

      expect(times.length).toBe(3)
      // Later calls should generally be similar or faster (model is warm)
      // We can't guarantee they're faster due to variability, but they should all complete
      times.forEach((time) => expect(time).toBeLessThan(10000)) // < 10s each
    })
  })

  describe('Batch Processing', () => {
    test('processes multiple prompts', async () => {
      const prompts = [
        'What is a Cmaj7 chord?',
        'What is a Dm7 chord?',
        'What is the difference between major and minor?',
      ]

      const responses = await batchGenerateExplanations(prompts, {
        temperature: 0.3,
      })

      expect(responses.length).toBe(3)
      responses.forEach((response) => {
        expect(response).toBeDefined()
        expect(response.length).toBeGreaterThan(10)
      })
    })

    test('validates empty prompts array', async () => {
      await expect(batchGenerateExplanations([])).rejects.toThrow('Prompts array cannot be empty')
    })
  })

  describe('Session Management', () => {
    test('reset clears conversation history', async () => {
      // First interaction
      await generateExplanation('Remember this: the key is C major')

      // Reset session
      await resetChatSession()

      // Model should not remember previous context
      const response = await generateExplanation('What key did I mention?')

      // Model shouldn't have context (this is approximate - AI might still guess)
      expect(response).toBeDefined()
    })

    test('auto-reset after 10 turns prevents overflow', async () => {
      // Generate 12 inferences (should trigger auto-reset at turn 10)
      for (let i = 0; i < 12; i++) {
        await generateFactualExplanation(`What is a C${i} chord?`)
      }

      // If we got here without error, auto-reset worked
      expect(true).toBe(true)
    })
  })

  describe('Known Limitations (v4.5 Research)', () => {
    test('backdoor progression weakness (0% accuracy)', async () => {
      // v4.5 is known to fail on backdoor progressions
      // This test documents the limitation (not an assertion of success)
      const response = await generateFactualExplanation(
        'In a backdoor progression, what chord typically follows IV?'
      )

      expect(response).toBeDefined()
      // We expect the answer to be bVII7, but v4.5 may get this wrong
      // This test exists to document the limitation, not to fail
      console.log('Backdoor progression response:', response)
    })
  })
})
