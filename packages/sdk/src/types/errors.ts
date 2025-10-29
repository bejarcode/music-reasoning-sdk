/**
 * Machine-readable error codes for AI explanation failures.
 *
 * @remarks
 * These codes enable programmatic error handling while maintaining graceful degradation.
 * When AI fails, deterministic music theory data is still returned in ExplanationResult.data.
 *
 * **Error Code Reference:**
 * - `MODEL_UNAVAILABLE`: Model not downloaded or initialized
 * - `TIMEOUT`: Inference exceeded timeout limit (default 30s)
 * - `INVALID_INPUT`: Input validation failed (e.g., temperature > 1.0)
 * - `INSUFFICIENT_RAM`: System RAM below model requirements (~4GB needed)
 * - `CORRUPTED_MODEL`: Model file checksum mismatch or load error
 */
export type ErrorCode =
  | 'MODEL_UNAVAILABLE'
  | 'TIMEOUT'
  | 'INVALID_INPUT'
  | 'INSUFFICIENT_RAM'
  | 'CORRUPTED_MODEL'

/**
 * Structured error type for graceful degradation when AI inference fails.
 *
 * @remarks
 * This error type follows a consistent pattern:
 * - `code`: Machine-readable error code for programmatic handling
 * - `message`: Human-readable explanation of what went wrong
 * - `suggestion`: Actionable recovery step (how to resolve)
 *
 * **Important:** Errors are non-blocking - deterministic data is always returned
 * in ExplanationResult.data even when AI fails.
 *
 * @example
 * ```typescript
 * // MODEL_UNAVAILABLE error
 * {
 *   code: 'MODEL_UNAVAILABLE',
 *   message: 'Local AI model not found at ~/.music-reasoning/models/core3b-v4.5.gguf',
 *   suggestion: 'Download the model using sdk.downloadModel() or use cloud API with useCloud: true'
 * }
 *
 * // TIMEOUT error
 * {
 *   code: 'TIMEOUT',
 *   message: 'AI inference exceeded 30000ms timeout (cold start detected)',
 *   suggestion: 'Increase timeout to 60000ms for first request, or wait for model warmup'
 * }
 *
 * // INVALID_INPUT error
 * {
 *   code: 'INVALID_INPUT',
 *   message: 'Temperature must be between 0.0 and 1.0 (received: 1.5)',
 *   suggestion: 'Use temperature between 0.3-0.7 for factual music theory explanations'
 * }
 *
 * // INSUFFICIENT_RAM error
 * {
 *   code: 'INSUFFICIENT_RAM',
 *   message: 'System has 2.1GB available RAM, but model requires 4GB minimum',
 *   suggestion: 'Close other applications or use cloud API with useCloud: true'
 * }
 *
 * // CORRUPTED_MODEL error
 * {
 *   code: 'CORRUPTED_MODEL',
 *   message: 'Model file failed checksum validation (expected: abc123, got: def456)',
 *   suggestion: 'Re-download model using sdk.downloadModel({ force: true })'
 * }
 * ```
 */
export interface ExplanationError {
  /**
   * Machine-readable error code.
   *
   * @remarks
   * Use this for programmatic error handling (e.g., retry logic, fallback strategies).
   * See ErrorCode type for complete list of error codes.
   */
  code: ErrorCode

  /**
   * Human-readable error message.
   *
   * @remarks
   * Explains what went wrong in clear language.
   * Useful for logging and debugging.
   */
  message: string

  /**
   * Actionable suggestion for recovery.
   *
   * @remarks
   * Tells the user how to resolve the error.
   * Always provides a concrete next step.
   */
  suggestion: string
}

/**
 * Error code metadata for documentation and validation.
 *
 * @internal
 */
export const ERROR_CODE_METADATA: Record<
  ErrorCode,
  {
    triggerCondition: string
    userImpact: string
    recoveryAction: string
  }
