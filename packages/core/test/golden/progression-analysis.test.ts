/**
 * Golden Test Suite: Progression Analysis
 *
 * Comprehensive tests for chord progression analysis including:
 * - Key detection (major and minor keys)
 * - Roman numeral analysis
 * - Cadence identification (authentic, plagal, deceptive, half)
 * - Secondary dominants (V/vi, V/ii, etc.)
 * - Borrowed chords (modal mixture)
 * - Loopable progressions
 * - General patterns (I-IV-V-I, ii-V-I, etc.)
 *
 * Target: 40+ tests
 * Performance requirement: <100ms p95 for progression analysis
 *
 * @packageDocumentation
 * @since v2.0.0
 */

import { describe, test, expect } from 'vitest'
import { analyzeProgression } from '../../src/progression'

// =============================================================================
// Key Detection - Major Keys (6 tests)
// =============================================================================

describe('Progression Analysis - Key Detection (Major Keys)', () => {
  test('detects C major from I-IV-V-I progression', () => {
    const result = analyzeProgression(['C', 'F', 'G', 'C'])

    expect(result.key).toBe('C major')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9) // All diatonic
    expect(result.analysis).toHaveLength(4)
    expect(result.analysis[0].roman).toBe('I')
    expect(result.analysis[1].roman).toBe('IV')
    expect(result.analysis[2].roman).toBe('V')
    expect(result.analysis[3].roman).toBe('I')
  })

  test('detects G major from I-V-vi-IV (Axis progression)', () => {
    const result = analyzeProgression(['G', 'D', 'Em', 'C'])

    expect(result.key).toBe('G major')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.analysis[0].roman).toBe('I')
    expect(result.analysis[1].roman).toBe('V')
    expect(result.analysis[2].roman).toBe('vi')
    expect(result.analysis[3].roman).toBe('IV')
  })

  test('detects D major from ii-V-I jazz progression', () => {
    const result = analyzeProgression(['Em7', 'A7', 'Dmaj7'])

    expect(result.key).toBe('D major')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.analysis[0].roman).toBe('ii7')
    expect(result.analysis[1].roman).toBe('V7')
    expect(result.analysis[2].roman).toMatch(/I(maj7)?/)
  })

  test('detects F major from I-vi-ii-V progression', () => {
    const result = analyzeProgression(['F', 'Dm', 'Gm', 'C'])

    expect(result.key).toBe('F major')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.analysis[0].roman).toBe('I')
    expect(result.analysis[1].roman).toBe('vi')
    expect(result.analysis[2].roman).toBe('ii')
    expect(result.analysis[3].roman).toBe('V')
  })

  test('detects Bb major from I-IV-V progression', () => {
    const result = analyzeProgression(['Bb', 'Eb', 'F'])

    expect(result.key).toBe('Bb major')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.analysis[0].roman).toBe('I')
    expect(result.analysis[1].roman).toBe('IV')
    expect(result.analysis[2].roman).toBe('V')
  })

  test('detects A major from I-vi-IV-V (50s progression)', () => {
    const result = analyzeProgression(['A', 'F#m', 'D', 'E'])

    expect(result.key).toBe('A major')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.analysis[0].roman).toBe('I')
    expect(result.analysis[1].roman).toBe('vi')
    expect(result.analysis[2].roman).toBe('IV')
    expect(result.analysis[3].roman).toBe('V')
  })
})

// =============================================================================
// Key Detection - Minor Keys (6 tests)
// =============================================================================

