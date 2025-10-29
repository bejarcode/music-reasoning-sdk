import { describe, it, expect } from 'vitest'
import {
  notesToPitchClass,
  generateCacheKey,
  generateCacheKeyWithOptions,
} from '../../../src/utils/pitch-class'

describe('notesToPitchClass', () => {
  describe('basic pitch-class conversion', () => {
    it('converts C major triad to pitch classes [0, 4, 7]', () => {
      const result = notesToPitchClass(['C', 'E', 'G'])
      expect(result).toEqual([0, 4, 7])
    })

    it('converts D minor triad to pitch classes [2, 5, 9]', () => {
      const result = notesToPitchClass(['D', 'F', 'A'])
      expect(result).toEqual([2, 5, 9])
    })

    it('converts G7 chord to pitch classes [7, 11, 2, 5]', () => {
      const result = notesToPitchClass(['G', 'B', 'D', 'F'])
      expect(result).toEqual([7, 11, 2, 5])
    })
  })

  describe('enharmonic equivalence', () => {
    it.each([
      ['C#', 'Db', 1],
      ['D#', 'Eb', 3],
      ['F#', 'Gb', 6],
      ['G#', 'Ab', 8],
      ['A#', 'Bb', 10],
    ])('treats %s and %s as equivalent (pitch class %i)', (sharp, flat, expected) => {
      const sharpResult = notesToPitchClass([sharp])
      const flatResult = notesToPitchClass([flat])

      expect(sharpResult).toEqual([expected])
      expect(flatResult).toEqual([expected])
      expect(sharpResult).toEqual(flatResult)
    })

    it('converts C# minor triad same as Db minor triad', () => {
      const cSharpMinor = notesToPitchClass(['C#', 'E', 'G#'])
      const dbMinor = notesToPitchClass(['Db', 'Fb', 'Ab'])

      // Both should have pitch class 1 (C#/Db) and 8 (G#/Ab)
      expect(cSharpMinor).toContain(1)
      expect(cSharpMinor).toContain(8)
      expect(dbMinor).toContain(1)
      expect(dbMinor).toContain(8)
    })
  })

  describe('octave independence', () => {
    it('treats C4 same as C5 (both map to pitch class 0)', () => {
      const c4 = notesToPitchClass(['C4'])
      const c5 = notesToPitchClass(['C5'])

      expect(c4).toEqual([0])
      expect(c5).toEqual([0])
    })

    it('converts chord with octaves to same pitch classes as without', () => {
      const withOctaves = notesToPitchClass(['C4', 'E4', 'G4'])
      const withoutOctaves = notesToPitchClass(['C', 'E', 'G'])

      expect(withOctaves).toEqual([0, 4, 7])
      expect(withoutOctaves).toEqual([0, 4, 7])
      expect(withOctaves).toEqual(withoutOctaves)
    })

    it('handles mixed octave notation', () => {
      const result = notesToPitchClass(['C4', 'E', 'G5'])
      expect(result).toEqual([0, 4, 7])
    })
  })

  describe('case normalization (critical fix #2)', () => {
    it('treats lowercase notes same as uppercase', () => {
      const lowercase = notesToPitchClass(['c', 'e', 'g'])
      const uppercase = notesToPitchClass(['C', 'E', 'G'])

      expect(lowercase).toEqual([0, 4, 7])
      expect(uppercase).toEqual([0, 4, 7])
      expect(lowercase).toEqual(uppercase)
    })

    it('handles mixed case input', () => {
      const result = notesToPitchClass(['C', 'e', 'G'])
      expect(result).toEqual([0, 4, 7])
    })

    it('normalizes case for sharps and flats', () => {
      const lowercase = notesToPitchClass(['c#', 'f', 'g#'])
      const uppercase = notesToPitchClass(['C#', 'F', 'G#'])

      expect(lowercase).toEqual([1, 5, 8])
      expect(uppercase).toEqual([1, 5, 8])
      expect(lowercase).toEqual(uppercase)
    })
  })

  describe('whitespace handling', () => {
    it('trims leading and trailing whitespace', () => {
      const result = notesToPitchClass([' C ', ' E ', ' G '])
      expect(result).toEqual([0, 4, 7])
    })

    it('handles tabs and newlines', () => {
      const result = notesToPitchClass(['\tC\t', '\nE\n', ' G '])
      expect(result).toEqual([0, 4, 7])
    })
  })

  describe('invalid input handling', () => {
    it('filters out invalid note names', () => {
      const result = notesToPitchClass(['C', 'X', 'G'])
      expect(result).toEqual([0, 7])
    })

    it('returns empty array for all invalid notes', () => {
      const result = notesToPitchClass(['X', 'Y', 'Z'])
      expect(result).toEqual([])
    })

    it('handles empty array input', () => {
      const result = notesToPitchClass([])
      expect(result).toEqual([])
    })

    it('handles empty strings', () => {
      const result = notesToPitchClass(['', 'C', ''])
      expect(result).toEqual([0])
    })
  })
})

