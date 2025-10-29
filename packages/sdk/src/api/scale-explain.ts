/**
 * Scale explanation API with AI-powered natural language descriptions
 * Follows the hybrid intelligence pattern: deterministic first, AI enhancement second
 */

import type { ScaleInfo } from '@music-reasoning/types'
import type { ExplainOptions, ExplanationResult } from '../types/explain'
import { DEFAULT_EXPLAIN_OPTIONS } from '../types/explain'
import { validateExplainOptions, createExplanationError } from '../types/errors'
import { HybridCache } from '../cache/cache-manager'
import type { CacheEntry } from '../cache/types'
import { getScale } from '@music-reasoning/core'
import {
  generateExplanation,
  loadModel,
  isModelLoaded,
  type InferenceOptions,
} from '@music-reasoning/ai-local'

/**
 * Singleton cache instance for scale explanation caching
 * Shared across all explain() calls for maximum cache efficiency
 */
const scaleExplanationCache = new HybridCache()

/**
 * Shared model loading promise for concurrency control
 * Reused from chord-explain.ts pattern
 */
let modelLoadPromise: Promise<void> | null = null
let isLoadingModel = false

/**
 * Sentinel value for invalid scale information
 * Used when scale lookup fails due to invalid input
 */
const INVALID_SCALE: ScaleInfo = {
  scale: 'Invalid',
  root: '',
  type: '',
  notes: [],
  intervals: [],
  degrees: [],
  formula: '',
  modes: [],
}

/**
 * Ensures the AI model is loaded before generating explanations.
 * Implements polling loop pattern to avoid recursive stack buildup (Fix #3)
 */
async function ensureModelLoaded(): Promise<void> {
  // Fast path: model already loaded
  if (isModelLoaded()) {
    return
  }

  // Wait pattern: load in progress, reuse existing promise
  if (modelLoadPromise) {
    return modelLoadPromise
  }

  // Race condition protection: another call might be setting up the promise
  if (isLoadingModel) {
    // Spin-wait for the promise to be created (should be near-instant)
    // Max 1 second wait (100 iterations * 10ms) to prevent infinite loop edge case
    let spinCount = 0
    const MAX_SPIN_ITERATIONS = 100

    // ESLint thinks modelLoadPromise is always falsy here, but concurrent calls can modify it
    while (spinCount < MAX_SPIN_ITERATIONS) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (modelLoadPromise) {
        return modelLoadPromise
      }
      await new Promise((resolve) => setTimeout(resolve, 10))
      spinCount++
    }

    // Final check after spin-wait completes
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (modelLoadPromise) {
      return modelLoadPromise
    }
  }

  // Atomic load initiation
  isLoadingModel = true
  modelLoadPromise = loadModel()
    .then(() => {
      isLoadingModel = false
    })
    .catch((err: unknown) => {
      isLoadingModel = false
      modelLoadPromise = null // Reset to allow retry
      throw err
    })

  return modelLoadPromise
}

/**
 * Generates a normalized cache key for scale explanations
 *
 * @param root - Root note (e.g., "C", "F#", "Bb")
 * @param scaleType - Scale type (e.g., "major", "minor", "dorian")
 * @param options - Explanation options (temperature affects cache key)
 * @returns Normalized cache key
 *
 * @remarks
 * Normalization rules:
 * - Root: Uppercase first letter, preserve accidentals (C#, Bb)
 * - Type: Lowercase, trimmed
 * - Format: "root-type-temp0.5-tokens150"
 *
 * @example
 * ```typescript
 * generateScaleCacheKey("c", "Major", { temperature: 0.5 })
 * // Returns: "C-major-temp0.5-tokens150"
 *
 * generateScaleCacheKey("F#", "dorian", { temperature: 0.7 })
 * // Returns: "F#-dorian-temp0.7-tokens150"
 * ```
 */
