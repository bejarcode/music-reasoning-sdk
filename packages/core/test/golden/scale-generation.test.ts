/**
 * Golden Tests: Scale Generation and Modal Analysis
 *
 * Comprehensive test suite for scale generation covering:
 * - Major and minor scales (all keys)
 * - Harmonic and melodic minor variations
 * - All 7 modal scales
 * - Pentatonic scales (major/minor)
 * - Blues, whole tone, and diminished scales
 * - Scale relationships (relative/parallel)
 *
 * Test Strategy: TDD - Tests written first, implementation follows
 * Success Criteria: 60+ tests passing with 100% accuracy
 *
 * @since v1.0.0
 */

import { describe, test, expect } from 'vitest'
import { getScale } from '../../src/scale'
import type { ScaleInfo } from '../../src/types'

describe('Scale Generation - Major Scales (12 tests)', () => {
  test('generates C major scale', () => {
    const result = getScale('C', 'major')
    expect(result.root).toBe('C')
    expect(result.type).toBe('major')
    expect(result.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(result.intervals).toEqual(['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'])
    expect(result.formula).toBe('W-W-H-W-W-W-H')
    expect(result.degrees.length).toBe(7)
    expect(result.degrees[0]).toEqual({ note: 'C', degree: 1, name: 'tonic' })
    expect(result.modes.length).toBe(7)
    expect(result.relativeMinor).toBe('A minor')
    expect(result.parallelMinor).toBe('C minor')
  })

  test('generates D major scale', () => {
    const result = getScale('D', 'major')
    expect(result.notes).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#'])
    expect(result.relativeMinor).toBe('B minor')
  })

  test('generates E major scale', () => {
    const result = getScale('E', 'major')
    expect(result.notes).toEqual(['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'])
    expect(result.relativeMinor).toBe('C# minor')
  })

  test('generates F major scale', () => {
    const result = getScale('F', 'major')
    expect(result.notes).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E'])
    expect(result.relativeMinor).toBe('D minor')
  })

  test('generates G major scale', () => {
    const result = getScale('G', 'major')
    expect(result.notes).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#'])
    expect(result.relativeMinor).toBe('E minor')
  })

  test('generates A major scale', () => {
    const result = getScale('A', 'major')
    expect(result.notes).toEqual(['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'])
    expect(result.relativeMinor).toBe('F# minor')
  })

  test('generates B major scale', () => {
    const result = getScale('B', 'major')
    expect(result.notes).toEqual(['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'])
    expect(result.relativeMinor).toBe('G# minor')
  })

  test('generates Db major scale', () => {
    const result = getScale('Db', 'major')
    expect(result.notes).toEqual(['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'])
    expect(result.relativeMinor).toBe('Bb minor')
  })

  test('generates Eb major scale', () => {
    const result = getScale('Eb', 'major')
    expect(result.notes).toEqual(['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'])
    expect(result.relativeMinor).toBe('C minor')
  })

  test('generates Ab major scale', () => {
    const result = getScale('Ab', 'major')
    expect(result.notes).toEqual(['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'])
    expect(result.relativeMinor).toBe('F minor')
  })

  test('generates Bb major scale', () => {
    const result = getScale('Bb', 'major')
    expect(result.notes).toEqual(['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'])
    expect(result.relativeMinor).toBe('G minor')
  })

  test('generates F# major scale', () => {
    const result = getScale('F#', 'major')
    expect(result.notes).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'])
    expect(result.relativeMinor).toBe('D# minor')
  })
})

describe('Scale Generation - Natural Minor Scales (12 tests)', () => {
  test('generates A natural minor scale', () => {
    const result = getScale('A', 'minor')
    expect(result.root).toBe('A')
    expect(result.type).toBe('minor')
    expect(result.notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(result.intervals).toEqual(['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7'])
    expect(result.formula).toBe('W-H-W-W-H-W-W')
    expect(result.relativeMajor).toBe('C major')
    expect(result.parallelMajor).toBe('A major')
  })

  test('generates B minor scale', () => {
    const result = getScale('B', 'minor')
    expect(result.notes).toEqual(['B', 'C#', 'D', 'E', 'F#', 'G', 'A'])
    expect(result.relativeMajor).toBe('D major')
  })

  test('generates C minor scale', () => {
    const result = getScale('C', 'minor')
    expect(result.notes).toEqual(['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'])
    expect(result.relativeMajor).toBe('Eb major')
  })

  test('generates D minor scale', () => {
    const result = getScale('D', 'minor')
    expect(result.notes).toEqual(['D', 'E', 'F', 'G', 'A', 'Bb', 'C'])
    expect(result.relativeMajor).toBe('F major')
  })

  test('generates E minor scale', () => {
    const result = getScale('E', 'minor')
    expect(result.notes).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D'])
    expect(result.relativeMajor).toBe('G major')
  })

  test('generates F# minor scale', () => {
    const result = getScale('F#', 'minor')
    expect(result.notes).toEqual(['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'])
    expect(result.relativeMajor).toBe('A major')
  })

  test('generates G# minor scale', () => {
    const result = getScale('G#', 'minor')
    expect(result.notes).toEqual(['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'])
    expect(result.relativeMajor).toBe('B major')
  })

  test('generates Bb minor scale', () => {
    const result = getScale('Bb', 'minor')
    expect(result.notes).toEqual(['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'])
    expect(result.relativeMajor).toBe('Db major')
  })

  test('generates C# minor scale', () => {
    const result = getScale('C#', 'minor')
    expect(result.notes).toEqual(['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'])
    expect(result.relativeMajor).toBe('E major')
  })

  test('generates D# minor scale', () => {
    const result = getScale('D#', 'minor')
    expect(result.notes).toEqual(['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'])
    expect(result.relativeMajor).toBe('F# major')
  })

  test('generates F minor scale', () => {
    const result = getScale('F', 'minor')
    expect(result.notes).toEqual(['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'])
    expect(result.relativeMajor).toBe('Ab major')
  })

  test('generates G minor scale', () => {
    const result = getScale('G', 'minor')
    expect(result.notes).toEqual(['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'])
    expect(result.relativeMajor).toBe('Bb major')
  })
})

describe('Scale Generation - Harmonic Minor Scales (6 tests)', () => {
  test('generates C harmonic minor scale', () => {
    const result = getScale('C', 'harmonic minor')
    expect(result.notes).toEqual(['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'])
    expect(result.intervals).toEqual(['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'M7'])
    expect(result.formula).toBe('W-H-W-W-H-W+H-H')
  })

  test('generates D harmonic minor scale', () => {
    const result = getScale('D', 'harmonic minor')
    expect(result.notes).toEqual(['D', 'E', 'F', 'G', 'A', 'Bb', 'C#'])
  })

  test('generates E harmonic minor scale', () => {
    const result = getScale('E', 'harmonic minor')
    expect(result.notes).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D#'])
  })

  test('generates F harmonic minor scale', () => {
    const result = getScale('F', 'harmonic minor')
    expect(result.notes).toEqual(['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'E'])
  })

  test('generates G harmonic minor scale', () => {
    const result = getScale('G', 'harmonic minor')
    expect(result.notes).toEqual(['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F#'])
  })

  test('generates A harmonic minor scale', () => {
    const result = getScale('A', 'harmonic minor')
    expect(result.notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#'])
  })
})

describe('Scale Generation - Melodic Minor Scales (6 tests)', () => {
  test('generates C melodic minor scale (ascending)', () => {
    const result = getScale('C', 'melodic minor')
    expect(result.notes).toEqual(['C', 'D', 'Eb', 'F', 'G', 'A', 'B'])
    expect(result.intervals).toEqual(['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'M7'])
  })

  test('generates D melodic minor scale', () => {
    const result = getScale('D', 'melodic minor')
    expect(result.notes).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C#'])
  })

  test('generates E melodic minor scale', () => {
    const result = getScale('E', 'melodic minor')
    expect(result.notes).toEqual(['E', 'F#', 'G', 'A', 'B', 'C#', 'D#'])
  })

  test('generates F melodic minor scale', () => {
    const result = getScale('F', 'melodic minor')
    expect(result.notes).toEqual(['F', 'G', 'Ab', 'Bb', 'C', 'D', 'E'])
  })

  test('generates G melodic minor scale', () => {
    const result = getScale('G', 'melodic minor')
    expect(result.notes).toEqual(['G', 'A', 'Bb', 'C', 'D', 'E', 'F#'])
  })

  test('generates A melodic minor scale', () => {
    const result = getScale('A', 'melodic minor')
    expect(result.notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F#', 'G#'])
  })
})

describe('Scale Generation - Modal Scales (14 tests)', () => {
  test('generates C ionian mode (same as major)', () => {
    const result = getScale('C', 'ionian')
    expect(result.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(result.formula).toBe('W-W-H-W-W-W-H')
  })

  test('generates D ionian mode', () => {
    const result = getScale('D', 'ionian')
    expect(result.notes).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#'])
  })

  test('generates D dorian mode', () => {
    const result = getScale('D', 'dorian')
    expect(result.notes).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C'])
    expect(result.formula).toBe('W-H-W-W-W-H-W')
  })

  test('generates E dorian mode', () => {
    const result = getScale('E', 'dorian')
    expect(result.notes).toEqual(['E', 'F#', 'G', 'A', 'B', 'C#', 'D'])
  })

  test('generates E phrygian mode', () => {
    const result = getScale('E', 'phrygian')
    expect(result.notes).toEqual(['E', 'F', 'G', 'A', 'B', 'C', 'D'])
    expect(result.formula).toBe('H-W-W-W-H-W-W')
  })

  test('generates F phrygian mode', () => {
    const result = getScale('F', 'phrygian')
    expect(result.notes).toEqual(['F', 'Gb', 'Ab', 'Bb', 'C', 'Db', 'Eb'])
  })

  test('generates F lydian mode', () => {
    const result = getScale('F', 'lydian')
    expect(result.notes).toEqual(['F', 'G', 'A', 'B', 'C', 'D', 'E'])
    expect(result.formula).toBe('W-W-W-H-W-W-H')
  })

  test('generates C lydian mode', () => {
    const result = getScale('C', 'lydian')
    expect(result.notes).toEqual(['C', 'D', 'E', 'F#', 'G', 'A', 'B'])
  })

  test('generates G mixolydian mode', () => {
    const result = getScale('G', 'mixolydian')
    expect(result.notes).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F'])
    expect(result.formula).toBe('W-W-H-W-W-H-W')
  })

  test('generates D mixolydian mode', () => {
    const result = getScale('D', 'mixolydian')
    expect(result.notes).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C'])
  })

  test('generates A aeolian mode (same as natural minor)', () => {
    const result = getScale('A', 'aeolian')
    expect(result.notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(result.formula).toBe('W-H-W-W-H-W-W')
  })

  test('generates E aeolian mode', () => {
    const result = getScale('E', 'aeolian')
    expect(result.notes).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D'])
  })

  test('generates B locrian mode', () => {
    const result = getScale('B', 'locrian')
    expect(result.notes).toEqual(['B', 'C', 'D', 'E', 'F', 'G', 'A'])
    expect(result.formula).toBe('H-W-W-H-W-W-W')
  })

  test('generates D locrian mode', () => {
    const result = getScale('D', 'locrian')
    expect(result.notes).toEqual(['D', 'Eb', 'F', 'G', 'Ab', 'Bb', 'C'])
  })
})

describe('Scale Generation - Pentatonic Scales (4 tests)', () => {
  test('generates C major pentatonic scale', () => {
    const result = getScale('C', 'major pentatonic')
    expect(result.notes).toEqual(['C', 'D', 'E', 'G', 'A'])
    expect(result.notes.length).toBe(5)
    expect(result.modes.length).toBe(0) // Pentatonic doesn't have 7 modes
  })

  test('generates G major pentatonic scale', () => {
    const result = getScale('G', 'major pentatonic')
    expect(result.notes).toEqual(['G', 'A', 'B', 'D', 'E'])
  })

  test('generates A minor pentatonic scale', () => {
    const result = getScale('A', 'minor pentatonic')
    expect(result.notes).toEqual(['A', 'C', 'D', 'E', 'G'])
    expect(result.notes.length).toBe(5)
  })

  test('generates E minor pentatonic scale', () => {
    const result = getScale('E', 'minor pentatonic')
    expect(result.notes).toEqual(['E', 'G', 'A', 'B', 'D'])
  })
})

describe('Scale Generation - Blues Scales (2 tests)', () => {
  test('generates C blues scale', () => {
    const result = getScale('C', 'blues')
    expect(result.notes).toEqual(['C', 'Eb', 'F', 'Gb', 'G', 'Bb'])
    expect(result.notes.length).toBe(6)
  })

  test('generates A blues scale', () => {
    const result = getScale('A', 'blues')
    expect(result.notes).toEqual(['A', 'C', 'D', 'Eb', 'E', 'G'])
  })
})

describe('Scale Generation - Exotic Scales (3 tests)', () => {
  test('generates C whole tone scale', () => {
    const result = getScale('C', 'whole tone')
    expect(result.notes).toEqual(['C', 'D', 'E', 'F#', 'G#', 'A#'])
    expect(result.notes.length).toBe(6)
    expect(result.formula).toMatch(/W-W-W-W-W-W/)
    expect(result.modes.length).toBe(0) // No modal rotation for whole tone
  })

  test('generates C diminished scale (whole-half)', () => {
    const result = getScale('C', 'diminished')
    // Tonal.js uses whole-half diminished pattern for "diminished"
    expect(result.notes).toEqual(['C', 'D', 'Eb', 'F', 'Gb', 'Ab', 'A', 'B'])
    expect(result.notes.length).toBe(8)
    expect(result.modes.length).toBe(0) // No modal rotation for diminished
  })

  test('generates C chromatic scale (all 12 notes)', () => {
    const result = getScale('C', 'chromatic')
    expect(result.notes).toEqual(['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'])
    expect(result.notes.length).toBe(12)
    expect(result.intervals).toEqual([
      'P1',
      'm2',
      'M2',
      'm3',
      'M3',
      'P4',
      'A4',
      'P5',
      'm6',
      'M6',
      'm7',
      'M7',
    ])
    expect(result.formula).toBe('H-H-H-H-H-H-H-H-H-H-H-H')
    expect(result.modes.length).toBe(0) // No modal rotation for chromatic
    expect(result.relativeMinor).toBeUndefined() // No relationships for chromatic
    expect(result.relativeMajor).toBeUndefined()
  })
})

describe('Scale Generation - Scale Relationships (4 tests)', () => {
  test('identifies relative minor for C major', () => {
    const result = getScale('C', 'major')
    expect(result.relativeMinor).toBe('A minor')
  })

  test('identifies relative major for A minor', () => {
    const result = getScale('A', 'minor')
    expect(result.relativeMajor).toBe('C major')
  })

  test('identifies parallel minor for G major', () => {
    const result = getScale('G', 'major')
    expect(result.parallelMinor).toBe('G minor')
  })

  test('identifies parallel major for D minor', () => {
    const result = getScale('D', 'minor')
    expect(result.parallelMajor).toBe('D major')
  })
})

describe('Scale Generation - Input Normalization (6 tests)', () => {
  test('handles uppercase scale type', () => {
    const result = getScale('C', 'MAJOR')
    expect(result.type).toBe('major')
    expect(result.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  test('handles mixed case scale type', () => {
    const result = getScale('D', 'DoRiAn')
    expect(result.type).toBe('dorian')
    expect(result.notes).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C'])
  })

  test('handles extra whitespace in scale type', () => {
    const result = getScale('E', '  minor  ')
    expect(result.type).toBe('minor')
    expect(result.notes).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D'])
  })

  test('handles scale type aliases', () => {
    const ionianResult = getScale('F', 'ionian')
    const majorResult = getScale('F', 'major')

    expect(ionianResult.type).toBe('major')
    expect(majorResult.type).toBe('major')
    expect(ionianResult.notes).toEqual(majorResult.notes)
  })

  test('handles hyphenated scale types', () => {
    const result1 = getScale('G', 'harmonic minor')
    const result2 = getScale('G', 'harmonic-minor')

    expect(result1.type).toBe('harmonic minor')
    expect(result2.type).toBe('harmonic minor')
    expect(result1.notes).toEqual(result2.notes)
  })

  test('handles multiple whitespace and case variations', () => {
    const result = getScale('A', '  MELODIC   MINOR  ')
    expect(result.type).toBe('melodic minor')
    expect(result.notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F#', 'G#'])
  })
})

describe('Scale Generation - Invalid Inputs (2 tests)', () => {
  test('throws error for invalid root note', () => {
    try {
      getScale('X', 'major')
      expect.fail('Should have thrown an error')
    } catch (error: any) {
      expect(error.code).toBe('INVALID_ROOT')
      expect(error.message).toContain('Invalid root note')
    }
  })

  test('throws error for invalid scale type', () => {
    try {
      getScale('C', 'invalid-scale')
      expect.fail('Should have thrown an error')
    } catch (error: any) {
      expect(error.code).toBe('INVALID_SCALE_TYPE')
      expect(error.message).toContain('not recognized')
    }
  })
})