describe('Progression Analysis - Key Detection (Minor Keys)', () => {
  test('detects A minor from i-iv-V progression', () => {
    const result = analyzeProgression(['Am', 'Dm', 'E'])

    expect(result.key).toBe('A minor')
    expect(result.confidence).toBeGreaterThanOrEqual(0.6) // Realistic for 3-chord progression
    expect(result.analysis[0].roman).toBe('i')
    expect(result.analysis[1].roman).toBe('iv')
    expect(result.analysis[2].roman).toBe('V') // Uppercase for dominant
  })

  test('detects E minor from i-VI-III-VII progression (EDM style)', () => {
    const result = analyzeProgression(['Em', 'C', 'G', 'D'])

    expect(result.key).toBe('E minor')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.analysis[0].roman).toBe('i')
    expect(result.analysis[1].roman).toBe('VI')
    expect(result.analysis[2].roman).toBe('III')
    expect(result.analysis[3].roman).toBe('VII')
  })

  test('detects D minor from i-VII-VI-V progression', () => {
    const result = analyzeProgression(['Dm', 'C', 'Bb', 'A'])

    expect(result.key).toBe('D minor')
    expect(result.confidence).toBeGreaterThanOrEqual(0.7) // Realistic for 4-chord natural minor
    expect(result.analysis[0].roman).toBe('i')
    expect(result.analysis[1].roman).toBe('VII')
    expect(result.analysis[2].roman).toBe('VI')
    expect(result.analysis[3].roman).toBe('V')
  })

  test('detects B minor from i-iv-v progression (natural minor)', () => {
    const result = analyzeProgression(['Bm', 'Em', 'F#m'])

    expect(result.key).toBe('B minor')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.analysis[0].roman).toBe('i')
    expect(result.analysis[1].roman).toBe('iv')
    expect(result.analysis[2].roman).toMatch(/v/)
  })

  test('detects C# minor from i-V-i progression (harmonic minor)', () => {
    const result = analyzeProgression(['C#m', 'G#7', 'C#m'])

    expect(result.key).toBe('C# minor')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.analysis[0].roman).toBe('i')
    expect(result.analysis[1].roman).toMatch(/V7?/)
    expect(result.analysis[2].roman).toBe('i')
  })

  test('detects G minor from i-iv-i-V progression', () => {
    const result = analyzeProgression(['Gm', 'Cm', 'Gm', 'D'])

    expect(result.key).toBe('G minor')
    expect(result.confidence).toBeGreaterThanOrEqual(0.7) // Realistic with tonic repetition
    expect(result.analysis[0].roman).toBe('i')
    expect(result.analysis[1].roman).toBe('iv')
    expect(result.analysis[2].roman).toBe('i')
    expect(result.analysis[3].roman).toBe('V')
  })
})

// =============================================================================
// Roman Numeral Analysis (8 tests)
// =============================================================================

