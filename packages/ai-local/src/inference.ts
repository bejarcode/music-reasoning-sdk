/**
 * Inference API for music theory explanations
 * Implements Week 1-2 Task #5 from research.md Section 10
 */

import { LlamaChatSession } from 'node-llama-cpp'
import {
  loadModel,
  createContext,
  createChatSession,
  resetContext,
  type ModelLoaderOptions,
} from './loader.js'
import { INFERENCE_CONFIG, log, isValidTemperature } from './config.js'

/**
 * Performance metrics for inference monitoring
 */
export interface PerformanceMetrics {
  /**
   * Model load time (only present on first call)
   */
  modelLoadTimeMs?: number

  /**
   * Inference time (prompt generation)
   */
  inferenceTimeMs: number

  /**
   * Tokens generated (if available)
   */
  tokensGenerated?: number
}

/**
 * Inference options
 */
export interface InferenceOptions {
  /**
   * Temperature (creativity level)
   * - 0.3: Factual (chord definitions, theory rules)
   * - 0.5: Creative (progression suggestions) - DEFAULT
   * - 0.7: Highly creative (reharmonization, voicing)
   */
  temperature?: number

  /**
   * Max tokens to generate (response length)
   * Default: 150 (optimal for 2-4 sentence explanations)
   */
  maxTokens?: number

  /**
   * Inference timeout in milliseconds
   * Default: 30000 (30 seconds - constitutional requirement)
   */
  timeoutMs?: number

  /**
   * Performance metrics callback (for monitoring)
   */
  onMetrics?: (metrics: PerformanceMetrics) => void

  /**
   * Custom model loader options (for advanced users)
   */
  modelOptions?: ModelLoaderOptions
}

/**
 * Cached chat session (reuse across multiple inference calls)
 */
let chatSessionInstance: LlamaChatSession | null = null

/**
 * Conversation turn counter for automatic context reset
 */
let conversationTurns = 0

/**
 * Maximum conversation turns before auto-reset
 * Prevents context window overflow
 */
const MAX_CONVERSATION_TURNS = 10

/**
 * Maximum prompt length (characters)
 * ~1000 chars ≈ 200-250 tokens
 */
const MAX_PROMPT_LENGTH = 1000

/**
 * Retry helper for transient failures
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum retry attempts
 * @param delayMs - Delay between retries
 * @returns Result of function
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error
      }

      // Don't retry validation errors or timeouts
      const errorMessage = (error as Error).message
      if (
        errorMessage.includes('Prompt') ||
        errorMessage.includes('temperature') ||
        errorMessage.includes('timeout')
      ) {
        throw error
      }

      log(
        'warn',
        `Inference attempt ${String(attempt + 1)} failed, retrying in ${String(delayMs)}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw new Error('withRetry: unreachable') // TypeScript satisfaction
}

/**
 * Generate music theory explanation
 *
 * **Main API**: This is the primary entry point for AI-powered explanations.
 *
 * **Lazy Loading**: Model loads on first call (~2-5s), cached for subsequent calls (~0ms overhead)
 *
 * **Temperature Guide**:
 * - Factual (0.3): "What notes are in a G7 chord?"
 * - Creative (0.5): "Suggest a jazz progression starting with Dm7"
 * - Highly Creative (0.7): "How can I reharmonize this C major chord?"
 *
 * @param prompt - User's music theory question
 * @param options - Inference configuration
 * @returns AI-generated explanation (2-4 sentences typically)
 *
 * @throws Error if model fails to load or inference fails
 *
 * @example
 * ```typescript
 * // Factual question (low temperature)
 * const explanation = await generateExplanation(
 *   "What notes are in a G7 chord?",
 *   { temperature: 0.3 }
 * );
 * // Expected: "A G7 chord contains G, B, D, and F..."
 *
 * // Creative suggestion (default temperature)
 * const suggestion = await generateExplanation(
 *   "Suggest a jazz progression starting with Dm7"
 * );
 * // Expected: "After Dm7, try G7 → Cmaj7 (the classic ii-V-I)..."
 *
 * // Highly creative reharmonization (high temperature)
 * const reharmonization = await generateExplanation(
 *   "How can I reharmonize a C major chord?",
 *   { temperature: 0.7 }
 * );
 * // Expected: "Try substituting C major with Cmaj7, Em7, or Am/C..."
 * ```
 */