describe('generateCacheKey', () => {
  describe('basic cache key generation', () => {
    it('generates "0-4-7" for C major triad', () => {
      const key = generateCacheKey(['C', 'E', 'G'])
      expect(key).toBe('0-4-7')
    })

    it('generates "2-5-9" for D minor triad', () => {
      const key = generateCacheKey(['D', 'F', 'A'])
      expect(key).toBe('2-5-9')
    })

    it('generates sorted key for 7th chord', () => {
      const key = generateCacheKey(['G', 'B', 'D', 'F'])
      expect(key).toBe('2-5-7-11') // Sorted: D(2), F(5), G(7), B(11)
    })
  })

  describe('enharmonic equivalence', () => {
    it('generates same key for C# minor and Db minor', () => {
      const cSharpKey = generateCacheKey(['C#', 'E', 'G#'])
      const dbKey = generateCacheKey(['Db', 'Fb', 'Ab'])

      // Both should contain pitch classes 1 (C#/Db) and 8 (G#/Ab)
      expect(cSharpKey).toContain('1')
      expect(cSharpKey).toContain('8')
      expect(dbKey).toContain('1')
      expect(dbKey).toContain('8')
    })
  })

  describe('order independence (sorted output)', () => {
    it('generates same key regardless of input order', () => {
      const key1 = generateCacheKey(['C', 'E', 'G'])
      const key2 = generateCacheKey(['G', 'C', 'E'])
      const key3 = generateCacheKey(['E', 'G', 'C'])

      expect(key1).toBe('0-4-7')
      expect(key2).toBe('0-4-7')
      expect(key3).toBe('0-4-7')
      expect(key1).toBe(key2)
      expect(key2).toBe(key3)
    })

    it('sorts complex chords correctly', () => {
      const key = generateCacheKey(['F', 'A', 'C', 'E']) // F maj7
      expect(key).toBe('0-4-5-9') // Sorted: C(0), E(4), F(5), A(9)
    })
  })

  describe('deduplication (critical fix #5)', () => {
    it('removes duplicate pitch classes', () => {
      const key = generateCacheKey(['C', 'C', 'E', 'G'])
      expect(key).toBe('0-4-7') // Same as ['C', 'E', 'G']
    })

    it('deduplicates after enharmonic conversion', () => {
      const key = generateCacheKey(['C#', 'Db', 'F']) // C# and Db are same
      expect(key).toBe('1-5') // Only [1, 5], not [1, 1, 5]
    })

    it('deduplicates octave variants', () => {
      const key = generateCacheKey(['C4', 'C5', 'E4'])
      expect(key).toBe('0-4') // C4 and C5 both → 0
    })

    it('handles all duplicates', () => {
      const key = generateCacheKey(['C', 'C', 'C'])
      expect(key).toBe('0')
    })
  })

  describe('case normalization in cache keys', () => {
    it('generates same key for different case inputs', () => {
      const lowercase = generateCacheKey(['c', 'e', 'g'])
      const uppercase = generateCacheKey(['C', 'E', 'G'])
      const mixed = generateCacheKey(['C', 'e', 'G'])

      expect(lowercase).toBe('0-4-7')
      expect(uppercase).toBe('0-4-7')
      expect(mixed).toBe('0-4-7')
    })
  })

  describe('edge cases', () => {
    it('generates empty string for empty array', () => {
      const key = generateCacheKey([])
      expect(key).toBe('')
    })

    it('generates empty string for all invalid notes', () => {
      const key = generateCacheKey(['X', 'Y', 'Z'])
      expect(key).toBe('')
    })

    it('handles single note', () => {
      const key = generateCacheKey(['C'])
      expect(key).toBe('0')
    })

    it('handles all 12 pitch classes', () => {
      const key = generateCacheKey([
        'C',
        'C#',
        'D',
        'D#',
        'E',
        'F',
        'F#',
        'G',
        'G#',
        'A',
        'A#',
        'B',
      ])
      expect(key).toBe('0-1-2-3-4-5-6-7-8-9-10-11')
    })
  })
})

