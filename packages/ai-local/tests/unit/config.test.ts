/**
 * Configuration Unit Tests
 *
 * Tests Phase 3 Fix #11: Type guards
 */

import { describe, test, expect } from 'vitest'
import {
  MODEL_CONFIG,
  INFERENCE_CONFIG,
  HARDWARE_CONFIG,
  KNOWN_WEAKNESSES,
  isValidTemperature,
  isValidMaxTokens,
  setLogger,
  type LoggerCallback,
} from '../../src/index.js'

describe('Configuration', () => {
  describe('MODEL_CONFIG', () => {
    test('has correct model name', () => {
      expect(MODEL_CONFIG.modelName).toBe('music-reasoning-core3b-v4.5-q4km.gguf')
    })

    test('has correct model size', () => {
      expect(MODEL_CONFIG.modelSize).toBe(2.2 * 1024 * 1024 * 1024) // 2.2GB
    })

    test('has default model path', () => {
      expect(MODEL_CONFIG.defaultModelPath).toContain('.cache')
      expect(MODEL_CONFIG.defaultModelPath).toContain('music-reasoning-sdk')
    })

    test('has research model path', () => {
      expect(MODEL_CONFIG.researchModelPath).toContain('specs')
      expect(MODEL_CONFIG.researchModelPath).toContain('004-research-and-validate')
      expect(MODEL_CONFIG.researchModelPath).toContain('phase3-v4')
    })
  })

  describe('INFERENCE_CONFIG', () => {
    test('has temperature presets', () => {
      expect(INFERENCE_CONFIG.temperature.factual).toBe(0.3)
      expect(INFERENCE_CONFIG.temperature.creative).toBe(0.5)
      expect(INFERENCE_CONFIG.temperature.highlyCreative).toBe(0.7)
      expect(INFERENCE_CONFIG.temperature.default).toBe(0.5)
    })

    test('has maxTokens range', () => {
      expect(INFERENCE_CONFIG.maxTokens.min).toBe(100)
      expect(INFERENCE_CONFIG.maxTokens.default).toBe(150)
      expect(INFERENCE_CONFIG.maxTokens.max).toBe(200)
    })

    test('has sampling parameters', () => {
      expect(INFERENCE_CONFIG.topP).toBe(0.9)
      expect(INFERENCE_CONFIG.topK).toBe(40)
      expect(INFERENCE_CONFIG.repeatPenalty).toBe(1.1)
    })

    test('has context size', () => {
      expect(INFERENCE_CONFIG.contextSize).toBe(4096)
    })

    test('has timeout (Phase 1 Fix #4)', () => {
      expect(INFERENCE_CONFIG.timeoutMs).toBe(30000) // 30 seconds
    })
  })

  describe('HARDWARE_CONFIG', () => {
    test('has GPU layers setting', () => {
      expect(HARDWARE_CONFIG.gpuLayers).toBe(99)
    })

    test('has threads setting', () => {
      expect(HARDWARE_CONFIG.threads).toBeUndefined() // Auto-detect
    })
  })

  describe('KNOWN_WEAKNESSES', () => {
    test('documents backdoor progression weakness', () => {
      expect(KNOWN_WEAKNESSES.backdoorProgression.accuracy).toBe(0)
      expect(KNOWN_WEAKNESSES.backdoorProgression.description).toContain('bVII7')
      expect(KNOWN_WEAKNESSES.backdoorProgression.workaround).toBeDefined()
      expect(KNOWN_WEAKNESSES.backdoorProgression.plannedFix).toContain('v4.8')
    })
  })

  describe('Type Guards (Phase 3 Fix #11)', () => {
    describe('isValidTemperature', () => {
      test('accepts valid temperatures', () => {
        expect(isValidTemperature(0)).toBe(true)
        expect(isValidTemperature(0.3)).toBe(true)
        expect(isValidTemperature(0.5)).toBe(true)
        expect(isValidTemperature(1)).toBe(true)
      })

      test('rejects invalid temperatures', () => {
        expect(isValidTemperature(-0.1)).toBe(false)
        expect(isValidTemperature(1.1)).toBe(false)
        expect(isValidTemperature('0.5')).toBe(false)
        expect(isValidTemperature(null)).toBe(false)
        expect(isValidTemperature(undefined)).toBe(false)
        expect(isValidTemperature(NaN)).toBe(false)
      })
    })

    describe('isValidMaxTokens', () => {
      test('accepts valid token counts', () => {
        expect(isValidMaxTokens(100)).toBe(true)
        expect(isValidMaxTokens(150)).toBe(true)
        expect(isValidMaxTokens(200)).toBe(true)
      })

      test('rejects invalid token counts', () => {
        expect(isValidMaxTokens(99)).toBe(false) // Below min
        expect(isValidMaxTokens(201)).toBe(false) // Above max
        expect(isValidMaxTokens('150')).toBe(false)
        expect(isValidMaxTokens(null)).toBe(false)
        expect(isValidMaxTokens(undefined)).toBe(false)
        expect(isValidMaxTokens(-1)).toBe(false)
      })
    })
  })

  describe('Logger (Phase 2 Fix #5)', () => {
    test('setLogger accepts callback', () => {
      const logs: Array<{ level: string; message: string }> = []
      const callback: LoggerCallback = (level, message) => {
        logs.push({ level, message })
      }

      setLogger(callback)
      // Can't easily test logging without triggering model load
      // This test just ensures the API works

      setLogger(null) // Reset
    })

    test('setLogger accepts null to disable', () => {
      setLogger(null)
      // Should not throw
      expect(true).toBe(true)
    })
  })
})
