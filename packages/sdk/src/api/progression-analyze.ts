/**
 * Progression analysis API with AI-powered explanations
 * Combines deterministic pattern matching with AI-generated insights
 */

import type { ProgressionAnalysis } from '@music-reasoning/types'
import type { ExplainOptions, ExplanationResult } from '../types/explain'
import { DEFAULT_EXPLAIN_OPTIONS } from '../types/explain'
import { validateExplainOptions, createExplanationError } from '../types/errors'
import { HybridCache } from '../cache/cache-manager'
import type { CacheEntry } from '../cache/types'
import { analyzeProgression } from '@music-reasoning/core'
import {
  generateExplanation,
  loadModel,
  isModelLoaded,
  type InferenceOptions,
} from '@music-reasoning/ai-local'

/**
 * Singleton cache instance for progression analysis explanations
 * Shared across all analyze() calls for maximum cache efficiency
 */
const progressionExplanationCache = new HybridCache()

/**
 * Shared model loading promise for concurrency control
 * Reused from chord-explain.ts pattern
 */
let modelLoadPromise: Promise<void> | null = null
let isLoadingModel = false

/**
 * Sentinel value for invalid progression analysis
 * Used when progression analysis fails due to invalid input
 */
const INVALID_PROGRESSION: ProgressionAnalysis = {
  key: 'Unknown',
  confidence: 0,
  analysis: [],
  patterns: [],
  genrePatterns: [],
  suggestedGenres: [],
  borrowedChords: [],
  secondaryDominants: [],
  cadences: [],
  loopable: false,
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
 * Generates a normalized cache key for progression explanations
 *
 * @param chords - Array of chord symbols
 * @param options - Explanation options (temperature affects cache key)
 * @returns Normalized cache key
 *
 * @remarks
 * Normalization rules:
 * - Chords: Join with hyphens, preserve case/accidentals
 * - Format: "chord1-chord2-chord3-temp0.5-tokens150"
 *
 * @example
 * ```typescript
 * generateProgressionCacheKey(["Dm7", "G7", "Cmaj7"], { temperature: 0.5 })
 * // Returns: "Dm7-G7-Cmaj7-temp0.5-tokens150"
 *
 * generateProgressionCacheKey(["I", "IV", "V", "I"], { temperature: 0.7 })
 * // Returns: "I-IV-V-I-temp0.7-tokens150"
 * ```
 */
function generateProgressionCacheKey(chords: string[], options: Required<ExplainOptions>): string {
  // Join chords with hyphens (preserve original case/accidentals)
  const chordsKey = chords.join('-')

  // Include temperature and maxTokens in cache key (affects output)
  return `${chordsKey}-temp${String(options.temperature)}-tokens${String(options.maxTokens)}`
}

/**
 * Analyzes a chord progression with AI-powered explanation.
 *
 * @param chords - Array of chord symbols (e.g., ["Dm7", "G7", "Cmaj7"])
 * @param options - Optional configuration for AI inference and caching
 * @returns Promise resolving to ExplanationResult with progression analysis and optional AI explanation
 *
 * @remarks
 * **Hybrid Intelligence Pattern:**
 * 1. **Deterministic analysis**: Calls `analyzeProgression()` from @music-reasoning/core
 * 2. **Genre detection**: Uses `detectGenre()` to identify patterns (jazz ii-V-I, pop I-V-vi-IV, etc.)
 * 3. **AI enhancement**: Generates 3-5 sentence explanation with genre context
 * 4. **Smart caching**: Normalized cache keys (24h TTL, 1000 entry LRU)
 * 5. **Graceful degradation**: Returns analysis even if AI fails
 *
 * **Performance:**
 * - Cache hit: <50ms (instant retrieval)
 * - Warm inference: 1.0-3.0s (model already loaded)
 * - Cold start: 4-7s (includes model loading)
 *
 * **Error Handling:**
 * - Invalid chords → Returns INVALID_PROGRESSION with error
 * - Empty array → Returns error with empty progression
 * - Model unavailable → Returns analysis with MODEL_UNAVAILABLE error
 * - Timeout → Returns analysis with TIMEOUT error
 *
 * @example
 * ```typescript
 * // Basic usage (jazz ii-V-I)
 * const result = await progression.analyze(['Dm7', 'G7', 'Cmaj7']);
 * console.log(result.data.key); // "C major"
 * console.log(result.data.suggestedGenres[0].genre); // "jazz"
 * console.log(result.explanation); // "This is a classic jazz ii-V-I progression..."
 *
 * // Pop progression (I-V-vi-IV)
 * const result = await progression.analyze(['C', 'G', 'Am', 'F']);
 * console.log(result.data.suggestedGenres[0].genre); // "pop"
 * console.log(result.explanation); // "This emotional pop progression..."
 *
 * // With configuration
 * const result = await progression.analyze(['Dm7', 'G7', 'Cmaj7'], {
 *   temperature: 0.3, // Factual tone
 *   maxTokens: 200,   // Detailed explanation
 *   useCache: true    // Enable caching
 * });
 *
 * // Graceful degradation example
 * const result = await progression.analyze(['Am', 'F', 'C', 'G']);
 * if (result.error) {
 *   console.log('AI unavailable:', result.error.message);
 *   console.log('But genre detection works:', result.data.suggestedGenres);
 * }
 * ```
 */
export async function analyze(
  chords: string[],
  options?: Partial<ExplainOptions>
): Promise<ExplanationResult<ProgressionAnalysis>> {
  // Input validation - Runtime safety for JavaScript callers
  if (!Array.isArray(chords)) {
    return {
      data: INVALID_PROGRESSION,
      error: createExplanationError(
        'INVALID_INPUT',
        'Chords must be a non-null array',
        'Provide an array of chord symbols (e.g., ["Dm7", "G7", "Cmaj7"])'
      ),
    }
  }

  if (chords.length === 0) {
    return {
      data: INVALID_PROGRESSION,
      error: createExplanationError(
        'INVALID_INPUT',
        'Chords array cannot be empty',
        'Provide at least 2 chord symbols'
      ),
    }
  }

  if (chords.length < 2) {
    return {
      data: INVALID_PROGRESSION,
      error: createExplanationError(
        'INVALID_INPUT',
        `At least 2 chords required for progression analysis (received: ${String(chords.length)})`,
        'Provide at least 2 chord symbols to analyze harmonic movement'
      ),
    }
  }

  // Trim chord symbols to normalize whitespace (Fix #2)
  // This ensures consistent cache keys and deterministic lookups
  const trimmedChords = chords.map((chord) => chord.trim())

  // Validate options
  const validationError = validateExplainOptions(options ?? {})
  if (validationError) {
    // Try to get deterministic data even with invalid options
    try {
      const progressionData = analyzeProgression(trimmedChords)
      return {
        data: progressionData,
        error: validationError,
      }
    } catch {
      // Both options and progression analysis failed
      return {
        data: INVALID_PROGRESSION,
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
  const cacheKey = generateProgressionCacheKey(trimmedChords, mergedOptions)

  // Deterministic progression analysis (ALWAYS execute, even if AI fails)
  let progressionData: ProgressionAnalysis
  try {
    progressionData = analyzeProgression(trimmedChords)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return {
      data: INVALID_PROGRESSION,
      error: createExplanationError(
        'INVALID_INPUT',
        `Unable to analyze progression: ${error.message}`,
        'Check that chord symbols are valid (e.g., "C", "Dm7", "G7")'
      ),
    }
  }

  // Check cache first (if enabled)
  if (mergedOptions.useCache) {
    const cached = progressionExplanationCache.get(cacheKey)
    if (cached) {
      return {
        data: progressionData,
        explanation: cached.explanation,
      }
    }
  }

  // AI explanation generation
  try {
    // Load model if needed
    await ensureModelLoaded()

    // T068: Integrate genre context into AI prompt
    // Build genre-aware prompt based on detected patterns
    let genreContext = ''
    if (progressionData.suggestedGenres.length > 0) {
      const topGenre = progressionData.suggestedGenres[0]

      // TypeScript needs explicit null check for array indexing (noUncheckedIndexedAccess)
      // ESLint sees this as unnecessary (length > 0 guarantees element), but TS type system requires it
      if (topGenre) {
        genreContext = `\nDetected genre: ${topGenre.genre} (${(topGenre.confidence * 100).toFixed(0)}% confidence)`

        // matchedPatterns is always an array (never undefined) per type definition
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (topGenre.matchedPatterns && topGenre.matchedPatterns.length > 0) {
          const pattern = topGenre.matchedPatterns[0]

          // Same TypeScript/ESLint mismatch for pattern array indexing
          if (pattern) {
            genreContext += `\nPattern: ${pattern.pattern}` // pattern.pattern is the Roman numeral sequence
            if (pattern.description) {
              genreContext += ` - ${pattern.description}`
            }
            if (pattern.examples && pattern.examples.length > 0) {
              genreContext += `\nExample songs: ${pattern.examples.slice(0, 2).join(', ')}`
            }
          }
        }
      }
    }

    // Construct prompt for progression explanation
    const prompt = `Analyze this chord progression: ${trimmedChords.join(' → ')}

Key: ${progressionData.key} (confidence: ${(progressionData.confidence * 100).toFixed(0)}%)${genreContext}

Roman numeral analysis: ${progressionData.analysis.map((a) => a.roman).join(' → ')}

Explain this progression in 3-5 sentences. Include:
1. The harmonic movement and function
2. Why it fits the detected genre (if applicable)
3. The emotional character or mood it creates
4. Common usage or famous examples

Be specific and educational, but avoid overly technical jargon.`

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
      progressionExplanationCache.set(cacheEntry)
    }

    return {
      data: progressionData,
      explanation,
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))

    // Enhanced error categorization (matches chord-explain.ts pattern)
    // Check timeout FIRST (most specific error)
    if (error.message.toLowerCase().includes('timeout')) {
      return {
        data: progressionData,
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
        data: progressionData,
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
        data: progressionData,
        error: createExplanationError(
          'INSUFFICIENT_RAM',
          'Insufficient memory to load AI model',
          'Close other applications or use a machine with 4GB+ available RAM'
        ),
      }
    } else if (error.message.toLowerCase().includes('corrupt')) {
      return {
        data: progressionData,
        error: createExplanationError(
          'CORRUPTED_MODEL',
          'AI model file corrupted or invalid',
          'Re-download the v4.5 model (2.2GB) or verify file integrity'
        ),
      }
    }

    // Unknown AI error
    return {
      data: progressionData,
      error: createExplanationError(
        'MODEL_UNAVAILABLE',
        `AI error: ${error.message}`,
        'Continue using deterministic progression analysis or check logs for details'
      ),
    }
  }
}
