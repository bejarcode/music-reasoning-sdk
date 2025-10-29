/**
 * TypeScript Contracts: Error Handling
 *
 * Type definitions for structured error handling in the music theory engine.
 * All types enforce TypeScript strict mode with no `any` types.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

/**
 * Error codes for music theory operations.
 *
 * @remarks
 * These codes provide machine-readable error identification for proper
 * error handling and user feedback.
 */
export type MusicTheoryErrorCode =
  // Input validation errors (400-level semantics)
  | 'INSUFFICIENT_NOTES' // Less than 2 notes provided
  | 'INVALID_NOTES' // Malformed note names (e.g., 'H', 'Z')
  | 'INVALID_CHORD' // Unrecognized chord symbol
  | 'INVALID_ROOT' // Invalid root note for scale
  | 'INVALID_SCALE_TYPE' // Unrecognized scale type
  // Analysis errors (404-level semantics)
  | 'CHORD_NOT_FOUND' // Unable to identify chord from notes
  | 'KEY_NOT_DETECTED' // No clear key found in progression
  | 'PATTERN_NOT_MATCHED' // No genre patterns matched
  // System errors (500-level semantics)
  | 'INTERNAL_ERROR' // Unexpected tonal.js or system failure

/**
 * Structured error data for music theory operations.
 *
 * @remarks
 * This interface defines the structure for all music theory errors.
 * It extends the base Error with structured data for better debugging
 * and user feedback.
 *
 * @example
 * ```typescript
 * const error: MusicTheoryErrorData = {
 *   code: 'INVALID_NOTES',
 *   message: 'The note "H" is not a valid note name',
 *   details: {
 *     invalidNote: 'H',
 *     validNotes: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
 *   },
 *   suggestion: 'Use standard note names (A-G) with optional sharps (#) or flats (b)'
 * }
 * ```
 */
export interface MusicTheoryErrorData {
  /** Machine-readable error code */
  readonly code: MusicTheoryErrorCode

  /** Human-readable error message explaining what went wrong */
  readonly message: string

  /**
   * Additional context about the error.
   * Structure varies by error code.
   * @optional
   */
  readonly details?: Readonly<Record<string, unknown>>

  /**
   * Actionable suggestion for fixing the error.
   * @optional
   */
  readonly suggestion?: string
}

/**
 * Options for throwing a MusicTheoryError.
 */
export interface MusicTheoryErrorOptions {
  /** Error code */
  code: MusicTheoryErrorCode

  /** Error message */
  message: string

  /** Additional error context */
  details?: Record<string, unknown>

  /** Suggestion for fixing the error */
  suggestion?: string

  /** Original error that caused this error */
  cause?: Error
}
