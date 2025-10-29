/**
 * Model loader with lazy initialization and caching
 * Implements Week 1-2 Task #3 from research.md Section 10
 */

import { LlamaModel, LlamaContext, LlamaChatSession, getLlama } from 'node-llama-cpp'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import { dirname } from 'path'
import { MODEL_CONFIG, INFERENCE_CONFIG, HARDWARE_CONFIG, SYSTEM_PROMPT, log } from './config.js'

/**
 * Model loader state (singleton pattern)
 */
let modelInstance: LlamaModel | null = null
let contextInstance: LlamaContext | null = null
let loadPromise: Promise<LlamaModel> | null = null
let loadError: Error | null = null

/**
 * Cached model path (avoid repeated file system checks)
 */
let resolvedModelPath: string | null = null

/**
 * Model loader options
 */
export interface ModelLoaderOptions {
  /**
   * Custom model path (overrides default cache location)
   */
  modelPath?: string

  /**
   * GPU layers to offload (0 = CPU only, 99 = all layers)
   * Default: 99 (auto-detect Metal/CUDA)
   */
  gpuLayers?: number

  /**
   * Thread count for CPU inference (undefined = auto-detect)
   */
  threads?: number

  /**
   * Context size (token window)
   * Default: 4096 (Phi-3-Mini max)
   */
  contextSize?: number

  /**
   * Force reload even if model is cached
   */
  forceReload?: boolean
}

/**
 * Resolve model path in this priority order:
 * 1. Custom path from options
 * 2. Research model path (development)
 * 3. Cached model path (production)
 *
 * Caches the result to avoid repeated file system checks
 */
function resolveModelPath(customPath?: string): string {
  // Always honor custom path (no caching)
  if (customPath) {
    return customPath
  }

  // Return cached path if available
  if (resolvedModelPath) {
    return resolvedModelPath
  }

  // Development: Check if we're in the monorepo with research model
  if (existsSync(MODEL_CONFIG.researchModelPath)) {
    resolvedModelPath = MODEL_CONFIG.researchModelPath
    return resolvedModelPath
  }

  // Production: Use cached model path
  resolvedModelPath = `${MODEL_CONFIG.defaultModelPath}/${MODEL_CONFIG.modelName}`
  return resolvedModelPath
}

/**
 * Ensure model directory exists
 */
