/**
 * Progression analysis API
 * Re-exports progression functionality from the deterministic core engine
 * and adds AI-powered explanation capabilities
 */

import { detectGenre as coreDetectGenre } from '@music-reasoning/core'
import { analyze } from './progression-analyze'

// Deterministic progression analysis (from core)
export { analyzeProgression } from '@music-reasoning/core'

// AI-powered analysis (T069 - User Story 5)
export { analyze as analyzeProgressionWithAI } from './progression-analyze'

/**
 * Progression API namespace
 * Provides ergonomic access to progression analysis and genre detection functions
 */
export const progression = {
  /**
   * Analyze a progression with AI-generated insights (hybrid intelligence)
   * @param chords - Array of chord symbols (e.g., ['Dm7', 'G7', 'Cmaj7'])
   * @param options - Optional configuration (temperature, maxTokens, etc.)
   * @returns Progression analysis (deterministic) + AI explanation
   *
   * @remarks
   * This is the hybrid intelligence version that returns:
   * - Deterministic data: key, chord functions, patterns, genre detection (always available)
   * - AI explanation: contextual analysis and insights (when model available)
   *
   * For deterministic-only analysis, use `analyzeProgression()` directly.
   */
  analyze,

  /**
   * Detect genres from chord progression (deterministic, no AI)
   * @param chords - Array of chord symbols
   * @returns Array of genre matches with confidence scores
   *
   * @remarks
   * Lightweight genre detection without full progression analysis.
   * For complete analysis, use `analyze()` instead.
   */
  detectGenre: coreDetectGenre,
}