> = {
  MODEL_UNAVAILABLE: {
    triggerCondition: 'Model not downloaded or initialized',
    userImpact: 'No AI explanations (deterministic data still works)',
    recoveryAction: 'Run downloadModel() or use cloud API',
  },
  TIMEOUT: {
    triggerCondition: 'Inference exceeds timeout (default 30s)',
    userImpact: 'Slow response, no explanation',
    recoveryAction: 'Increase timeout or use faster hardware',
  },
  INVALID_INPUT: {
    triggerCondition: 'Input violates validation rules (e.g., temperature > 1.0)',
    userImpact: 'No AI inference attempted',
    recoveryAction: 'Fix input parameters',
  },
  INSUFFICIENT_RAM: {
    triggerCondition: 'System RAM < model requirements (~4GB needed)',
    userImpact: 'Cannot load model',
    recoveryAction: 'Close other apps or use cloud API',
  },
  CORRUPTED_MODEL: {
    triggerCondition: 'Model file checksum mismatch or load error',
    userImpact: 'Cannot initialize AI',
    recoveryAction: 'Re-download model',
  },
}

/**
 * Factory function to create standardized ExplanationError objects.
 *
 * @param code - Machine-readable error code
 * @param message - Human-readable error message
 * @param suggestion - Actionable recovery suggestion
 * @returns Structured ExplanationError object
 *
 * @remarks
 * Use this factory to ensure consistent error format across the SDK.
 *
 * @example
 * ```typescript
 * const error = createExplanationError(
 *   'MODEL_UNAVAILABLE',
 *   'Local AI model not found at ~/.music-reasoning/models/core3b-v4.5.gguf',
 *   'Download the model using sdk.downloadModel()'
 * );
 * ```
 */
export function createExplanationError(
  code: ErrorCode,
  message: string,
  suggestion: string
): ExplanationError {
  return {
    code,
    message,
    suggestion,
  }
}

/**
 * Validates ExplainOptions input parameters.
 *
 * @param options - User-provided options to validate
 * @returns ExplanationError if validation fails, undefined if valid
 *
 * @remarks
 * Validation rules:
 * - temperature: 0.0 - 1.0
 * - maxTokens: 50 - 500
 * - timeout: 5000 - 120000 ms
 *
 * @example
 * ```typescript
 * const error = validateExplainOptions({ temperature: 1.5 });
 * if (error) {
 *   // Handle validation error
 *   console.error(error.message);
 * }
 * ```
 */
export function validateExplainOptions(
  options: Partial<import('./explain').ExplainOptions>
): ExplanationError | undefined {
  if (options.temperature !== undefined) {
    if (
      !Number.isFinite(options.temperature) ||
      options.temperature < 0.0 ||
      options.temperature > 1.0
    ) {
      return createExplanationError(
        'INVALID_INPUT',
        `Temperature must be between 0.0 and 1.0 (received: ${String(options.temperature)})`,
        'Use temperature between 0.3-0.7 for factual music theory explanations'
      )
    }
  }

  if (options.maxTokens !== undefined) {
    if (!Number.isInteger(options.maxTokens)) {
      return createExplanationError(
        'INVALID_INPUT',
        `MaxTokens must be an integer (received: ${String(options.maxTokens)})`,
        'Use whole numbers like 100, 150, or 200'
      )
    }
    if (options.maxTokens < 50 || options.maxTokens > 500) {
      return createExplanationError(
        'INVALID_INPUT',
        `MaxTokens must be between 50 and 500 (received: ${String(options.maxTokens)})`,
        'Use 100-200 tokens for concise music theory explanations'
      )
    }
  }

  if (options.timeout !== undefined) {
    if (!Number.isFinite(options.timeout) || options.timeout < 5000 || options.timeout > 120000) {
      return createExplanationError(
        'INVALID_INPUT',
        `Timeout must be between 5000 and 120000 ms (received: ${String(options.timeout)})`,
        'Use 30000ms (30s) default, or increase for cold starts'
      )
    }
  }

  return undefined
}
