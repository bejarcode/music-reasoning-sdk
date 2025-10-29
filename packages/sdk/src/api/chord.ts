/**
 * Chord identification API
 * Re-exports chord functionality from the deterministic core engine
 * and adds AI-powered explanation capabilities
 */

import { identifyChord as coreIdentifyChord } from '@music-reasoning/core'
import { explain, explainBatch } from './chord-explain'

// Deterministic chord identification (from core)
export { identifyChord } from '@music-reasoning/core'

// AI-powered explanations (T028 - User Story 1)
export { explain as explainChord } from './chord-explain'

// Batch processing for performance (T057 - User Story 4)
export { explainBatch as explainChordBatch } from './chord-explain'

/**
 * Chord API namespace
 * Provides ergonomic access to chord identification and explanation functions
 */
export const chord = {
  /**
   * Identify a chord from notes (deterministic, no AI)
   * @param notes - Array of note names (e.g., ['C', 'E', 'G'])
   * @returns Chord identification data
   */
  identify: coreIdentifyChord,

  /**
   * Explain a chord with AI-generated insights
   * @param notes - Array of note names (e.g., ['C', 'E', 'G'])
   * @param options - Optional configuration (temperature, maxTokens, etc.)
   * @returns Chord data + AI explanation
   */
  explain,

  /**
   * Batch explain multiple chords efficiently
   * @param noteSets - Array of note arrays
   * @param options - Optional configuration
   * @returns Array of chord results with explanations
   */
  explainBatch,
}
