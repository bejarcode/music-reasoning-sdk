/**
 * Scale API
 * Re-exports scale functionality from the deterministic core engine
 * and adds AI-powered explanation capabilities
 */

import { getScale as coreGetScale } from '@music-reasoning/core'
import { explain } from './scale-explain'

// Deterministic scale generation (from core)
export { getScale } from '@music-reasoning/core'

// AI-powered explanations (T064 - User Story 5)
export { explain as explainScale } from './scale-explain'

/**
 * Scale API namespace
 * Provides ergonomic access to scale generation and explanation functions
 */
export const scale = {
  /**
   * Get scale notes (deterministic, no AI)
   * @param root - Root note (e.g., 'C', 'D')
   * @param type - Scale type (e.g., 'major', 'minor', 'dorian')
   * @returns Scale information with notes and intervals
   */
  get: coreGetScale,

  /**
   * Explain a scale with AI-generated insights
   * @param root - Root note (e.g., 'C', 'D')
   * @param type - Scale type (e.g., 'major', 'minor', 'dorian')
   * @param options - Optional configuration (temperature, maxTokens, etc.)
   * @returns Scale data + AI explanation
   */
  explain,
}
