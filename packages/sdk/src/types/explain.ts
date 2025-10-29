import type { ExplanationError } from './errors'

/**
 * Configuration options for AI-powered explanation generation.
 *
 * @remarks
 * Controls temperature, token limits, timeouts, and caching behavior for local AI inference.
 * All fields are optional with sensible defaults optimized for music theory explanations.
 *
 * @example
 * ```typescript
 * // Use defaults (temperature: 0.5, maxTokens: 150, timeout: 30000ms, useCache: true)
 * await chord.explain(['C', 'E', 'G'])
 *
 * // Custom options for longer, more creative explanation
 * await chord.explain(['C', 'E', 'G'], {
 *   temperature: 0.5,
 *   maxTokens: 250,
 *   timeout: 60000
 * })
 *
 * // Disable cache for testing
 * await chord.explain(['C', 'E', 'G'], { useCache: false })
 * ```
 */
export interface ExplainOptions {
  /**
   * Sampling temperature - controls randomness in AI responses.
   *
   * @remarks
   * - Range: 0.0 - 1.0
   * - Default: 0.5
   * - Recommended: 0.3-0.7 for factual music theory explanations
   * - Values < 0.3: Very deterministic (use for factual tasks)
   * - Values > 0.7: More creative (may hallucinate, not recommended)
   */
  temperature?: number

  /**
   * Maximum tokens to generate - controls explanation length.
   *
   * @remarks
   * - Range: 50 - 500
   * - Default: 150
   * - Recommended: 100-200 for concise explanations
   * - Values < 100: Risk incomplete sentences
   * - Values > 300: May be verbose, slower inference
   */
  maxTokens?: number

  /**
   * Inference timeout in milliseconds.
   *
   * @remarks
   * - Range: 5000 - 120000 (5s - 2min)
   * - Default: 30000 (30 seconds)
   * - Accounts for cold start (3-6s) + warm inference (0.8-2.5s)
   * - Typical performance: 2-7s on M1/RTX 3090
   */
  timeout?: number

  /**
   * Enable LRU cache for repeated queries.
   *
   * @remarks
   * - Default: true (recommended for production)
   * - Cache policy: 24-hour TTL + 1000 entry LRU limit
   * - Cache key: Pitch-class normalized (C# = Db)
   * - Set to false for testing or dynamic prompts
   */
  useCache?: boolean
}

/**
 * Default configuration values for AI explanation generation.
 *
 * @remarks
 * These values are optimized for music theory explanations:
 * - Balanced temperature (0.5) for consistency with variety
 * - Moderate tokens (150) for concise 2-4 sentence responses
 * - Conservative timeout (30s) to handle cold starts
 * - Caching enabled for performance
 */
export const DEFAULT_EXPLAIN_OPTIONS: Required<ExplainOptions> = {
  temperature: 0.5,
  maxTokens: 150,
  timeout: 30000,
  useCache: true,
}

/**
 * Wraps deterministic music theory data with optional AI-generated explanation.
 *
 * @typeParam T - The type of deterministic data (e.g., ChordInfo, ScaleInfo, ProgressionInfo)
 *
 * @remarks
 * This type enables progressive enhancement:
 * - `data` field: Always present, contains deterministic music theory result from @music-reasoning/core
 * - `explanation` field: Optional, AI-generated natural language explanation (2-4 sentences)
 * - `error` field: Optional, structured error if AI fails (graceful degradation)
 *
 * **Validation Rules:**
 * - `data` is ALWAYS present (deterministic layer never fails)
 * - If `error` is present, `explanation` MUST be undefined
 * - If `explanation` is present, `error` MUST be undefined
 * - Both `explanation` and `error` MAY be undefined (AI disabled case)
 *
 * @example
 * ```typescript
 * // Success case - deterministic data + AI explanation
 * const result: ExplanationResult<ChordInfo> = {
 *   data: { root: 'C', quality: 'maj7', intervals: ['P1', 'M3', 'P5', 'M7'] },
 *   explanation: 'Cmaj7 is a major seventh chord built on C. It has a bright, jazzy sound...'
 * }
 *
 * // Error case - graceful degradation (deterministic data still works)
 * const result: ExplanationResult<ChordInfo> = {
 *   data: { root: 'C', quality: 'maj7', intervals: ['P1', 'M3', 'P5', 'M7'] },
 *   error: {
 *     code: 'MODEL_UNAVAILABLE',
 *     message: 'Local AI model not downloaded',
 *     suggestion: 'Run downloadModel() or continue using deterministic data'
 *   }
 * }
 *
 * // AI disabled case - deterministic data only
 * const result: ExplanationResult<ChordInfo> = {
 *   data: { root: 'C', quality: 'maj7', intervals: ['P1', 'M3', 'P5', 'M7'] }
 *   // No explanation, no error - AI simply not enabled
 * }
 * ```
 */
export interface ExplanationResult<T> {
  /**
   * Deterministic music theory data from @music-reasoning/core.
   *
   * @remarks
   * This field is ALWAYS present and contains the music theory analysis.
   * The deterministic layer never fails - AI is purely enhancement.
   */
  data: T

  /**
   * AI-generated natural language explanation (2-4 sentences).
   *
   * @remarks
   * Optional field that may be undefined if:
   * - AI model is unavailable
   * - Inference timed out
   * - AI inference failed (see `error` field)
   * - AI is disabled (no error, just not enabled)
   */
  explanation?: string

  /**
   * Error details if AI explanation generation failed.
   *
   * @remarks
   * Optional field present only when AI fails.
   * Mutually exclusive with `explanation` field.
   * Deterministic `data` is still valid and usable.
   */
  error?: ExplanationError
}