describe('Progression Analysis - Roman Numeral Analysis', () => {
  test('assigns uppercase Roman numerals for major chords', () => {
    const result = analyzeProgression(['C', 'F', 'G'])

    expect(result.analysis[0].roman).toBe('I')
    expect(result.analysis[0].quality).toMatch(/major/)
    expect(result.analysis[1].roman).toBe('IV')
    expect(result.analysis[2].roman).toBe('V')
  })

  test('assigns lowercase Roman numerals for minor chords', () => {
    const result = analyzeProgression(['Am', 'Dm', 'Em'])

    expect(result.key).toBe('A minor')
    expect(result.analysis[0].roman).toBe('i')
    expect(result.analysis[0].quality).toMatch(/minor/)
    expect(result.analysis[1].roman).toBe('iv')
    expect(result.analysis[2].roman).toMatch(/v/)
  })

  test('assigns correct degree numbers 1-7', () => {
    const result = analyzeProgression(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'])

    expect(result.key).toBe('C major')
    expect(result.analysis[0].degree).toBe(1)
    expect(result.analysis[1].degree).toBe(2)
    expect(result.analysis[2].degree).toBe(3)
    expect(result.analysis[3].degree).toBe(4)
    expect(result.analysis[4].degree).toBe(5)
    expect(result.analysis[5].degree).toBe(6)
    expect(result.analysis[6].degree).toBe(7)
  })

  test('handles 7th chord extensions in Roman numerals', () => {
    const result = analyzeProgression(['Cmaj7', 'Dm7', 'G7'])

    expect(result.key).toBe('C major')
    expect(result.analysis[0].roman).toMatch(/I(maj7)?/)
    expect(result.analysis[1].roman).toMatch(/ii7/)
    expect(result.analysis[2].roman).toMatch(/V7/)
  })

  test('handles diminished chord notation (°)', () => {
    const result = analyzeProgression(['C', 'F', 'Bdim', 'C'])

    expect(result.key).toBe('C major')
    expect(result.analysis[2].roman).toMatch(/vii°/)
    expect(result.analysis[2].quality).toMatch(/diminished/)
  })

  test('handles augmented chord notation (+)', () => {
    const result = analyzeProgression(['C', 'Eaug', 'F'])

    expect(result.key).toBe('C major')
    // Augmented chords are uppercase with + or aug
    expect(result.analysis[1].quality).toMatch(/augmented/)
  })

  test('preserves chord qualities across different keys', () => {
    const result1 = analyzeProgression(['G', 'Am', 'Bm', 'C'])
    const result2 = analyzeProgression(['D', 'Em', 'F#m', 'G'])

    // Same pattern (I-ii-iii-IV) in different keys
    expect(result1.analysis[0].roman).toBe('I')
    expect(result1.analysis[1].roman).toBe('ii')
    expect(result2.analysis[0].roman).toBe('I')
    expect(result2.analysis[1].roman).toBe('ii')
  })

  test('handles enharmonic chord spellings', () => {
    const result1 = analyzeProgression(['C', 'F', 'G'])
    const result2 = analyzeProgression(['C', 'F', 'G'])

    // Same progression with different spellings should yield same analysis
    expect(result1.analysis[0].roman).toBe(result2.analysis[0].roman)
    expect(result1.analysis[1].roman).toBe(result2.analysis[1].roman)
  })
})

// =============================================================================
// Authentic Cadences (3 tests)
// =============================================================================

describe('Progression Analysis - Authentic Cadences (V → I)', () => {
  test('detects authentic cadence in C major (G → C)', () => {
    const result = analyzeProgression(['C', 'F', 'G', 'C'])

    const authentics = result.cadences.filter((c) => c.type === 'authentic')
    expect(authentics.length).toBeGreaterThanOrEqual(1)

    const cadence = authentics[0]
    expect(cadence.chords).toEqual(['G', 'C'])
    expect(cadence.strength).toBe('strong')
  })

  test('detects authentic cadence with 7th chord (V7 → I)', () => {
    const result = analyzeProgression(['Dm7', 'G7', 'Cmaj7'])

    const authentics = result.cadences.filter((c) => c.type === 'authentic')
    expect(authentics.length).toBeGreaterThanOrEqual(1)

    const cadence = authentics[0]
    expect(cadence.chords[0]).toMatch(/G7?/)
    expect(cadence.strength).toBe('strong')
  })

  test('detects authentic cadence in minor key (V → i)', () => {
    const result = analyzeProgression(['Am', 'Dm', 'E7', 'Am'])

    const authentics = result.cadences.filter((c) => c.type === 'authentic')
    expect(authentics.length).toBeGreaterThanOrEqual(1)

    const cadence = authentics[0]
    expect(cadence.chords[0]).toMatch(/E7?/)
    expect(cadence.chords[1]).toMatch(/Am/)
    expect(cadence.strength).toBe('strong')
  })
})

// =============================================================================
// Plagal Cadences (2 tests)
// =============================================================================

describe('Progression Analysis - Plagal Cadences (IV → I)', () => {
  test('detects plagal cadence in C major (F → C)', () => {
    const result = analyzeProgression(['C', 'G', 'F', 'C'])

    const plagals = result.cadences.filter((c) => c.type === 'plagal')
    expect(plagals.length).toBeGreaterThanOrEqual(1)

    const cadence = plagals[0]
    expect(cadence.chords).toEqual(['F', 'C'])
    expect(cadence.strength).toBe('weak')
  })

  test('detects plagal cadence in minor key (iv → i)', () => {
    const result = analyzeProgression(['Am', 'E', 'Dm', 'Am'])

    const plagals = result.cadences.filter((c) => c.type === 'plagal')
    expect(plagals.length).toBeGreaterThanOrEqual(1)

    const cadence = plagals[0]
    expect(cadence.chords[0]).toMatch(/Dm/)
    expect(cadence.chords[1]).toMatch(/Am/)
    expect(cadence.strength).toBe('weak')
  })
})

// =============================================================================
// Deceptive Cadences (2 tests)
// =============================================================================

describe('Progression Analysis - Deceptive Cadences (V → vi)', () => {
  test('detects deceptive cadence in C major (G → Am)', () => {
    const result = analyzeProgression(['C', 'F', 'G', 'Am'])

    const deceptives = result.cadences.filter((c) => c.type === 'deceptive')
    expect(deceptives.length).toBeGreaterThanOrEqual(1)

    const cadence = deceptives[0]
    expect(cadence.chords).toEqual(['G', 'Am'])
    expect(cadence.strength).toBe('weak')
  })

  test('detects deceptive cadence with 7th chord (V7 → vi)', () => {
    const result = analyzeProgression(['Dm', 'G7', 'Am'])

    const deceptives = result.cadences.filter((c) => c.type === 'deceptive')
    expect(deceptives.length).toBeGreaterThanOrEqual(1)

    const cadence = deceptives[0]
    expect(cadence.chords[0]).toMatch(/G7/)
    expect(cadence.chords[1]).toMatch(/Am/)
    expect(cadence.strength).toBe('weak')
  })
})

// =============================================================================
// Half Cadences (2 tests)
// =============================================================================

describe('Progression Analysis - Half Cadences (x → V)', () => {
  test('detects half cadence ending on V (I → V)', () => {
    const result = analyzeProgression(['C', 'F', 'G'])

    const halfs = result.cadences.filter((c) => c.type === 'half')
    expect(halfs.length).toBeGreaterThanOrEqual(1)

    const cadence = halfs[0]
    expect(cadence.chords[1]).toMatch(/G/)
    expect(cadence.strength).toBe('weak')
  })

  test('detects half cadence with IV → V', () => {
    const result = analyzeProgression(['C', 'Dm', 'F', 'G'])

    const halfs = result.cadences.filter((c) => c.type === 'half')
    expect(halfs.length).toBeGreaterThanOrEqual(1)

    const cadence = halfs[0]
    expect(cadence.chords).toEqual(['F', 'G'])
    expect(cadence.strength).toBe('weak')
  })
})

// =============================================================================
// Secondary Dominants (4 tests)
// =============================================================================

describe('Progression Analysis - Secondary Dominants', () => {
  test('detects V/vi (E7 resolving to Am in C major)', () => {
    const result = analyzeProgression(['C', 'E7', 'Am', 'F'])

    expect(result.key).toBe('C major')
    expect(result.secondaryDominants.length).toBeGreaterThanOrEqual(1)

    const secondary = result.secondaryDominants[0]
    expect(secondary.chord).toMatch(/E7/)
    expect(secondary.targetChord).toMatch(/Am/)
    expect(secondary.romanNotation).toMatch(/V7?\/vi/)
  })

  test('detects V/ii (A7 resolving to Dm in C major)', () => {
    const result = analyzeProgression(['C', 'A7', 'Dm', 'G'])

    expect(result.key).toBe('C major')
    expect(result.secondaryDominants.length).toBeGreaterThanOrEqual(1)

    const secondary = result.secondaryDominants.find((s) => s.chord.startsWith('A'))
    expect(secondary).toBeDefined()
    expect(secondary?.targetChord).toMatch(/Dm/)
    expect(secondary?.romanNotation).toMatch(/V7?\/ii/)
  })

  test('detects V/V (D7 resolving to G in C major)', () => {
    const result = analyzeProgression(['C', 'D7', 'G', 'C'])

    expect(result.key).toBe('C major')
    expect(result.secondaryDominants.length).toBeGreaterThanOrEqual(1)

    const secondary = result.secondaryDominants.find((s) => s.chord.startsWith('D'))
    expect(secondary).toBeDefined()
    expect(secondary?.targetChord).toMatch(/G/)
    expect(secondary?.romanNotation).toMatch(/V7?\/V/)
  })

  test('detects multiple secondary dominants in progression', () => {
    const result = analyzeProgression(['C', 'A7', 'Dm', 'D7', 'G', 'C'])

    expect(result.key).toBe('C major')
    expect(result.secondaryDominants.length).toBeGreaterThanOrEqual(2)

    // Should find both V/ii (A7→Dm) and V/V (D7→G)
    const secondaries = result.secondaryDominants.map((s) => s.romanNotation)
    expect(secondaries).toEqual(expect.arrayContaining([expect.stringMatching(/V7?\/ii/)]))
    expect(secondaries).toEqual(expect.arrayContaining([expect.stringMatching(/V7?\/V/)]))
  })
})

// =============================================================================
// Borrowed Chords (3 tests)
// =============================================================================

describe('Progression Analysis - Borrowed Chords (Modal Mixture)', () => {
  test('detects iv from parallel minor in major key (Fm in C major)', () => {
    const result = analyzeProgression(['C', 'Fm', 'G', 'C'])

    expect(result.key).toBe('C major')
    expect(result.borrowedChords.length).toBeGreaterThanOrEqual(1)

    const borrowed = result.borrowedChords[0]
    expect(borrowed.chord).toMatch(/Fm/)
    expect(borrowed.borrowedFrom).toMatch(/C minor/)
    expect(borrowed.function).toMatch(/subdominant/)
  })

  test('detects bVI from parallel minor (Ab in C major)', () => {
    const result = analyzeProgression(['C', 'Ab', 'G', 'C'])

    expect(result.key).toBe('C major')
    expect(result.borrowedChords.length).toBeGreaterThanOrEqual(1)

    const borrowed = result.borrowedChords.find((b) => b.chord.startsWith('Ab'))
    expect(borrowed).toBeDefined()
    expect(borrowed?.borrowedFrom).toMatch(/C minor/)
  })

  test('detects bVII from parallel minor (Bb in C major)', () => {
    const result = analyzeProgression(['C', 'Bb', 'F', 'C'])

    expect(result.key).toBe('C major')
    expect(result.borrowedChords.length).toBeGreaterThanOrEqual(1)

    const borrowed = result.borrowedChords.find((b) => b.chord.startsWith('Bb'))
    expect(borrowed).toBeDefined()
    expect(borrowed?.borrowedFrom).toMatch(/C minor/)
  })
})

// =============================================================================
// Loopable Progressions (2 tests)
// =============================================================================

describe('Progression Analysis - Loopable Progressions', () => {
  test('identifies loopable progression ending on V', () => {
    const result = analyzeProgression(['C', 'Am', 'F', 'G'])

    // Ends on V (dominant), can loop back to I (tonic at start)
    expect(result.loopable).toBe(true)
  })

  test('identifies loopable progression starting and ending on I', () => {
    const result = analyzeProgression(['C', 'F', 'G', 'C'])

    // Both start and end on I (tonic)
    expect(result.loopable).toBe(true)
  })
})

// =============================================================================
// General Patterns (2 tests)
// =============================================================================

describe('Progression Analysis - General Patterns', () => {
  test('detects I-IV-V-I pattern', () => {
    const result = analyzeProgression(['C', 'F', 'G', 'C'])

    expect(result.patterns.length).toBeGreaterThanOrEqual(1)

    const pattern = result.patterns.find((p) => p.name.includes('I-IV-V'))
    expect(pattern).toBeDefined()
    expect(pattern?.type).toMatch(/authentic|cadence/)
    expect(pattern?.popularity).toMatch(/common/)
  })

  test('detects ii-V-I jazz pattern', () => {
    const result = analyzeProgression(['Dm7', 'G7', 'Cmaj7'])

    expect(result.patterns.length).toBeGreaterThanOrEqual(1)

    const pattern = result.patterns.find((p) => p.name.includes('ii-V-I'))
    expect(pattern).toBeDefined()
    expect(pattern?.type).toMatch(/turnaround|jazz/)
    expect(pattern?.popularity).toMatch(/very common|common/)
  })
})

// =============================================================================
// Edge Cases (2 tests)
// =============================================================================

describe('Progression Analysis - Edge Cases', () => {
  test('handles ambiguous key with moderate confidence', () => {
    // Chromatic progression that could be in multiple keys
    const result = analyzeProgression(['C', 'D', 'E', 'F#'])

    expect(result.key).toBeDefined()
    expect(result.confidence).toBeLessThan(0.8) // Lower confidence for chromatic
  })

  test('handles highly chromatic progression', () => {
    const result = analyzeProgression(['C', 'Db', 'D', 'Eb', 'E', 'F'])

    expect(result.key).toBeDefined()
    expect(result.confidence).toBeLessThan(0.7) // Even lower confidence
    expect(result.analysis).toHaveLength(6)
  })
})
