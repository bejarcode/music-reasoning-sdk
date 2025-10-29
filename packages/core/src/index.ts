/**
 * Music Reasoning SDK - Core
 * Deterministic music theory engine (MIT License)
 */

// Chord functions and error handling
export {
  identifyChord,
  ChordIdentificationError,
  ChordIdentificationErrors,
} from './chord/identify'

// Chord building and voicing
export { buildChord, generateVoicing, getSubstitutions } from './chord/build'

// Scale functions
export {
  getScale,
  // Scale utilities
  getScaleDefinition,
  normalizeScaleType,
  isMajorScaleType,
  isMinorScaleType,
  supportsRelativeRelationship,
  supportsParallelRelationship,
  // Degree utilities
  createScaleDegree,
  createScaleDegrees,
  getDiatonicDegreeName,
  getGenericDegreeName,
  getRomanNumeral as getScaleRomanNumeral,
  getHarmonicFunction as getScaleHarmonicFunction,
  // Mode utilities
  calculateModes,
  getModalScaleNames,
  identifyMode,
  getModalCharacteristics,
  isModalScale,
  // Relationship utilities
  getRelativeMinor,
  getRelativeMajor,
  getParallelMinor,
  getParallelMajor,
  getRelativeMinorScale,
  getRelativeMajorScale,
  getParallelMinorScale,
  getParallelMajorScale,
  getScaleRelationship,
  buildScaleName,
} from './scale'

// Progression functions
export {
  analyzeProgression,
  detectKey,
  getRomanNumeral as getProgressionRomanNumeral,
  getRomanNumerals,
  getHarmonicFunction as getProgressionHarmonicFunction,
  detectCadences,
  detectPatterns,
} from './progression'

// Genre detection and patterns
export * from './genre'
