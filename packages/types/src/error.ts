/**
 * Base error class for all Music Reasoning SDK errors
 * Provides structured error information per Constitution requirement (FR-026)
 */
export class MusicReasoningError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly suggestion?: string
  ) {
    super(message)
    this.name = 'MusicReasoningError'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MusicReasoningError)
    }
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        suggestion: this.suggestion,
      },
    }
  }
}

/**
 * Common error subclasses for immediate use
 */

export class ChordNotFoundError extends MusicReasoningError {
  constructor(notes: string[]) {
    super(
      'CHORD_NOT_FOUND',
      'Unable to identify chord from provided notes',
      { notes },
      'Try providing at least 3 notes that form a recognized triad (e.g., C-E-G)'
    )
  }
}

export class InvalidNoteError extends MusicReasoningError {
  constructor(note: string) {
    super(
      'INVALID_NOTE',
      `Invalid note name: ${note}`,
      { note },
      'Note names must be A-G with optional accidentals (#, b)'
    )
  }
}

export class TierNotAvailableError extends MusicReasoningError {
  constructor(requestedFeature: string, requiredTier: string) {
    super(
      'TIER_NOT_AVAILABLE',
      `Feature "${requestedFeature}" requires ${requiredTier} tier`,
      { requestedFeature, requiredTier },
      `Upgrade to ${requiredTier} tier to access this feature`
    )
  }
}