async function ensureModelDirectory(modelPath: string): Promise<void> {
  const dir = dirname(modelPath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

/**
 * Load the v4.5 model with lazy initialization
 *
 * **Lazy Loading**: Model is not loaded until first inference request.
 * This preserves startup speed for applications that may not use AI features.
 *
 * **Caching**: Once loaded, model stays in memory for session duration.
 * Subsequent calls return the cached instance immediately.
 *
 * @param options - Model loader configuration
 * @returns Loaded model instance
 * @throws Error if model file not found or loading fails
 *
 * @example
 * ```typescript
 * // First call: loads model (~2-5 seconds on M1/M2)
 * const model = await loadModel();
 *
 * // Subsequent calls: returns cached instance (~0ms)
 * const sameMod

el = await loadModel();
 * ```
 */
export async function loadModel(options: ModelLoaderOptions = {}): Promise<LlamaModel> {
  // Return cached instance if available
  if (modelInstance && !options.forceReload) {
    return modelInstance
  }

  // Return existing load promise if already loading
  if (loadPromise) {
    return loadPromise
  }

  // Create new load promise
  loadPromise = (async () => {
    loadError = null

    try {
      const modelPath = resolveModelPath(options.modelPath)

      // Ensure model file exists
      if (!existsSync(modelPath)) {
        throw new Error(
          `Model file not found: ${modelPath}\n\n` +
            `Expected locations:\n` +
            `1. Custom path: ${options.modelPath || 'not provided'}\n` +
            `2. Research path: ${MODEL_CONFIG.researchModelPath}\n` +
            `3. Cache path: ${MODEL_CONFIG.defaultModelPath}/${MODEL_CONFIG.modelName}\n\n` +
            `To download the model:\n` +
            `1. Download from research directory (if in monorepo)\n` +
            `2. Or download from Hugging Face (future: automated download)`
        )
      }

      await ensureModelDirectory(modelPath)

      // Initialize llama.cpp
      const llama = await getLlama()

      // Load model with hardware acceleration
      modelInstance = await llama.loadModel({
        modelPath,
        // GPU acceleration (Metal on M1/M2, CUDA on NVIDIA)
        gpuLayers: options.gpuLayers ?? HARDWARE_CONFIG.gpuLayers,
      })

      log('info', `✅ Model loaded: ${modelPath}`)
      log('info', `   Size: ${(MODEL_CONFIG.modelSize / (1024 * 1024 * 1024)).toFixed(1)}GB`)
      log('info', `   GPU layers: ${String(options.gpuLayers ?? HARDWARE_CONFIG.gpuLayers)}`)

      return modelInstance
    } catch (error) {
      loadError = error as Error
      throw error
    } finally {
      // Clear promise so next call can try again
      loadPromise = null
    }
  })()

  return loadPromise
}

/**
 * Create a context for inference
 *
 * **Context**: Manages the conversation state and token generation.
 * Each context has a limited window (4096 tokens for Phi-3-Mini).
 *
 * @param model - Loaded model instance
 * @param options - Context configuration
 * @returns Context instance for inference
 */
export async function createContext(
  model: LlamaModel,
  options: ModelLoaderOptions = {}
): Promise<LlamaContext> {
  // Return cached context if available (single-session use case)
  if (contextInstance && !options.forceReload) {
    return contextInstance
  }

  contextInstance = await model.createContext({
    contextSize: options.contextSize ?? INFERENCE_CONFIG.contextSize,
    threads: options.threads ?? HARDWARE_CONFIG.threads,
  })

  return contextInstance
}

/**
 * Create a chat session with system prompt
 *
 * **Chat Session**: Wraps context with conversation management.
 * Handles system prompts, user messages, and assistant responses.
 *
 * @param context - Context instance
 * @returns Chat session ready for inference
 */
export async function createChatSession(context: LlamaContext): Promise<LlamaChatSession> {
  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
  })

  // Set system prompt (formula-first pattern from research)
  await session.prompt(SYSTEM_PROMPT, {
    // System prompt doesn't need high temperature
    temperature: INFERENCE_CONFIG.temperature.factual,
  })

  return session
}

/**
 * Reset context (for clearing sequences between tests/sessions)
 *
 * **Use case**: Reset context when you get "No sequences left" errors
 */
export function resetContext(): void {
  if (contextInstance) {
    contextInstance = null
    log('info', '✅ Context reset')
  }
}

/**
 * Unload model and free memory
 *
 * **Use case**: Call when shutting down application or switching models.
 * In most cases, keeping the model loaded is preferred (lazy loading pattern).
 */
export function unloadModel(): void {
  if (contextInstance) {
    // Context cleanup is handled by llama.cpp
    contextInstance = null
  }

  if (modelInstance) {
    // Model cleanup is handled by llama.cpp garbage collection
    modelInstance = null
  }

  loadPromise = null
  loadError = null

  log('info', '✅ Model unloaded')
}

/**
 * Check if model is currently loaded
 */
export function isModelLoaded(): boolean {
  return modelInstance !== null
}

/**
 * Get model loading status
 */
export function getModelStatus(): {
  loaded: boolean
  loading: boolean
  error: Error | null
} {
  return {
    loaded: modelInstance !== null,
    loading: loadPromise !== null,
    error: loadError,
  }
}

/**
 * Warmup model with small inference
 *
 * **Use case**: Preload model and eliminate "cold start" penalty for first user-facing inference
 *
 * @param options - Model loader options
 *
 * @example
 * ```typescript
 * // Warmup during app initialization
 * await warmupModel();
 * // First user inference will be fast
 * ```
 */
export async function warmupModel(options?: ModelLoaderOptions): Promise<void> {
  log('info', 'Warming up model...')

  const model = await loadModel(options)
  const context = await createContext(model, options)
  const session = await createChatSession(context)

  // Small warmup inference (discarded)
  await session.prompt('What is a C chord?', {
    temperature: 0.3,
    maxTokens: 50,
  })

  log('info', '✅ Model warmup complete')

  // Note: We keep the session for first real inference
  // User can call resetChatSession() if they want fresh context
}