function generateScaleCacheKey(
  root: string,
  scaleType: string,
  options: Required<ExplainOptions>
): string {
  // Normalize root: uppercase first letter, preserve accidentals
  const normalizedRoot = root.charAt(0).toUpperCase() + root.slice(1)

  // Normalize type: lowercase, trimmed
  const normalizedType = scaleType.trim().toLowerCase()

  // Include temperature and maxTokens in cache key (affects output)
  return `${normalizedRoot}-${normalizedType}-temp${String(options.temperature)}-tokens${String(options.maxTokens)}`
}

/**
 * Explains a musical scale with AI-powered natural language description.
 *
 * @param root - Root note of the scale (e.g., "C", "F#", "Bb")
 * @param scaleType - Type of scale (e.g., "major", "minor", "dorian", "mixolydian")
 * @param options - Optional configuration for AI inference and caching
 * @returns Promise resolving to ExplanationResult with scale info and optional AI explanation
 *
 * @remarks
 * **Hybrid Intelligence Pattern:**
 * 1. **Deterministic first**: Calls `getScale()` from @music-reasoning/core
 * 2. **AI enhancement**: Generates 2-4 sentence explanation using local AI model
 * 3. **Smart caching**: Normalized cache keys (24h TTL, 1000 entry LRU)
 * 4. **Graceful degradation**: Returns scale data even if AI fails
 *
 * **Performance:**
 * - Cache hit: <50ms (instant retrieval)
 * - Warm inference: 0.8-2.5s (model already loaded)
 * - Cold start: 3-6s (includes model loading)
 *
 * **Error Handling:**
 * - Invalid root/type → Returns INVALID_SCALE with error
 * - Model unavailable → Returns scale data with MODEL_UNAVAILABLE error
 * - Timeout → Returns scale data with TIMEOUT error
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await scale.explain('C', 'major');
 * console.log(result.data.notes); // ['C', 'D', 'E', 'F', 'G', 'A', 'B']
 * console.log(result.explanation); // "The C major scale is the most..."
 *
 * // With configuration
 * const result = await scale.explain('D', 'dorian', {
 *   temperature: 0.3, // Factual tone
 *   maxTokens: 100,   // Concise explanation
 *   useCache: true    // Enable caching
 * });
 *
 * // Graceful degradation example
 * const result = await scale.explain('G', 'lydian');
 * if (result.error) {
 *   console.log('AI unavailable:', result.error.message);
 *   console.log('But deterministic data works:', result.data.notes);
 * }
 * ```
 */
