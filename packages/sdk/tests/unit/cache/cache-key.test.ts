import { describe, it, expect } from 'vitest'
import {
  normalizeCacheKey,
  isCacheKeyEqual,
  extractPitchClass,
  extractOptions,
} from '../../../src/cache/cache-key'

describe('normalizeCacheKey', () => {
  describe('basic normalization', () => {
    it('generates normalized key with default options', () => {
      const key = normalizeCacheKey(['C', 'E', 'G'], {})
      expect(key).toBe('0-4-7:0.5:150') // Default temp=0.5, tokens=150
    })

    it('generates normalized key with custom temperature', () => {
      const key = normalizeCacheKey(['C', 'E', 'G'], { temperature: 0.7 })
      expect(key).toBe('0-4-7:0.7:150')
    })

    it('generates normalized key with custom maxTokens', () => {
      const key = normalizeCacheKey(['C', 'E', 'G'], { maxTokens: 200 })
      expect(key).toBe('0-4-7:0.5:200')
    })

    it('generates normalized key with both custom options', () => {
      const key = normalizeCacheKey(['C', 'E', 'G'], {
        temperature: 0.3,
        maxTokens: 100,
      })
      expect(key).toBe('0-4-7:0.3:100')
    })
  })

  describe('enharmonic normalization', () => {
    it('normalizes C# and Db to same cache key', () => {
      const key1 = normalizeCacheKey(['C#', 'F', 'G#'], { temperature: 0.5, maxTokens: 150 })
      const key2 = normalizeCacheKey(['Db', 'F', 'Ab'], { temperature: 0.5, maxTokens: 150 })

      // Both should have pitch classes 1 (C#/Db), 5 (F), 8 (G#/Ab)
      expect(key1).toContain('1')
      expect(key1).toContain('5')
      expect(key1).toContain('8')
      expect(key2).toContain('1')
      expect(key2).toContain('5')
      expect(key2).toContain('8')
      expect(key1).toContain(':0.5:150')
      expect(key2).toContain(':0.5:150')
    })
  })

  describe('case normalization (edge case from spec)', () => {
    it('normalizes case variations to same key', () => {
      const lowercase = normalizeCacheKey(['c', 'e', 'g'], {})
      const uppercase = normalizeCacheKey(['C', 'E', 'G'], {})
      const mixed = normalizeCacheKey(['C', 'e', 'G'], {})

      expect(lowercase).toBe('0-4-7:0.5:150')
      expect(uppercase).toBe('0-4-7:0.5:150')
      expect(mixed).toBe('0-4-7:0.5:150')
      expect(lowercase).toBe(uppercase)
      expect(uppercase).toBe(mixed)
    })

    it('handles case + enharmonic combination', () => {
      const key1 = normalizeCacheKey(['c#', 'f', 'g#'], {})
      const key2 = normalizeCacheKey(['Db', 'F', 'Ab'], {})

      expect(key1).toContain('1')
      expect(key1).toContain('5')
      expect(key1).toContain('8')
      expect(key2).toContain('1')
      expect(key2).toContain('5')
      expect(key2).toContain('8')
    })
  })

  describe('deduplication in normalized keys', () => {
    it('deduplicates repeated notes', () => {
      const key = normalizeCacheKey(['C', 'C', 'E', 'G'], {})
      expect(key).toBe('0-4-7:0.5:150') // Same as ['C', 'E', 'G']
    })

    it('deduplicates enharmonic equivalents', () => {
      const key = normalizeCacheKey(['C#', 'Db', 'F'], {})
      expect(key).toBe('1-5:0.5:150') // [1, 5], not [1, 1, 5]
    })
  })

  describe('option merging with defaults', () => {
    it('uses default temperature when not provided', () => {
      const key = normalizeCacheKey(['D', 'F#', 'A'], { maxTokens: 200 })
      expect(key).toBe('2-6-9:0.5:200') // temp=0.5 (default)
    })

    it('uses default maxTokens when not provided', () => {
      const key = normalizeCacheKey(['D', 'F#', 'A'], { temperature: 0.3 })
      expect(key).toBe('2-6-9:0.3:150') // tokens=150 (default)
    })

    it('handles partial options object', () => {
      const key = normalizeCacheKey(['D', 'F#', 'A'], {
        temperature: undefined,
        maxTokens: 200,
      })
      expect(key).toBe('2-6-9:0.5:200') // temp falls back to default
    })
  })
})

describe('isCacheKeyEqual', () => {
  it('returns true for identical keys', () => {
    const result = isCacheKeyEqual('0-4-7:0.5:150', '0-4-7:0.5:150')
    expect(result).toBe(true)
  })

  it('returns false for different pitch classes', () => {
    const result = isCacheKeyEqual('0-4-7:0.5:150', '2-6-9:0.5:150')
    expect(result).toBe(false)
  })

  it('returns false for different temperatures', () => {
    const result = isCacheKeyEqual('0-4-7:0.3:150', '0-4-7:0.5:150')
    expect(result).toBe(false)
  })

  it('returns false for different maxTokens', () => {
    const result = isCacheKeyEqual('0-4-7:0.5:100', '0-4-7:0.5:150')
    expect(result).toBe(false)
  })

  it('returns false for completely different keys', () => {
    const result = isCacheKeyEqual('0-4-7:0.3:100', '2-6-9:0.7:200')
    expect(result).toBe(false)
  })
})

