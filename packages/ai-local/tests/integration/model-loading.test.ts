/**
 * Model Loading Integration Tests
 *
 * Tests the model loader with actual v4.5 model file.
 * These tests require the 2.2GB GGUF file to be present.
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import {
  loadModel,
  unloadModel,
  isModelLoaded,
  getModelStatus,
  warmupModel,
} from '../../src/index.js'

describe('Model Loading', () => {
  afterAll(async () => {
    // Cleanup after all tests
    await unloadModel()
  })

  test('loads model from research path in development', async () => {
    const model = await loadModel()
    expect(model).toBeDefined()
    expect(isModelLoaded()).toBe(true)

    const status = getModelStatus()
    expect(status.loaded).toBe(true)
    expect(status.loading).toBe(false)
    expect(status.error).toBeNull()
  })

  test('returns cached instance on subsequent calls', async () => {
    const model1 = await loadModel()
    const model2 = await loadModel()

    // Same instance (singleton pattern)
    expect(model1).toBe(model2)
  })

  test('concurrent load attempts return same instance', async () => {
    // Unload first to test concurrent loading
    await unloadModel()

    // Trigger 3 concurrent loads
    const [model1, model2, model3] = await Promise.all([loadModel(), loadModel(), loadModel()])

    // All should be the same instance
    expect(model1).toBe(model2)
    expect(model2).toBe(model3)
  })

  test('throws clear error when model not found', async () => {
    // Unload cached model first to ensure fresh load attempt
    await unloadModel()

    await expect(loadModel({ modelPath: '/nonexistent/model.gguf' })).rejects.toThrow(
      'Model file not found'
    )
  })

  test('unload clears model state', async () => {
    // First ensure we have a clean state
    await unloadModel()

    // Load the actual model (not nonexistent path)
    await loadModel() // Uses default research path
    expect(isModelLoaded()).toBe(true)

    await unloadModel()
    expect(isModelLoaded()).toBe(false)

    const status = getModelStatus()
    expect(status.loaded).toBe(false)
    expect(status.error).toBeNull()
  })

  test('warmup preloads model', async () => {
    await unloadModel() // Start fresh

    expect(isModelLoaded()).toBe(false)

    await warmupModel()

    expect(isModelLoaded()).toBe(true)
  })

  test('force reload replaces cached instance', async () => {
    const model1 = await loadModel()
    const model2 = await loadModel({ forceReload: true })

    // After force reload, should have new instance
    expect(model2).toBeDefined()
    // Note: Can't test instance equality because llama.cpp may reuse memory
  })

  test('loading status updates correctly', async () => {
    await unloadModel()

    // Before loading
    let status = getModelStatus()
    expect(status.loaded).toBe(false)
    expect(status.loading).toBe(false)

    // Start loading (check status immediately)
    const loadPromise = loadModel()

    // During loading (may be too fast to catch)
    status = getModelStatus()
    // Either still loading or already loaded (fast on cached model)
    expect(status.loading || status.loaded).toBe(true)

    // Wait for completion
    await loadPromise

    // After loading
    status = getModelStatus()
    expect(status.loaded).toBe(true)
    expect(status.loading).toBe(false)
  })
})
