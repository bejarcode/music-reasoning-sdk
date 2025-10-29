/**
 * @music-reasoning/ai-local
 *
 * Local AI runtime for Music Reasoning SDK
 *
 * **Production Model**: Music Reasoning SDK - Core 3B v4.5
 * - Accuracy: 87.5% (7/8 diagnostic questions)
 * - Size: 2.2GB GGUF Q4_K_M
 * - Base: Microsoft Phi-3-Mini-3.8B INT4
 * - License: MIT
 *
 * @see specs/004-research-and-validate/research.md for research findings
 * @packageDocumentation
 */

// Core inference API
export {
  generateExplanation,
  generateFactualExplanation,
  generateCreativeSuggestion,
  generateHighlyCreativeIdea,
  batchGenerateExplanations,
  resetChatSession,
  type InferenceOptions,
  type PerformanceMetrics,
} from './inference.js'

// Model loader (advanced users)
export {
  loadModel,
  createContext,
  createChatSession,
  resetContext,
  unloadModel,
  isModelLoaded,
  getModelStatus,
  warmupModel,
  type ModelLoaderOptions,
} from './loader.js'

// Configuration (for customization)
export {
  MODEL_CONFIG,
  INFERENCE_CONFIG,
  HARDWARE_CONFIG,
  SYSTEM_PROMPT,
  KNOWN_WEAKNESSES,
  setLogger,
  type LoggerCallback,
  isValidTemperature,
  isValidMaxTokens,
} from './config.js'

/**
 * Re-export node-llama-cpp types for advanced users
 */
export type { LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp'