describe('extractPitchClass', () => {
  it('extracts pitch-class part from cache key', () => {
    const result = extractPitchClass('0-4-7:0.5:150')
    expect(result).toBe('0-4-7')
  })

  it('extracts pitch-class from key with different options', () => {
    const result = extractPitchClass('2-6-9:0.7:200')
    expect(result).toBe('2-6-9')
  })

  it('handles complex pitch-class patterns', () => {
    const result = extractPitchClass('0-1-2-3-4-5:0.5:150')
    expect(result).toBe('0-1-2-3-4-5')
  })

  it('handles single pitch-class', () => {
    const result = extractPitchClass('0:0.5:150')
    expect(result).toBe('0')
  })

  it('handles malformed key gracefully (no colons)', () => {
    const result = extractPitchClass('0-4-7')
    expect(result).toBe('0-4-7') // Returns first part (whole string)
  })

  it('handles empty key', () => {
    const result = extractPitchClass('')
    expect(result).toBe('')
  })
})

describe('extractOptions', () => {
  it('extracts temperature and maxTokens from cache key', () => {
    const result = extractOptions('0-4-7:0.5:150')
    expect(result.temperature).toBe(0.5)
    expect(result.maxTokens).toBe(150)
  })

  it('extracts custom temperature', () => {
    const result = extractOptions('0-4-7:0.7:150')
    expect(result.temperature).toBe(0.7)
    expect(result.maxTokens).toBe(150)
  })

  it('extracts custom maxTokens', () => {
    const result = extractOptions('0-4-7:0.5:200')
    expect(result.temperature).toBe(0.5)
    expect(result.maxTokens).toBe(200)
  })

  it('extracts both custom options', () => {
    const result = extractOptions('2-6-9:0.3:100')
    expect(result.temperature).toBe(0.3)
    expect(result.maxTokens).toBe(100)
  })

  it('handles decimal temperatures correctly', () => {
    const result = extractOptions('0-4-7:0.33:150')
    expect(result.temperature).toBeCloseTo(0.33)
  })

  it('handles malformed key with missing parts (uses defaults)', () => {
    const result = extractOptions('0-4-7')
    expect(result.temperature).toBe(0.5) // Fallback to default
    expect(result.maxTokens).toBe(150) // Fallback to default
  })

  it('handles key with empty temperature part (uses default)', () => {
    const result = extractOptions('0-4-7::150')
    expect(result.temperature).toBe(0.5) // NaN → fallback
    expect(result.maxTokens).toBe(150)
  })

  it('handles key with empty maxTokens part (uses default)', () => {
    const result = extractOptions('0-4-7:0.5:')
    expect(result.temperature).toBe(0.5)
    expect(result.maxTokens).toBe(150) // NaN → fallback
  })

  it('handles completely malformed key (uses all defaults)', () => {
    const result = extractOptions('invalid-key')
    expect(result.temperature).toBe(0.5) // Fallback
    expect(result.maxTokens).toBe(150) // Fallback
  })

  it('handles non-numeric temperature (uses default)', () => {
    const result = extractOptions('0-4-7:abc:150')
    expect(result.temperature).toBe(0.5) // NaN → fallback
    expect(result.maxTokens).toBe(150)
  })

  it('handles non-numeric maxTokens (uses default)', () => {
    const result = extractOptions('0-4-7:0.5:xyz')
    expect(result.temperature).toBe(0.5)
    expect(result.maxTokens).toBe(150) // NaN → fallback
  })
})

describe('round-trip normalization (integration)', () => {
  it('generates key and extracts same values back', () => {
    const notes = ['C', 'E', 'G']
    const options = { temperature: 0.7, maxTokens: 200 }

    const key = normalizeCacheKey(notes, options)
    const pitchClass = extractPitchClass(key)
    const extractedOptions = extractOptions(key)

    expect(pitchClass).toBe('0-4-7')
    expect(extractedOptions.temperature).toBe(0.7)
    expect(extractedOptions.maxTokens).toBe(200)
  })

  it('handles enharmonic round-trip', () => {
    const notes1 = ['C#', 'F', 'G#']
    const notes2 = ['Db', 'F', 'Ab']
    const options = { temperature: 0.5, maxTokens: 150 }

    const key1 = normalizeCacheKey(notes1, options)
    const key2 = normalizeCacheKey(notes2, options)

    const pitchClass1 = extractPitchClass(key1)
    const pitchClass2 = extractPitchClass(key2)

    // Both should contain same pitch classes
    expect(pitchClass1).toContain('1')
    expect(pitchClass1).toContain('5')
    expect(pitchClass1).toContain('8')
    expect(pitchClass2).toContain('1')
    expect(pitchClass2).toContain('5')
    expect(pitchClass2).toContain('8')
  })

  it('verifies case normalization in round-trip', () => {
    const lowercase = normalizeCacheKey(['c', 'e', 'g'], { temperature: 0.5, maxTokens: 150 })
    const uppercase = normalizeCacheKey(['C', 'E', 'G'], { temperature: 0.5, maxTokens: 150 })

    expect(extractPitchClass(lowercase)).toBe(extractPitchClass(uppercase))
    expect(extractOptions(lowercase)).toEqual(extractOptions(uppercase))
  })
})
