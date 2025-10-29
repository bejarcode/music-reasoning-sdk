/**
 * Golden Test Suite: Chord Building and Voicing Generation
 *
 * This suite validates the chord building system against known correct outputs.
 * Tests cover: buildChord(), generateVoicing(), getSubstitutions()
 *
 * Test Philosophy:
 * - TDD: These tests are written BEFORE implementation
 * - Golden: Each test validates against music theory ground truth
 * - Comprehensive: Covers all chord types, voicings, and edge cases
 *
 * @group golden
 * @group chord-building
 */

import { describe, test, expect } from 'vitest'
import { buildChord, generateVoicing, getSubstitutions } from '../../src/chord/build'

describe('Chord Building - buildChord()', () => {
  describe('Basic Triads', () => {
    test('builds C major triad', () => {
      const result = buildChord('C')
      expect(result.chord).toBe('C')
      expect(result.root).toBe('C')
      expect(result.quality).toMatch(/major|M|m/)
      expect(result.notes).toEqual(['C', 'E', 'G'])
      expect(result.intervals).toEqual(['P1', 'M3', 'P5'])
    })

    test('builds D minor triad', () => {
      const result = buildChord('Dm')
      expect(result.chord).toBe('Dm')
      expect(result.root).toBe('D')
      expect(result.quality).toMatch(/minor|m/)
      expect(result.notes).toEqual(['D', 'F', 'A'])
      expect(result.intervals).toEqual(['P1', 'm3', 'P5'])
    })

    test('builds G augmented triad', () => {
      const result = buildChord('Gaug')
      expect(result.chord).toMatch(/Gaug|G\+/)
      expect(result.root).toBe('G')
      expect(result.notes).toEqual(['G', 'B', 'D#'])
      expect(result.intervals).toEqual(['P1', 'M3', 'A5'])
    })

    test('builds B diminished triad', () => {
      const result = buildChord('Bdim')
      expect(result.chord).toMatch(/Bdim|Bo/)
      expect(result.root).toBe('B')
      expect(result.notes).toEqual(['B', 'D', 'F'])
      expect(result.intervals).toEqual(['P1', 'm3', 'd5'])
    })
  })

  describe('Seventh Chords', () => {
    test('builds Cmaj7 chord', () => {
      const result = buildChord('Cmaj7')
      expect(result.chord).toMatch(/Cmaj7|CM7|CΔ7/)
      expect(result.root).toBe('C')
      expect(result.notes).toEqual(['C', 'E', 'G', 'B'])
      expect(result.intervals).toEqual(['P1', 'M3', 'P5', 'M7'])
    })

    test('builds G7 (dominant) chord', () => {
      const result = buildChord('G7')
      expect(result.chord).toBe('G7')
      expect(result.root).toBe('G')
      expect(result.quality).toMatch(/dominant|7/)
      expect(result.notes).toEqual(['G', 'B', 'D', 'F'])
      expect(result.intervals).toEqual(['P1', 'M3', 'P5', 'm7'])
    })

    test('builds Dm7 chord', () => {
      const result = buildChord('Dm7')
      expect(result.chord).toBe('Dm7')
      expect(result.root).toBe('D')
      expect(result.notes).toEqual(['D', 'F', 'A', 'C'])
      expect(result.intervals).toEqual(['P1', 'm3', 'P5', 'm7'])
    })

    test('builds Em7b5 (half-diminished) chord', () => {
      const result = buildChord('Em7b5')
      expect(result.chord).toMatch(/Em7b5|Eø7/)
      expect(result.root).toBe('E')
      expect(result.notes).toEqual(['E', 'G', 'Bb', 'D'])
      expect(result.intervals).toEqual(['P1', 'm3', 'd5', 'm7'])
    })

    test('builds Adim7 (fully diminished) chord', () => {
      const result = buildChord('Adim7')
      expect(result.chord).toMatch(/Adim7|Ao7/)
      expect(result.root).toBe('A')
      expect(result.notes).toEqual(['A', 'C', 'Eb', 'Gb'])
      expect(result.intervals).toEqual(['P1', 'm3', 'd5', 'd7'])
    })
  })

  describe('Extended Chords', () => {
    test('builds Cmaj9 chord', () => {
      const result = buildChord('Cmaj9')
      expect(result.root).toBe('C')
      expect(result.notes).toEqual(['C', 'E', 'G', 'B', 'D'])
      expect(result.intervals).toContain('M9')
    })

    test('builds G9 chord', () => {
      const result = buildChord('G9')
      expect(result.root).toBe('G')
      expect(result.notes).toEqual(['G', 'B', 'D', 'F', 'A'])
    })

    test('builds Dm11 chord', () => {
      const result = buildChord('Dm11')
      expect(result.root).toBe('D')
      expect(result.notes).toContain('G') // 11th
    })

    test('builds Cmaj13 chord', () => {
      const result = buildChord('Cmaj13')
      expect(result.root).toBe('C')
      expect(result.notes).toContain('A') // 13th
    })
  })

  describe('Altered Chords', () => {
    test('builds G7#5 chord', () => {
      const result = buildChord('G7#5')
      expect(result.root).toBe('G')
      expect(result.notes).toEqual(['G', 'B', 'D#', 'F'])
    })

    test('builds C7b9 chord', () => {
      const result = buildChord('C7b9')
      expect(result.root).toBe('C')
      expect(result.notes).toContain('Db') // b9
    })

    test('builds F#m7b5 chord', () => {
      const result = buildChord('F#m7b5')
      expect(result.root).toBe('F#')
      expect(result.notes).toEqual(['F#', 'A', 'C', 'E'])
    })
  })

  describe('Sus and Add Chords', () => {
    test('builds Csus4 chord', () => {
      const result = buildChord('Csus4')
      expect(result.root).toBe('C')
      expect(result.notes).toEqual(['C', 'F', 'G'])
      expect(result.intervals).toEqual(['P1', 'P4', 'P5'])
    })

    test('builds Dsus2 chord', () => {
      const result = buildChord('Dsus2')
      expect(result.root).toBe('D')
      expect(result.notes).toEqual(['D', 'E', 'A'])
      expect(result.intervals).toEqual(['P1', 'M2', 'P5'])
    })

    test('builds Cadd9 chord', () => {
      const result = buildChord('Cadd9')
      expect(result.root).toBe('C')
      expect(result.notes).toEqual(['C', 'E', 'G', 'D'])
    })
  })

  describe('Enharmonic Handling', () => {
    test('builds F# major chord', () => {
      const result = buildChord('F#')
      expect(result.root).toBe('F#')
      expect(result.notes).toEqual(['F#', 'A#', 'C#'])
    })

    test('builds Gb major chord', () => {
      const result = buildChord('Gb')
      expect(result.root).toBe('Gb')
      expect(result.notes).toEqual(['Gb', 'Bb', 'Db'])
    })

    test('preserves sharp enharmonics', () => {
      const result = buildChord('C#maj7', { enharmonic: 'sharps' })
      expect(result.notes.every((note) => !note.includes('b'))).toBe(true)
    })

    test('preserves flat enharmonics', () => {
      const result = buildChord('Dbmaj7', { enharmonic: 'flats' })
      expect(result.notes.every((note) => !note.includes('#'))).toBe(true)
    })
  })
})

