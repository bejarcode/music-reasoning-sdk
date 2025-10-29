/**
 * Configuration for local AI model inference
 * Based on Phase 3 v4.5 research findings
 * @see specs/004-research-and-validate/research.md Section 10
 */

import { homedir } from 'os'
import { join, dirname } from 'path'
import { existsSync, readFileSync } from 'fs'

/**
 * Cached monorepo root (computed once at module load)
 */
let cachedMonorepoRoot: string | null = null

/**
 * Find monorepo root by looking for package.json with "workspaces"
 * Searches upward from current directory
 *
 * @returns Absolute path to monorepo root
 */
function findMonorepoRoot(): string {
  // Return cached result if available
  if (cachedMonorepoRoot) {
    return cachedMonorepoRoot
  }

  let currentDir = process.cwd()

  // Try up to 5 levels (packages/ai-local -> packages -> root)
  for (let i = 0; i < 5; i++) {
    const packageJsonPath = join(currentDir, 'package.json')

    if (existsSync(packageJsonPath)) {
      try {
        // Read and parse package.json (ESM-compatible)
        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageJsonContent) as {
          workspaces?: string[] | { packages?: string[] }
        }

        // Check if this is the monorepo root (has workspaces)
        if (packageJson.workspaces) {
          cachedMonorepoRoot = currentDir
          return currentDir
        }
      } catch (error) {
        // Log parsing errors in development, continue searching
        if (process.env.NODE_ENV !== 'production') {
          log('warn', `Failed to parse ${packageJsonPath}: ${String(error)}`)
        }
      }
    }

    // Move up one directory
    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) {
      // Reached filesystem root
      break
    }
    currentDir = parentDir
  }

  // Fallback: assume current directory is root
  cachedMonorepoRoot = process.cwd()
  return cachedMonorepoRoot
}

/**
 * Production model from Phase 3 v4.5 research
 * - Accuracy: 87.5% (7/8 diagnostic questions)
 * - Size: 2.2GB GGUF Q4_K_M
 * - Base: Microsoft Phi-3-Mini-3.8B INT4
 * - License: MIT
 */
export const MODEL_CONFIG = {
  /**
   * Model filename (GGUF format for llama.cpp)
   */
  modelName: 'music-reasoning-core3b-v4.5-q4km.gguf',

  /**
   * Model size (for download progress estimation)
   */
  modelSize: 2.2 * 1024 * 1024 * 1024, // 2.2GB in bytes

  /**
   * Default model cache directory (XDG spec compliant)
   * User can override via environment variable: MUSIC_REASONING_MODEL_PATH
   */
  defaultModelPath:
    process.env.MUSIC_REASONING_MODEL_PATH ||
    join(homedir(), '.cache', 'music-reasoning-sdk', 'models'),

  /**
   * Research model location (for development/testing)
   * This is where v4.5 model lives in the research directory
   * Uses monorepo root detection to work from any directory
   */
  researchModelPath: join(
    findMonorepoRoot(),
    'specs',
    '004-research-and-validate',
    'phase3-v4',
    'models',
    'music-reasoning-core3b-v4.5-q4km.gguf'
  ),
} as const

/**
 * Inference parameters based on research findings
 * @see specs/004-research-and-validate/research.md Section 4
 */
export const INFERENCE_CONFIG = {
  /**
   * Temperature settings by task type
   * - Factual (0.3): Chord explanations, theory definitions
   * - Creative (0.5): Progression suggestions, reharmonization basics
   * - Highly Creative (0.7): Advanced reharmonization, voicing exploration
   */
  temperature: {
    factual: 0.3,
    creative: 0.5,
    highlyCreative: 0.7,
    default: 0.5, // Balanced for general use
  },

  /**
   * Token generation limits
   * 100-150 tokens = 2-4 sentences (research finding: optimal conciseness)
   */
  maxTokens: {
    min: 100,
    default: 150,
    max: 200,
  },

  /**
   * Sampling parameters
   */
  topP: 0.9, // Nucleus sampling (balance diversity vs quality)
  topK: 40, // Limit token pool to high-quality candidates
  repeatPenalty: 1.1, // Prevent repetitive phrasing (common in 3B models)

  /**
   * Context window (Phi-3-Mini supports 4K tokens)
   */
  contextSize: 4096,

  /**
   * Inference timeout (prevent hanging)
   * Constitutional requirement: 30s max
   * @see specs/.specify/memory/constitution.md
   */
  timeoutMs: 30000, // 30 seconds
} as const