export async function explain(
  root: string,
  scaleType: string,
  options?: Partial<ExplainOptions>
): Promise<ExplanationResult<ScaleInfo>> {
  // Input validation
  if (!root || typeof root !== 'string' || root.trim().length === 0) {
    return {
      data: INVALID_SCALE,
      error: createExplanationError(
        'INVALID_INPUT',
        'Root note must be a non-empty string',
        'Provide a valid root note (e.g., "C", "F#", "Bb")'
      ),
    }
  }

  if (!scaleType || typeof scaleType !== 'string' || scaleType.trim().length === 0) {
    return {
      data: INVALID_SCALE,
      error: createExplanationError(
        'INVALID_INPUT',
        'Scale type must be a non-empty string',
        'Provide a valid scale type (e.g., "major", "minor", "dorian")'
      ),
    }
  }

  // Trim inputs to normalize whitespace (Fix #2)
  // This ensures consistent cache keys and deterministic lookups
  const trimmedRoot = root.trim()
  const trimmedType = scaleType.trim()

  // Validate options
  const validationError = validateExplainOptions(options ?? {})
  if (validationError) {
    // Try to get deterministic data even with invalid options
    try {
      const scaleData = getScale(trimmedRoot, trimmedType)
      return {
        data: scaleData,
        error: validationError,
      }
    } catch {
      // Both options and scale lookup failed
      return {
        data: INVALID_SCALE,
        error: validationError,
      }
    }
  }

  // Merge with defaults
  const mergedOptions: Required<ExplainOptions> = {
    ...DEFAULT_EXPLAIN_OPTIONS,
    ...options,
  }

  // Generate cache key (using trimmed values for consistency)
  const cacheKey = generateScaleCacheKey(trimmedRoot, trimmedType, mergedOptions)

  // Deterministic scale lookup (ALWAYS execute, even if AI fails)
  let scaleData: ScaleInfo
  try {
    scaleData = getScale(trimmedRoot, trimmedType)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return {
      data: INVALID_SCALE,
      error: createExplanationError(
        'INVALID_INPUT',
        `Unable to get scale: ${error.message}`,
        'Check that root note and scale type are valid (e.g., "C major", "D dorian")'
      ),
    }
  }

  // Check cache first (if enabled)
  if (mergedOptions.useCache) {
    const cached = scaleExplanationCache.get(cacheKey)
    if (cached) {
      return {
        data: scaleData,
        explanation: cached.explanation,
      }
    }
  }

  // AI explanation generation
  try {
    // Load model if needed
    await ensureModelLoaded()

    // Construct prompt for scale explanation
    const prompt = `Explain the ${scaleData.scale} scale in 2-4 sentences. Include:
1. The scale formula (${scaleData.formula})
2. Its characteristic sound and mood
3. Common usage in music
4. One or two famous songs that use this scale

Notes: ${scaleData.notes.join(', ')}
Intervals: ${scaleData.intervals.join(', ')}`

    // Forward timeout to @music-reasoning/ai-local (it handles timeout internally)
    const inferenceOptions: InferenceOptions = {
      temperature: mergedOptions.temperature,
      maxTokens: mergedOptions.maxTokens,
      timeoutMs: mergedOptions.timeout, // Forward user's timeout to AI layer
    }

    const explanation = await generateExplanation(prompt, inferenceOptions)

    // Cache the result
    if (mergedOptions.useCache) {
      const cacheEntry: CacheEntry = {
        key: cacheKey,
        explanation,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        options: mergedOptions,
      }
      scaleExplanationCache.set(cacheEntry)
    }

    return {
      data: scaleData,
      explanation,
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))

    // Enhanced error categorization (matches chord-explain.ts pattern)
    // Check timeout FIRST (most specific error)
    if (error.message.toLowerCase().includes('timeout')) {
      return {
        data: scaleData,
        error: createExplanationError(
          'TIMEOUT',
          `AI inference timeout after ${String(mergedOptions.timeout)}ms`,
          `Increase timeout option or use faster hardware (current: ${String(mergedOptions.timeout)}ms, try: ${String(mergedOptions.timeout * 2)}ms)`
        ),
      }
    } else if (
      error.message.toLowerCase().includes('model') ||
      error.message.toLowerCase().includes('not found')
    ) {
      return {
        data: scaleData,
        error: createExplanationError(
          'MODEL_UNAVAILABLE',
          'AI model not found or failed to load',
          'Download the v4.5 model (2.2GB) or continue using deterministic features without AI explanations'
        ),
      }
    } else if (
      error.message.toLowerCase().includes('memory') ||
      error.message.toLowerCase().includes('ram')
    ) {
      return {
        data: scaleData,
        error: createExplanationError(
          'INSUFFICIENT_RAM',
          'Insufficient memory to load AI model',
          'Close other applications or use a machine with 4GB+ available RAM'
        ),
      }
    } else if (error.message.toLowerCase().includes('corrupt')) {
      return {
        data: scaleData,
        error: createExplanationError(
          'CORRUPTED_MODEL',
          'AI model file corrupted or invalid',
          'Re-download the v4.5 model (2.2GB) or verify file integrity'
        ),
      }
    }

    // Unknown AI error
    return {
      data: scaleData,
      error: createExplanationError(
        'MODEL_UNAVAILABLE',
        `AI error: ${error.message}`,
        'Continue using deterministic scale data or check logs for details'
      ),
    }
  }
}