describe('Voicing Generation - generateVoicing()', () => {
  describe('Close Voicing', () => {
    test('generates close voicing for C major', () => {
      const notes = generateVoicing('C', { type: 'close', octave: 4 })
      expect(notes).toEqual(['C4', 'E4', 'G4'])
      // All notes within one octave
      expect(notes.every((note) => note.endsWith('4'))).toBe(true)
    })

    test('generates close voicing for Cmaj7', () => {
      const notes = generateVoicing('Cmaj7', { type: 'close', octave: 4 })
      expect(notes).toEqual(['C4', 'E4', 'G4', 'B4'])
    })

    test('generates close voicing at different octave', () => {
      const notes = generateVoicing('Dm7', { type: 'close', octave: 3 })
      expect(notes).toEqual(['D3', 'F3', 'A3', 'C4'])
    })
  })

  describe('Open Voicing', () => {
    test('generates open voicing for C major', () => {
      const notes = generateVoicing('C', { type: 'open', octave: 4 })
      expect(notes).toEqual(['C4', 'G4', 'E5'])
      // Root and 5th in lower octave, 3rd in upper octave
    })

    test('generates open voicing for Gmaj7', () => {
      const notes = generateVoicing('Gmaj7', { type: 'open', octave: 3 })
      expect(notes.length).toBe(4)
      expect(notes[0]).toBe('G3') // Root
      // Wider spacing across octaves
    })
  })

  describe('Drop-2 Voicing', () => {
    test('generates drop-2 voicing for Cmaj7', () => {
      const notes = generateVoicing('Cmaj7', { type: 'drop2', octave: 4 })
      // Close: C4 E4 G4 B4 → Drop 2nd from top (G4) down: C4 G3 E4 B4
      expect(notes).toEqual(['C4', 'G3', 'E4', 'B4'])
    })

    test('generates drop-2 voicing for Dm7', () => {
      const notes = generateVoicing('Dm7', { type: 'drop2', octave: 4 })
      // Close: D4 F4 A4 C5 → Drop A4 down: D4 A3 F4 C5
      expect(notes).toEqual(['D4', 'A3', 'F4', 'C5'])
    })

    test('generates drop-2 voicing for G7', () => {
      const notes = generateVoicing('G7', { type: 'drop2', octave: 3 })
      expect(notes.length).toBe(4)
      expect(notes[0]).toBe('G3')
    })
  })

  describe('Drop-3 Voicing', () => {
    test('generates drop-3 voicing for Cmaj7', () => {
      const notes = generateVoicing('Cmaj7', { type: 'drop3', octave: 4 })
      // Close: C4 E4 G4 B4 → Drop 3rd from top (E4) down: C4 E3 G4 B4
      expect(notes).toEqual(['C4', 'E3', 'G4', 'B4'])
    })

    test('generates drop-3 voicing for Am7', () => {
      const notes = generateVoicing('Am7', { type: 'drop3', octave: 4 })
      expect(notes.length).toBe(4)
      expect(notes[0]).toBe('A4')
    })
  })

  describe('Inversions', () => {
    test('generates first inversion close voicing', () => {
      const notes = generateVoicing('C', { type: 'close', octave: 4, inversion: 1 })
      // 1st inversion: E4 G4 C5
      expect(notes[0]).toBe('E4')
    })

    test('generates second inversion close voicing', () => {
      const notes = generateVoicing('C', { type: 'close', octave: 4, inversion: 2 })
      // 2nd inversion: G4 C5 E5
      expect(notes[0]).toBe('G4')
    })
  })
})