export async function generateExplanation(
  prompt: string,
  options: InferenceOptions = {}
): Promise<string> {
  // Validate input
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty')
  }

  if (prompt.trim().length > MAX_PROMPT_LENGTH) {
    throw new Error(
      `Prompt too long (${String(prompt.length)} chars, max ${String(MAX_PROMPT_LENGTH)}). ` +
        `Long prompts may cause slow inference or context overflow. ` +
        `Consider breaking your question into smaller parts.`
    )
  }

  // Validate temperature if provided
  if (options.temperature !== undefined && !isValidTemperature(options.temperature)) {
    throw new Error(`Invalid temperature: ${String(options.temperature)}. Must be between 0 and 1.`)
  }

  // Load model (lazy initialization)
  const model = await loadModel(options.modelOptions)

  // Create context and chat session (cached)
  if (!chatSessionInstance) {
    const context = await createContext(model, options.modelOptions)
    chatSessionInstance = await createChatSession(context)
  }

  // Generate response with validated parameters
  const temperature = options.temperature ?? INFERENCE_CONFIG.temperature.default

  // Validate and clamp maxTokens to prevent runtime errors
  const maxTokens = Math.max(
    INFERENCE_CONFIG.maxTokens.min,
    Math.min(
      options.maxTokens ?? INFERENCE_CONFIG.maxTokens.default,
      INFERENCE_CONFIG.maxTokens.max
    )
  )

  try {
    // Performance tracking
    const startTime = Date.now()

    // Auto-reset chat session after max turns to prevent context overflow
    conversationTurns++
    if (conversationTurns >= MAX_CONVERSATION_TURNS) {
      log('info', `Auto-resetting chat session after ${String(conversationTurns)} turns`)

      // Reset both session and context to avoid "No sequences left" errors
      chatSessionInstance = null
      resetContext()
      conversationTurns = 0

      // Recreate session
      const model = await loadModel(options.modelOptions)
      const context = await createContext(model, options.modelOptions)
      chatSessionInstance = await createChatSession(context)
    }

    // Create inference promise with retry logic
    // TypeScript knows chatSessionInstance is non-null here (initialized above)
    const inferencePromise = withRetry(() =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- chatSessionInstance is guaranteed non-null after initialization
      chatSessionInstance!.prompt(prompt, {
        temperature,
        maxTokens,
        topP: INFERENCE_CONFIG.topP,
        topK: INFERENCE_CONFIG.topK,
        // RepeatPenalty type expects an object, not a number
        repeatPenalty: {
          penalty: INFERENCE_CONFIG.repeatPenalty,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
      })
    )

    // Create timeout promise
    const timeoutMs = options.timeoutMs ?? INFERENCE_CONFIG.timeoutMs
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Inference timeout after ${String(timeoutMs)}ms`))
      }, timeoutMs)
    })

    // Race between inference and timeout
    const response = await Promise.race([inferencePromise, timeoutPromise])

    // Report performance metrics
    const inferenceTimeMs = Date.now() - startTime
    if (options.onMetrics) {
      options.onMetrics({
        inferenceTimeMs,
        tokensGenerated: response.split(/\s+/).length, // Rough estimate
      })
    }

    return response.trim()
  } catch (error) {
    // Preserve error context for debugging
    const originalError = error as Error
    const contextError = new Error(
      `Inference failed: ${originalError.message}\n` +
        `Context:\n` +
        `  Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}\n` +
        `  Temperature: ${String(temperature)}\n` +
        `  MaxTokens: ${String(maxTokens)}\n` +
        `  Timeout: ${String(options.timeoutMs ?? INFERENCE_CONFIG.timeoutMs)}ms`
    )
    // Preserve original stack trace
    contextError.cause = originalError
    throw contextError
  }
}

/**
 * Generate factual explanation (low temperature = 0.3)
 *
 * **Use case**: Chord definitions, interval calculations, theory rules
 *
 * @example
 * ```typescript
 * const explanation = await generateFactualExplanation(
 *   "What is the formula for a dominant 7th chord?"
 * );
 * // Expected: "A dominant 7th chord has the formula root + M3 + P5 + m7..."
 * ```
 */
export async function generateFactualExplanation(
  prompt: string,
  options: Omit<InferenceOptions, 'temperature'> = {}
): Promise<string> {
  return generateExplanation(prompt, {
    ...options,
    temperature: INFERENCE_CONFIG.temperature.factual,
  })
}

/**
 * Generate creative suggestion (medium temperature = 0.5)
 *
 * **Use case**: Progression suggestions, chord substitutions, practice ideas
 *
 * @example
 * ```typescript
 * const suggestion = await generateCreativeSuggestion(
 *   "Suggest two reharmonization options for a ii-V-I in C major"
 * );
 * // Expected: "1. Tritone substitution: Dm7-Db7-Cmaj7..."
 * ```
 */
export async function generateCreativeSuggestion(
  prompt: string,
  options: Omit<InferenceOptions, 'temperature'> = {}
): Promise<string> {
  return generateExplanation(prompt, {
    ...options,
    temperature: INFERENCE_CONFIG.temperature.creative,
  })
}

/**
 * Generate highly creative idea (high temperature = 0.7)
 *
 * **Use case**: Advanced reharmonization, voicing exploration, experimental techniques
 *
 * **Warning**: Higher temperature may produce less accurate results.
 * Use for exploration, not definitive answers.
 *
 * @example
 * ```typescript
 * const voicing = await generateHighlyCreativeIdea(
 *   "How would you voice a Cmaj9#11 chord on piano to emphasize the lydian quality?"
 * );
 * // Expected: "Try LH: C-E-B, RH: F#-G-D for a bright, suspended sound..."
 * ```
 */
export async function generateHighlyCreativeIdea(
  prompt: string,
  options: Omit<InferenceOptions, 'temperature'> = {}
): Promise<string> {
  return generateExplanation(prompt, {
    ...options,
    temperature: INFERENCE_CONFIG.temperature.highlyCreative,
  })
}

/**
 * Batch generate explanations for multiple prompts
 *
 * **Use case**: Analyzing multiple chords/progressions in one session
 *
 * **Performance**: Model loads once, reused for all prompts
 *
 * @param prompts - Array of music theory questions
 * @param options - Inference configuration (applied to all prompts)
 * @returns Array of explanations (same order as prompts)
 *
 * @example
 * ```typescript
 * const explanations = await batchGenerateExplanations([
 *   "What notes are in a G7 chord?",
 *   "What notes are in a Cmaj7 chord?",
 *   "What notes are in a Dm7 chord?"
 * ]);
 * ```
 */
export async function batchGenerateExplanations(
  prompts: string[],
  options: InferenceOptions = {}
): Promise<string[]> {
  // Validate input
  if (prompts.length === 0) {
    throw new Error('Prompts array cannot be empty')
  }

  // Pre-load model to avoid repeated initialization
  await loadModel(options.modelOptions)

  // Generate all explanations sequentially (parallel not yet supported)
  const results: string[] = []
  for (const prompt of prompts) {
    const explanation = await generateExplanation(prompt, options)
    results.push(explanation)
  }

  return results
}

/**
 * Reset chat session (clear conversation history)
 *
 * **Use case**: Start fresh conversation without reloading model
 */
export function resetChatSession(): void {
  // Reset both session and context to avoid "No sequences left" errors
  chatSessionInstance = null
  conversationTurns = 0
  resetContext()

  log('info', '✅ Chat session reset')
}
