/**
 * Tier infrastructure types for SDK configuration
 * Supports offline-first architecture (Constitution Principle I)
 */

export type Tier = 'free' | 'creator' | 'studio' | 'enterprise'

export interface SDKConfig {
  /** User's tier level */
  tier: Tier
  /** Operating mode preference */
  mode: 'local-only' | 'cloud-only' | 'auto'
  /** Optional API key for cloud features */
  apiKey?: string
}

export interface TierCapabilities {
  /** Whether this tier has local AI model */
  hasLocalAI: boolean
  /** Whether this tier has cloud AI access */
  hasCloudAI: boolean
  /** Cloud API call limit per month (undefined = unlimited) */
  cloudCallLimit?: number
}