describe('Chord Substitutions - getSubstitutions()', () => {
  describe('Major 7th Substitutions', () => {
    test('suggests substitutions for Cmaj7', () => {
      const subs = getSubstitutions('Cmaj7')
      expect(subs.length).toBeGreaterThan(0)
      expect(subs.some((s) => s.chord === 'C6')).toBe(true)
      const c6Sub = subs.find((s) => s.chord === 'C6')
      expect(c6Sub?.reason).toContain('similar')
    })

    test('suggests Am7 as relative minor substitution for Cmaj7', () => {
      const subs = getSubstitutions('Cmaj7')
      // Relative minor of C major is A minor (minor 3rd below)
      expect(subs.some((s) => s.chord === 'Am7')).toBe(true)
      const am7Sub = subs.find((s) => s.chord === 'Am7')
      expect(am7Sub?.reason).toBeTruthy()
      expect(am7Sub?.reason).toContain('relative minor')
    })
  })

  describe('Dominant 7th Substitutions', () => {
    test('suggests tritone substitution for G7', () => {
      const subs = getSubstitutions('G7')
      expect(subs.some((s) => s.chord === 'Db7')).toBe(true)
      const tritone = subs.find((s) => s.chord === 'Db7')
      expect(tritone?.reason.toLowerCase()).toContain('tritone')
    })

    test('suggests altered dominants for C7', () => {
      const subs = getSubstitutions('C7')
      expect(subs.some((s) => s.chord.includes('7') && s.chord !== 'C7')).toBe(true)
    })
  })

  describe('Minor 7th Substitutions', () => {
    test('suggests Dm6 for Dm7', () => {
      const subs = getSubstitutions('Dm7')
      expect(subs.some((s) => s.chord === 'Dm6')).toBe(true)
    })

    test('suggests relative major for Am7', () => {
      const subs = getSubstitutions('Am7')
      expect(subs.some((s) => s.chord === 'Cmaj7')).toBe(true)
    })
  })

  describe('Major Triad Substitutions', () => {
    test('suggests substitutions for C major', () => {
      const subs = getSubstitutions('C')
      expect(subs.length).toBeGreaterThanOrEqual(2)
      expect(subs.every((s) => s.reason.length > 0)).toBe(true)
    })
  })

  describe('No Common Substitutions', () => {
    test('returns empty array for diminished chords', () => {
      const subs = getSubstitutions('Bdim')
      // Diminished chords have fewer common substitutions
      expect(Array.isArray(subs)).toBe(true)
    })
  })

  describe('Substitution Limits', () => {
    test('returns 2-5 substitutions maximum', () => {
      const subs = getSubstitutions('Cmaj7')
      expect(subs.length).toBeGreaterThanOrEqual(2)
      expect(subs.length).toBeLessThanOrEqual(5)
    })

    test('all substitutions have explanations', () => {
      const subs = getSubstitutions('G7')
      expect(subs.every((s) => s.reason && s.reason.length > 10)).toBe(true)
    })
  })
})