describe('generateCacheKeyWithOptions', () => {
  describe('basic cache key with options', () => {
    it('includes temperature and maxTokens in key', () => {
      const key = generateCacheKeyWithOptions(['C', 'E', 'G'], {
        temperature: 0.5,
        maxTokens: 150,
      })
      expect(key).toBe('0-4-7:0.5:150')
    })

    it('uses default temperature (0.5) when not provided', () => {
      const key = generateCacheKeyWithOptions(['C', 'E', 'G'], {
        maxTokens: 150,
      })
      expect(key).toBe('0-4-7:0.5:150')
    })

    it('uses default maxTokens (150) when not provided', () => {
      const key = generateCacheKeyWithOptions(['C', 'E', 'G'], {
        temperature: 0.5,
      })
      expect(key).toBe('0-4-7:0.5:150')
    })

    it('uses both defaults when no options provided', () => {
      const key = generateCacheKeyWithOptions(['C', 'E', 'G'], {})
      expect(key).toBe('0-4-7:0.5:150')
    })
  })

  describe('different options produce different keys', () => {
    it('different temperatures produce different keys', () => {
      const key1 = generateCacheKeyWithOptions(['C', 'E', 'G'], {
        temperature: 0.3,
        maxTokens: 150,
      })
      const key2 = generateCacheKeyWithOptions(['C', 'E', 'G'], {
        temperature: 0.7,
        maxTokens: 150,
      })

      expect(key1).toBe('0-4-7:0.3:150')
      expect(key2).toBe('0-4-7:0.7:150')
      expect(key1).not.toBe(key2)
    })

    it('different maxTokens produce different keys', () => {
      const key1 = generateCacheKeyWithOptions(['C', 'E', 'G'], {
        temperature: 0.5,
        maxTokens: 100,
      })
      const key2 = generateCacheKeyWithOptions(['C', 'E', 'G'], {
        temperature: 0.5,
        maxTokens: 200,
      })

      expect(key1).toBe('0-4-7:0.5:100')
      expect(key2).toBe('0-4-7:0.5:200')
      expect(key1).not.toBe(key2)
    })
  })

  describe('enharmonic + options equivalence', () => {
    it('same notes (enharmonic) + same options = same key', () => {
      const key1 = generateCacheKeyWithOptions(['C#', 'F', 'G#'], {
        temperature: 0.5,
        maxTokens: 150,
      })
      const key2 = generateCacheKeyWithOptions(['Db', 'F', 'Ab'], {
        temperature: 0.5,
        maxTokens: 150,
      })

      expect(key1).toContain('1') // C#/Db
      expect(key1).toContain('5') // F
      expect(key1).toContain('8') // G#/Ab
      expect(key1).toContain(':0.5:150')
      expect(key2).toContain('1')
      expect(key2).toContain('5')
      expect(key2).toContain('8')
      expect(key2).toContain(':0.5:150')
    })
  })

  describe('format validation', () => {
    it('follows format <pitch-class>:<temp>:<tokens>', () => {
      const key = generateCacheKeyWithOptions(['D', 'F#', 'A'], {
        temperature: 0.4,
        maxTokens: 120,
      })

      const parts = key.split(':')
      expect(parts).toHaveLength(3)
      expect(parts[0]).toBe('2-6-9') // D F# A
      expect(parts[1]).toBe('0.4')
      expect(parts[2]).toBe('120')
    })
  })
})