/**
 * System prompt template from research findings
 * Formula-first pattern: State formulas/facts before examples
 * @see specs/004-research-and-validate/research.md Section 4
 */
export const SYSTEM_PROMPT = `You are a professional music theory instructor with 10+ years of teaching experience. Your goal is to provide clear, accurate, and educational explanations of music theory concepts to intermediate-level musicians (2-5 years of experience).

**Guidelines**:
1. **Clarity**: Use conversational language, avoid unnecessary jargon
2. **Accuracy**: Provide technically correct information (intervals, chord qualities, progressions)
3. **Conciseness**: Keep responses to 2-4 sentences unless more depth is explicitly requested
4. **Educational Value**: Explain "why" something works, not just "what" it is
5. **Practical Application**: When relevant, mention how the concept is used in real music
6. **Formula-First**: State formulas or facts before providing examples

**Output Format**: Plain text, no code blocks or special formatting unless requested.

**Tone**: Friendly and encouraging, never condescending or overly academic.`

/**
 * Hardware acceleration settings
 */
export const HARDWARE_CONFIG = {
  /**
   * GPU layers to offload (0 = CPU only, 99 = all layers)
   * Metal (M1/M2): 99 layers recommended
   * CUDA (RTX): 99 layers recommended
   * CPU fallback: 0 layers
   */
  gpuLayers: 99,

  /**
   * Thread count for CPU inference
   * Auto-detect: use physical cores
   */
  threads: undefined as number | undefined, // undefined = auto-detect
} as const

/**
 * Known model weaknesses from research
 * @see specs/004-research-and-validate/research.md Section 7
 */
export const KNOWN_WEAKNESSES = {
  /**
   * Backdoor progression (bVII7 → I): 0% accuracy
   * This is documented and deferred to v4.8 iteration
   */
  backdoorProgression: {
    accuracy: 0,
    description: 'v4.5 does not correctly identify backdoor progressions (bVII7 → I)',
    workaround: 'Use deterministic core engine for progression analysis, not AI explanations',
    plannedFix: 'v4.8 with multi-stage curriculum learning',
  },
} as const

/**
 * Logger callback type
 */
export type LoggerCallback = (level: 'info' | 'warn' | 'error', message: string) => void

/**
 * Internal logger instance (null = no logging)
 */
let logger: LoggerCallback | null = null

/**
 * Set custom logger for library events
 *
 * **Use case**: Integrate with your application's logging system
 *
 * @param callback - Logger function or null to disable logging
 *
 * @example
 * ```typescript
 * import { setLogger } from '@music-reasoning/ai-local';
 *
 * // Use console (default behavior if not set)
 * setLogger((level, message) => console[level](message));
 *
 * // Use custom logger (e.g., Winston, Pino)
 * setLogger((level, message) => myLogger[level](message));
 *
 * // Disable logging
 * setLogger(null);
 * ```
 */
export function setLogger(callback: LoggerCallback | null): void {
  logger = callback
}

/**
 * Internal logging function
 * Only logs if logger is set
 */
export function log(level: 'info' | 'warn' | 'error', message: string): void {
  if (logger) {
    logger(level, message)
  }
}

/**
 * Type guard: Validate temperature value
 *
 * @param value - Value to check
 * @returns true if value is a valid temperature (0-1)
 *
 * @example
 * ```typescript
 * if (!isValidTemperature(userInput)) {
 *   throw new Error('Temperature must be between 0 and 1');
 * }
 * ```
 */
export function isValidTemperature(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 1
}

/**
 * Type guard: Validate maxTokens value
 *
 * @param value - Value to check
 * @returns true if value is within allowed token range
 *
 * @example
 * ```typescript
 * if (!isValidMaxTokens(userInput)) {
 *   throw new Error(`MaxTokens must be between ${INFERENCE_CONFIG.maxTokens.min} and ${INFERENCE_CONFIG.maxTokens.max}`);
 * }
 * ```
 */
export function isValidMaxTokens(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    value >= INFERENCE_CONFIG.maxTokens.min &&
    value <= INFERENCE_CONFIG.maxTokens.max
  )
}