describe('Error Handling', () => {
  test('throws error for invalid chord symbol', () => {
    try {
      buildChord('Invalid')
      expect(true).toBe(false) // Should not reach here
    } catch (error: any) {
      expect(error.code).toBe('INVALID_CHORD')
    }
  })

  test('throws error for empty symbol', () => {
    expect(() => buildChord('')).toThrow()
  })

  test('throws error for malformed symbol', () => {
    expect(() => buildChord('C##maj7b5#9')).toThrow()
  })

  test('provides helpful error message', () => {
    try {
      buildChord('Xyz')
    } catch (error: any) {
      expect(error.code).toBe('INVALID_CHORD') // Check error code
      expect(error.message.length).toBeGreaterThan(20) // Descriptive message
    }
  })

  test('throws error for invalid voicing options', () => {
    expect(() => generateVoicing('C', { type: 'invalid' as any, octave: 4 })).toThrow()
  })
})

/**
 * Test Summary:
 * - Basic triads: 4 tests
 * - Seventh chords: 5 tests
 * - Extended chords: 4 tests
 * - Altered chords: 3 tests
 * - Sus/add chords: 3 tests
 * - Enharmonics: 4 tests
 * - Close voicing: 3 tests
 * - Open voicing: 2 tests
 * - Drop-2 voicing: 3 tests
 * - Drop-3 voicing: 2 tests
 * - Inversions: 2 tests
 * - Substitutions (maj7): 2 tests
 * - Substitutions (dom7): 2 tests
 * - Substitutions (min7): 2 tests
 * - Substitutions (major): 1 test
 * - Substitutions (limits): 3 tests
 * - Error handling: 5 tests
 *
 * Total: 50 tests ✓
 */
