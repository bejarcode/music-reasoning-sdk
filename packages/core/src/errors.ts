/**
 * Music Theory Error Handling
 *
 * Custom error class for music theory operations with structured error data.
 * Extends the base Error class with machine-readable codes, contextual details,
 * and actionable suggestions.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import type { MusicTheoryErrorCode, MusicTheoryErrorData, MusicTheoryErrorOptions } from './types'

/**
 * Custom error class for music theory operations.
 *
 * Provides structured error handling with:
 * - Machine-readable error codes
 * - Human-readable messages
 * - Contextual details for debugging
 * - Actionable suggestions for resolution
 * - Preserved stack traces
 *
 * @example
 * ```typescript
 * throw new MusicTheoryError({
 *   code: 'INVALID_NOTES',
 *   message: 'The note "H" is not a valid note name',
 *   details: { invalidNote: 'H', validNotes: ['A-G'] },
 *   suggestion: 'Use standard note names (A-G) with optional sharps (#) or flats (b)'
 * })
 * ```
 *
 * @since v1.0.0
 */
export class MusicTheoryError extends Error implements MusicTheoryErrorData {
  /** Machine-readable error code for programmatic handling */
  public readonly code: MusicTheoryErrorCode

  /** Additional context about the error (optional) */
  public readonly details?: Readonly<Record<string, unknown>>

  /** Actionable suggestion for fixing the error (optional) */
  public readonly suggestion?: string

  /**
   * Creates a new MusicTheoryError.
   *
   * @param options - Error configuration object
   *
   * @example
   * ```typescript
   * // Simple error
   * new MusicTheoryError({
   *   code: 'CHORD_NOT_FOUND',
   *   message: 'Unable to identify chord from provided notes'
   * })
   *
   * // Error with details and suggestion
   * new MusicTheoryError({
   *   code: 'INSUFFICIENT_NOTES',
   *   message: 'At least 2 notes are required to identify a chord',
   *   details: { providedNotes: ['C'], required: 2 },
   *   suggestion: 'Provide at least 2 notes (e.g., ["C", "E"])'
   * })
   *
   * // Error with cause (wrapping another error)
   * new MusicTheoryError({
   *   code: 'INTERNAL_ERROR',
   *   message: 'Unexpected error in tonal.js',
   *   cause: originalError
   * })
   * ```
   */
  constructor(options: MusicTheoryErrorOptions) {
    // Call parent Error constructor
    super(options.message, { cause: options.cause })

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, MusicTheoryError.prototype)

    // Maintain proper name for error
    this.name = 'MusicTheoryError'

    // Store structured error data
    this.code = options.code
    this.details = options.details ? { ...options.details } : undefined
    this.suggestion = options.suggestion

    // Preserve stack trace
    // ESLint sees Error.captureStackTrace as always truthy, but it's only available in V8 (Node.js/Chrome)
    // Not available in other JS engines (Safari, Firefox). Keep check for cross-platform compatibility.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MusicTheoryError)
    }
  }

  /**
   * Converts error to JSON-serializable format.
   *
   * Useful for API responses and logging.
   *
   * @returns Plain object representation of the error
   *
   * @example
   * ```typescript
   * const error = new MusicTheoryError({
   *   code: 'INVALID_NOTES',
   *   message: 'Invalid note: H'
   * })
   * JSON.stringify(error.toJSON())
   * // {
   * //   "code": "INVALID_NOTES",
   * //   "message": "Invalid note: H",
   * //   "name": "MusicTheoryError"
   * // }
   * ```
   */
  toJSON(): MusicTheoryErrorData & { name: string } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      suggestion: this.suggestion,
    }
  }
}

/**
 * Type guard to check if an error is a MusicTheoryError.
 *
 * @param error - The error to check
 * @returns true if error is a MusicTheoryError, false otherwise
 *
 * @example
 * ```typescript
 * try {
 *   identifyChord(['X', 'Y'])
 * } catch (err) {
 *   if (isMusicTheoryError(err)) {
 *     console.log(`Error code: ${err.code}`)
 *     console.log(`Message: ${err.message}`)
 *     if (err.suggestion) {
 *       console.log(`Suggestion: ${err.suggestion}`)
 *     }
 *   }
 * }
 * ```
 *
 * @since v1.0.0
 */
export function isMusicTheoryError(error: unknown): error is MusicTheoryError {
  return error instanceof MusicTheoryError
}

/**
 * Error code constants for convenient access.
 *
 * Use these constants instead of string literals for better type safety.
 *
 * @example
 * ```typescript
 * throw new MusicTheoryError({
 *   code: ERROR_CODES.INVALID_NOTES,
 *   message: 'Invalid note provided'
 * })
 * ```
 *
 * @since v1.0.0
 */
export const ERROR_CODES = {
  /** Less than 2 notes provided */
  INSUFFICIENT_NOTES: 'INSUFFICIENT_NOTES',

  /** Malformed note names (e.g., 'H', 'Z') */
  INVALID_NOTES: 'INVALID_NOTES',

  /** Unrecognized chord symbol */
  INVALID_CHORD: 'INVALID_CHORD',

  /** Invalid root note for scale */
  INVALID_ROOT: 'INVALID_ROOT',

  /** Unrecognized scale type */
  INVALID_SCALE_TYPE: 'INVALID_SCALE_TYPE',

  /** Unable to identify chord from notes */
  CHORD_NOT_FOUND: 'CHORD_NOT_FOUND',

  /** No clear key found in progression */
  KEY_NOT_DETECTED: 'KEY_NOT_DETECTED',

  /** No genre patterns matched */
  PATTERN_NOT_MATCHED: 'PATTERN_NOT_MATCHED',

  /** Unexpected tonal.js or system failure */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const satisfies Record<string, MusicTheoryErrorCode>
