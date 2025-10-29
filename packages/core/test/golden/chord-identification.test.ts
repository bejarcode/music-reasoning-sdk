/**
 * Golden Tests: Chord Identification
 *
 * Comprehensive test suite for chord identification accuracy.
 * Tests 90+ chord types across all 12 keys with edge cases.
 *
 * **Test Strategy:**
 * - Write tests FIRST (TDD approach)
 * - Ensure tests FAIL before implementation
 * - 100% accuracy on triads required
 * - 95%+ accuracy on 7th chords required
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import { describe, test, expect } from 'vitest'
import { identifyChord } from '../../src/chord/identify'
import type { ChordIdentification } from '../../src/types'

describe('Chord Identification - Major Triads (12 tests)', () => {
  test('identifies C major', () => {
    const result: ChordIdentification = identifyChord(['C', 'E', 'G'])
    expect(result.chord).toBe('C major')
    expect(result.root).toBe('C')
    expect(result.quality).toBe('major')
    expect(result.notes).toEqual(['C', 'E', 'G'])
    expect(result.intervals).toEqual(['P1', 'M3', 'P5'])
    expect(result.confidence).toBe(1.0)
  })

  test('identifies G major', () => {
    const result = identifyChord(['G', 'B', 'D'])
    expect(result.chord).toBe('G major')
    expect(result.root).toBe('G')
    expect(result.quality).toBe('major')
  })

  test('identifies D major', () => {
    const result = identifyChord(['D', 'F#', 'A'])
    expect(result.chord).toBe('D major')
    expect(result.root).toBe('D')
    expect(result.quality).toBe('major')
  })

  test('identifies A major', () => {
    const result = identifyChord(['A', 'C#', 'E'])
    expect(result.chord).toBe('A major')
    expect(result.root).toBe('A')
  })

  test('identifies E major', () => {
    const result = identifyChord(['E', 'G#', 'B'])
    expect(result.chord).toBe('E major')
    expect(result.root).toBe('E')
  })

  test('identifies B major', () => {
    const result = identifyChord(['B', 'D#', 'F#'])
    expect(result.chord).toBe('B major')
    expect(result.root).toBe('B')
  })

  test('identifies F# major', () => {
    const result = identifyChord(['F#', 'A#', 'C#'])
    expect(result.chord).toBe('F# major')
    expect(result.root).toBe('F#')
  })

  test('identifies Db major', () => {
    const result = identifyChord(['Db', 'F', 'Ab'])
    expect(result.chord).toBe('Db major')
    expect(result.root).toBe('Db')
  })

  test('identifies Ab major', () => {
    const result = identifyChord(['Ab', 'C', 'Eb'])
    expect(result.chord).toBe('Ab major')
    expect(result.root).toBe('Ab')
  })

  test('identifies Eb major', () => {
    const result = identifyChord(['Eb', 'G', 'Bb'])
    expect(result.chord).toBe('Eb major')
    expect(result.root).toBe('Eb')
  })

  test('identifies Bb major', () => {
    const result = identifyChord(['Bb', 'D', 'F'])
    expect(result.chord).toBe('Bb major')
    expect(result.root).toBe('Bb')
  })

  test('identifies F major', () => {
    const result = identifyChord(['F', 'A', 'C'])
    expect(result.chord).toBe('F major')
    expect(result.root).toBe('F')
  })
})

describe('Chord Identification - Minor Triads (12 tests)', () => {
  test('identifies A minor', () => {
    const result = identifyChord(['A', 'C', 'E'])
    expect(result.chord).toBe('A minor')
    expect(result.root).toBe('A')
    expect(result.quality).toBe('minor')
    expect(result.intervals).toEqual(['P1', 'm3', 'P5'])
  })

  test('identifies E minor', () => {
    const result = identifyChord(['E', 'G', 'B'])
    expect(result.chord).toBe('E minor')
    expect(result.root).toBe('E')
  })

  test('identifies B minor', () => {
    const result = identifyChord(['B', 'D', 'F#'])
    expect(result.chord).toBe('B minor')
    expect(result.root).toBe('B')
  })

  test('identifies F# minor', () => {
    const result = identifyChord(['F#', 'A', 'C#'])
    expect(result.chord).toBe('F# minor')
    expect(result.root).toBe('F#')
  })

  test('identifies C# minor', () => {
    const result = identifyChord(['C#', 'E', 'G#'])
    expect(result.chord).toBe('C# minor')
    expect(result.root).toBe('C#')
  })

  test('identifies G# minor', () => {
    const result = identifyChord(['G#', 'B', 'D#'])
    expect(result.chord).toBe('G# minor')
    expect(result.root).toBe('G#')
  })

  test('identifies Eb minor', () => {
    const result = identifyChord(['Eb', 'Gb', 'Bb'])
    expect(result.chord).toBe('Eb minor')
    expect(result.root).toBe('Eb')
  })

  test('identifies Bb minor', () => {
    const result = identifyChord(['Bb', 'Db', 'F'])
    expect(result.chord).toBe('Bb minor')
    expect(result.root).toBe('Bb')
  })

  test('identifies F minor', () => {
    const result = identifyChord(['F', 'Ab', 'C'])
    expect(result.chord).toBe('F minor')
    expect(result.root).toBe('F')
  })

  test('identifies C minor', () => {
    const result = identifyChord(['C', 'Eb', 'G'])
    expect(result.chord).toBe('C minor')
    expect(result.root).toBe('C')
  })

  test('identifies G minor', () => {
    const result = identifyChord(['G', 'Bb', 'D'])
    expect(result.chord).toBe('G minor')
    expect(result.root).toBe('G')
  })

  test('identifies D minor', () => {
    const result = identifyChord(['D', 'F', 'A'])
    expect(result.chord).toBe('D minor')
    expect(result.root).toBe('D')
  })
})

describe('Chord Identification - Diminished & Augmented (12 tests)', () => {
  test('identifies C diminished', () => {
    const result = identifyChord(['C', 'Eb', 'Gb'])
    expect(result.chord).toBe('C diminished')
    expect(result.root).toBe('C')
    expect(result.quality).toBe('diminished')
    expect(result.intervals).toEqual(['P1', 'm3', 'd5'])
  })

  test('identifies D diminished', () => {
    const result = identifyChord(['D', 'F', 'Ab'])
    expect(result.chord).toBe('D diminished')
    expect(result.root).toBe('D')
    expect(result.quality).toBe('diminished')
  })

  test('identifies E diminished', () => {
    const result = identifyChord(['E', 'G', 'Bb'])
    expect(result.chord).toBe('E diminished')
    expect(result.root).toBe('E')
  })

  test('identifies F# diminished', () => {
    const result = identifyChord(['F#', 'A', 'C'])
    expect(result.chord).toBe('F# diminished')
    expect(result.root).toBe('F#')
  })

  test('identifies C augmented', () => {
    const result = identifyChord(['C', 'E', 'G#'])
    expect(result.chord).toBe('C augmented')
    expect(result.root).toBe('C')
    expect(result.quality).toBe('augmented')
    expect(result.intervals).toEqual(['P1', 'M3', 'A5'])
  })

  test('identifies D augmented', () => {
    const result = identifyChord(['D', 'F#', 'A#'])
    expect(result.chord).toBe('D augmented')
    expect(result.root).toBe('D')
    expect(result.quality).toBe('augmented')
  })

  test('identifies E augmented', () => {
    const result = identifyChord(['E', 'G#', 'B#'])
    expect(result.chord).toBe('E augmented')
    expect(result.root).toBe('E')
  })

  test('identifies F augmented', () => {
    const result = identifyChord(['F', 'A', 'C#'])
    expect(result.chord).toBe('F augmented')
    expect(result.root).toBe('F')
  })

  test('identifies G augmented', () => {
    const result = identifyChord(['G', 'B', 'D#'])
    expect(result.chord).toBe('G augmented')
    expect(result.root).toBe('G')
  })

  test('identifies A augmented', () => {
    const result = identifyChord(['A', 'C#', 'E#'])
    expect(result.chord).toBe('A augmented')
    expect(result.root).toBe('A')
  })

  test('identifies Bb augmented', () => {
    const result = identifyChord(['Bb', 'D', 'F#'])
    expect(result.chord).toBe('Bb augmented')
    expect(result.root).toBe('Bb')
  })

  test('identifies B augmented', () => {
    const result = identifyChord(['B', 'D#', 'F##'])
    expect(result.chord).toBe('B augmented')
    expect(result.root).toBe('B')
  })
})

describe('Chord Identification - Dominant 7th Chords (12 tests)', () => {
  test('identifies C7', () => {
    const result = identifyChord(['C', 'E', 'G', 'Bb'])
    expect(result.chord).toBe('C7')
    expect(result.root).toBe('C')
    expect(result.quality).toMatch(/dominant|7/)
    expect(result.intervals).toEqual(['P1', 'M3', 'P5', 'm7'])
  })

  test('identifies G7', () => {
    const result = identifyChord(['G', 'B', 'D', 'F'])
    expect(result.chord).toBe('G7')
    expect(result.root).toBe('G')
  })

  test('identifies D7', () => {
    const result = identifyChord(['D', 'F#', 'A', 'C'])
    expect(result.chord).toBe('D7')
    expect(result.root).toBe('D')
  })

  test('identifies A7', () => {
    const result = identifyChord(['A', 'C#', 'E', 'G'])
    expect(result.chord).toBe('A7')
    expect(result.root).toBe('A')
  })

  test('identifies E7', () => {
    const result = identifyChord(['E', 'G#', 'B', 'D'])
    expect(result.chord).toBe('E7')
    expect(result.root).toBe('E')
  })

  test('identifies B7', () => {
    const result = identifyChord(['B', 'D#', 'F#', 'A'])
    expect(result.chord).toBe('B7')
    expect(result.root).toBe('B')
  })

  test('identifies F7', () => {
    const result = identifyChord(['F', 'A', 'C', 'Eb'])
    expect(result.chord).toBe('F7')
    expect(result.root).toBe('F')
  })

  test('identifies Bb7', () => {
    const result = identifyChord(['Bb', 'D', 'F', 'Ab'])
    expect(result.chord).toBe('Bb7')
    expect(result.root).toBe('Bb')
  })

  test('identifies Eb7', () => {
    const result = identifyChord(['Eb', 'G', 'Bb', 'Db'])
    expect(result.chord).toBe('Eb7')
    expect(result.root).toBe('Eb')
  })

  test('identifies Ab7', () => {
    const result = identifyChord(['Ab', 'C', 'Eb', 'Gb'])
    expect(result.chord).toBe('Ab7')
    expect(result.root).toBe('Ab')
  })

  test('identifies Db7', () => {
    const result = identifyChord(['Db', 'F', 'Ab', 'Cb'])
    expect(result.chord).toBe('Db7')
    expect(result.root).toBe('Db')
  })

  test('identifies F#7', () => {
    const result = identifyChord(['F#', 'A#', 'C#', 'E'])
    expect(result.chord).toBe('F#7')
    expect(result.root).toBe('F#')
  })
})

describe('Chord Identification - Major 7th Chords (12 tests)', () => {
  test('identifies Cmaj7', () => {
    const result = identifyChord(['C', 'E', 'G', 'B'])
    expect(result.chord).toMatch(/Cmaj7|CM7/)
    expect(result.root).toBe('C')
    expect(result.quality).toMatch(/major.*7|maj7/)
    expect(result.intervals).toEqual(['P1', 'M3', 'P5', 'M7'])
  })

  test('identifies Gmaj7', () => {
    const result = identifyChord(['G', 'B', 'D', 'F#'])
    expect(result.chord).toMatch(/Gmaj7|GM7/)
    expect(result.root).toBe('G')
  })

  test('identifies Dmaj7', () => {
    const result = identifyChord(['D', 'F#', 'A', 'C#'])
    expect(result.chord).toMatch(/Dmaj7|DM7/)
    expect(result.root).toBe('D')
  })

  test('identifies Amaj7', () => {
    const result = identifyChord(['A', 'C#', 'E', 'G#'])
    expect(result.chord).toMatch(/Amaj7|AM7/)
    expect(result.root).toBe('A')
  })

  test('identifies Emaj7', () => {
    const result = identifyChord(['E', 'G#', 'B', 'D#'])
    expect(result.chord).toMatch(/Emaj7|EM7/)
    expect(result.root).toBe('E')
  })

  test('identifies Bmaj7', () => {
    const result = identifyChord(['B', 'D#', 'F#', 'A#'])
    expect(result.chord).toMatch(/Bmaj7|BM7/)
    expect(result.root).toBe('B')
  })

  test('identifies Fmaj7', () => {
    const result = identifyChord(['F', 'A', 'C', 'E'])
    expect(result.chord).toMatch(/Fmaj7|FM7/)
    expect(result.root).toBe('F')
  })

  test('identifies Bbmaj7', () => {
    const result = identifyChord(['Bb', 'D', 'F', 'A'])
    expect(result.chord).toMatch(/Bbmaj7|BbM7/)
    expect(result.root).toBe('Bb')
  })

  test('identifies Ebmaj7', () => {
    const result = identifyChord(['Eb', 'G', 'Bb', 'D'])
    expect(result.chord).toMatch(/Ebmaj7|EbM7/)
    expect(result.root).toBe('Eb')
  })

  test('identifies Abmaj7', () => {
    const result = identifyChord(['Ab', 'C', 'Eb', 'G'])
    expect(result.chord).toMatch(/Abmaj7|AbM7/)
    expect(result.root).toBe('Ab')
  })

  test('identifies Dbmaj7', () => {
    const result = identifyChord(['Db', 'F', 'Ab', 'C'])
    expect(result.chord).toMatch(/Dbmaj7|DbM7/)
    expect(result.root).toBe('Db')
  })

  test('identifies F#maj7', () => {
    const result = identifyChord(['F#', 'A#', 'C#', 'E#'])
    expect(result.chord).toMatch(/F#maj7|F#M7/)
    expect(result.root).toBe('F#')
  })
})

describe('Chord Identification - Minor 7th Chords (12 tests)', () => {
  test('identifies Am7', () => {
    const result = identifyChord(['A', 'C', 'E', 'G'])
    expect(result.chord).toBe('Am7')
    expect(result.root).toBe('A')
    expect(result.quality).toMatch(/minor.*7|m7/)
    expect(result.intervals).toEqual(['P1', 'm3', 'P5', 'm7'])
  })

  test('identifies Em7', () => {
    const result = identifyChord(['E', 'G', 'B', 'D'])
    expect(result.chord).toBe('Em7')
    expect(result.root).toBe('E')
  })

  test('identifies Bm7', () => {
    const result = identifyChord(['B', 'D', 'F#', 'A'])
    expect(result.chord).toBe('Bm7')
    expect(result.root).toBe('B')
  })

  test('identifies F#m7', () => {
    const result = identifyChord(['F#', 'A', 'C#', 'E'])
    expect(result.chord).toBe('F#m7')
    expect(result.root).toBe('F#')
  })

  test('identifies C#m7', () => {
    const result = identifyChord(['C#', 'E', 'G#', 'B'])
    expect(result.chord).toBe('C#m7')
    expect(result.root).toBe('C#')
  })

  test('identifies G#m7', () => {
    const result = identifyChord(['G#', 'B', 'D#', 'F#'])
    expect(result.chord).toBe('G#m7')
    expect(result.root).toBe('G#')
  })

  test('identifies Dm7', () => {
    const result = identifyChord(['D', 'F', 'A', 'C'])
    expect(result.chord).toBe('Dm7')
    expect(result.root).toBe('D')
  })

  test('identifies Gm7', () => {
    const result = identifyChord(['G', 'Bb', 'D', 'F'])
    expect(result.chord).toBe('Gm7')
    expect(result.root).toBe('G')
  })

  test('identifies Cm7', () => {
    const result = identifyChord(['C', 'Eb', 'G', 'Bb'])
    expect(result.chord).toBe('Cm7')
    expect(result.root).toBe('C')
  })

  test('identifies Fm7', () => {
    const result = identifyChord(['F', 'Ab', 'C', 'Eb'])
    expect(result.chord).toBe('Fm7')
    expect(result.root).toBe('F')
  })

  test('identifies Bbm7', () => {
    const result = identifyChord(['Bb', 'Db', 'F', 'Ab'])
    expect(result.chord).toBe('Bbm7')
    expect(result.root).toBe('Bb')
  })

  test('identifies Ebm7', () => {
    const result = identifyChord(['Eb', 'Gb', 'Bb', 'Db'])
    expect(result.chord).toBe('Ebm7')
    expect(result.root).toBe('Eb')
  })
})

// Continuing in next message due to length...

describe('Chord Identification - Extended Chords (20 tests)', () => {
  // 9th chords
  test('identifies Cmaj9', () => {
    const result = identifyChord(['C', 'E', 'G', 'B', 'D'])
    expect(result.root).toBe('C')
    expect(result.chord).toMatch(/Cmaj9|CM9/)
  })

  test('identifies Dm9', () => {
    const result = identifyChord(['D', 'F', 'A', 'C', 'E'])
    expect(result.root).toBe('D')
    expect(result.chord).toMatch(/Dm9/)
  })

  test('identifies G9', () => {
    const result = identifyChord(['G', 'B', 'D', 'F', 'A'])
    expect(result.root).toBe('G')
    expect(result.chord).toMatch(/G9/)
  })

  test('identifies Am9', () => {
    const result = identifyChord(['A', 'C', 'E', 'G', 'B'])
    expect(result.root).toBe('A')
    expect(result.chord).toMatch(/Am9/)
  })

  // 11th chords
  test('identifies Cmaj11', () => {
    const result = identifyChord(['C', 'E', 'G', 'B', 'D', 'F'])
    expect(result.root).toBe('C')
    expect(result.chord).toMatch(/Cmaj11|CM11/)
  })

  test('identifies Dm11', () => {
    const result = identifyChord(['D', 'F', 'A', 'C', 'E', 'G'])
    expect(result.root).toBe('D')
    expect(result.chord).toMatch(/Dm11/)
  })

  test('identifies G11', () => {
    const result = identifyChord(['G', 'B', 'D', 'F', 'A', 'C'])
    expect(result.root).toBe('G')
    expect(result.chord).toMatch(/G11/)
  })

  test('identifies Am11', () => {
    const result = identifyChord(['A', 'C', 'E', 'G', 'B', 'D'])
    expect(result.root).toBe('A')
    expect(result.chord).toMatch(/Am11/)
  })

  // 13th chords
  test('identifies Cmaj13', () => {
    const result = identifyChord(['C', 'E', 'G', 'B', 'D', 'F', 'A'])
    expect(result.root).toBe('C')
    expect(result.chord).toMatch(/Cmaj13|CM13/)
  })

  test('identifies Dm13', () => {
    const result = identifyChord(['D', 'F', 'A', 'C', 'E', 'G', 'B'])
    expect(result.root).toBe('D')
    expect(result.chord).toMatch(/Dm13/)
  })

  test('identifies G13', () => {
    const result = identifyChord(['G', 'B', 'D', 'F', 'A', 'C', 'E'])
    expect(result.root).toBe('G')
    expect(result.chord).toMatch(/G13/)
  })

  test('identifies Am13', () => {
    const result = identifyChord(['A', 'C', 'E', 'G', 'B', 'D', 'F#'])
    expect(result.root).toBe('A')
    expect(result.chord).toMatch(/Am13/)
  })

  // Half-diminished (m7b5)
  test('identifies Bø7 (half-diminished)', () => {
    const result = identifyChord(['B', 'D', 'F', 'A'])
    expect(result.root).toBe('B')
    expect(result.quality).toMatch(/half.*dim|ø|m7b5/)
  })

  test('identifies Dø7', () => {
    const result = identifyChord(['D', 'F', 'Ab', 'C'])
    expect(result.root).toBe('D')
    expect(result.quality).toMatch(/half.*dim|ø|m7b5/)
  })

  // Fully diminished 7th
  test('identifies Cdim7', () => {
    const result = identifyChord(['C', 'Eb', 'Gb', 'Bbb'])
    expect(result.root).toBe('C')
    expect(result.quality).toMatch(/dim.*7|fully.*dim/)
  })

  test('identifies Ddim7', () => {
    const result = identifyChord(['D', 'F', 'Ab', 'Cb'])
    expect(result.root).toBe('D')
    expect(result.quality).toMatch(/dim.*7|fully.*dim/)
  })

  // Sus chords
  test('identifies Csus2', () => {
    const result = identifyChord(['C', 'D', 'G'])
    expect(result.root).toBe('C')
    expect(result.chord).toMatch(/Csus2/)
  })

  test('identifies Dsus4', () => {
    const result = identifyChord(['D', 'G', 'A'])
    expect(result.root).toBe('D')
    expect(result.chord).toMatch(/Dsus4/)
  })

  test('identifies G7sus4', () => {
    const result = identifyChord(['G', 'C', 'D', 'F'])
    expect(result.root).toBe('G')
    expect(result.chord).toMatch(/G7sus4/)
  })

  // Add chords
  test('identifies Cadd9', () => {
    const result = identifyChord(['C', 'E', 'G', 'D'])
    expect(result.root).toBe('C')
    expect(result.chord).toMatch(/Cadd9|CMadd9/) // Tonal.js uses CMadd9 to distinguish from minor
  })
})

describe('Chord Identification - Enharmonic Equivalents (10 tests)', () => {
  test('C# major = Db major enharmonically', () => {
    const result1 = identifyChord(['C#', 'E#', 'G#'])
    const result2 = identifyChord(['Db', 'F', 'Ab'])
    expect(result1.root).toBe('C#')
    expect(result2.root).toBe('Db')
    // Both are major chords, just different spellings
    expect(result1.quality).toBe('major')
    expect(result2.quality).toBe('major')
  })

  test('F# major = Gb major enharmonically', () => {
    const result1 = identifyChord(['F#', 'A#', 'C#'])
    const result2 = identifyChord(['Gb', 'Bb', 'Db'])
    expect(result1.root).toBe('F#')
    expect(result2.root).toBe('Gb')
  })

  test('D# minor = Eb minor enharmonically', () => {
    const result1 = identifyChord(['D#', 'F#', 'A#'])
    const result2 = identifyChord(['Eb', 'Gb', 'Bb'])
    expect(result1.root).toBe('D#')
    expect(result2.root).toBe('Eb')
    expect(result1.quality).toBe('minor')
    expect(result2.quality).toBe('minor')
  })

  test('G# minor = Ab minor enharmonically', () => {
    const result1 = identifyChord(['G#', 'B', 'D#'])
    const result2 = identifyChord(['Ab', 'Cb', 'Eb'])
    expect(result1.root).toBe('G#')
    expect(result2.root).toBe('Ab')
  })

  test('B# = C enharmonically in chords', () => {
    const result1 = identifyChord(['B#', 'D##', 'F##'])
    const result2 = identifyChord(['C', 'E', 'G'])
    // Should identify as C major with different spellings
    expect(result1.quality).toBe('major')
    expect(result2.quality).toBe('major')
  })

  test('Cb = B enharmonically in chords', () => {
    const result1 = identifyChord(['Cb', 'Ebb', 'Gb'])
    const result2 = identifyChord(['B', 'D', 'F#'])
    expect(result1.quality).toBe('minor')
    expect(result2.quality).toBe('minor')
  })

  test('Mixed enharmonics: C# + Db in same chord', () => {
    const result = identifyChord(['C', 'E', 'G', 'C#'])
    // Should handle mixed enharmonics gracefully
    expect(result.root).toBe('C')
  })

  test('E# = F in dominant 7th', () => {
    const result = identifyChord(['E#', 'G##', 'B#', 'D#'])
    expect(result.quality).toMatch(/7|dominant/)
  })

  test('Fb = E in minor triad', () => {
    const result = identifyChord(['Fb', 'Abb', 'Cb'])
    expect(result.quality).toBe('minor')
  })

  test('Double sharps: C## = D', () => {
    const result = identifyChord(['C##', 'E#', 'G##'])
    // C## + E# + G## = D + F + A = D minor (m3 + P5 intervals)
    expect(result.quality).toBe('minor')
  })
})

describe('Chord Identification - Incomplete Chords (10 tests)', () => {
  test('identifies power chord (root + 5th only)', () => {
    const result = identifyChord(['C', 'G'])
    expect(result.root).toBe('C')
    expect(result.confidence).toBeLessThan(1.0)
    expect(result.alternatives.length).toBeGreaterThan(0)
  })

  test('identifies dyad (root + 3rd only)', () => {
    const result = identifyChord(['C', 'E'])
    expect(result.root).toBe('C')
    expect(result.confidence).toBeLessThan(1.0)
  })

  test('identifies incomplete dominant 7th (missing 5th)', () => {
    const result = identifyChord(['G', 'B', 'F'])
    expect(result.root).toBe('G')
    expect(result.quality).toMatch(/7|dominant/)
    expect(result.confidence).toBeGreaterThan(0.7)
    expect(result.confidence).toBeLessThan(1.0)
  })

  test('identifies incomplete minor 7th (missing 5th)', () => {
    const result = identifyChord(['D', 'F', 'C'])
    expect(result.root).toBe('D')
    expect(result.quality).toMatch(/m7|minor.*7/)
    expect(result.confidence).toBeLessThan(1.0)
  })

  test('identifies shell voicing (root + 3rd + 7th, no 5th)', () => {
    const result = identifyChord(['C', 'E', 'Bb'])
    expect(result.root).toBe('C')
    expect(result.confidence).toBeGreaterThan(0.8)
  })

  test('identifies two notes only - ambiguous', () => {
    const result = identifyChord(['D', 'A'])
    expect(result.alternatives.length).toBeGreaterThanOrEqual(2)
    expect(result.confidence).toBeLessThan(0.8)
  })

  test('maj7 without 5th', () => {
    const result = identifyChord(['C', 'E', 'B'])
    expect(result.root).toBe('C')
    expect(result.quality).toMatch(/maj7/)
    expect(result.confidence).toBeLessThan(1.0)
  })

  test('identifies triad with doubled notes', () => {
    const result = identifyChord(['C', 'E', 'G', 'C'])
    expect(result.root).toBe('C')
    expect(result.quality).toBe('major')
    expect(result.confidence).toBe(1.0) // Doubled notes don't reduce confidence
  })

  test('identifies Em7b5 chord', () => {
    const result = identifyChord(['E', 'G', 'Bb', 'D'])
    // Correctly identified as Em7b5 (half-diminished), not C9 without root
    expect(result.chord).toMatch(/Em7b5|E\u00f8/)
    expect(result.root).toBe('E')
    expect(result.confidence).toBeGreaterThan(0.9) // Complete chord with root present
  })

  test('rejects ambiguous cluster', () => {
    // C-D-E-F is intentionally ambiguous (could be Cmaj9sus4, Dm11 without root, etc.)
    expect(() => identifyChord(['C', 'D', 'E', 'F'])).toThrow('CHORD_NOT_FOUND')
  })
})

describe('Chord Identification - Inversions (8 tests)', () => {
  test('identifies C major first inversion (E-G-C)', () => {
    const result = identifyChord(['E', 'G', 'C'])
    expect(result.root).toBe('C')
    expect(result.quality).toBe('major')
    expect(result.notes).toContain('C')
    expect(result.notes).toContain('E')
    expect(result.notes).toContain('G')
  })

  test('identifies C major second inversion (G-C-E)', () => {
    const result = identifyChord(['G', 'C', 'E'])
    expect(result.root).toBe('C')
    expect(result.quality).toBe('major')
  })

  test('identifies Am first inversion (C-E-A)', () => {
    const result = identifyChord(['C', 'E', 'A'])
    expect(result.root).toBe('A')
    expect(result.quality).toBe('minor')
  })

  test('identifies Am second inversion (E-A-C)', () => {
    const result = identifyChord(['E', 'A', 'C'])
    expect(result.root).toBe('A')
    expect(result.quality).toBe('minor')
  })

  test('identifies G7 first inversion (B-D-F-G)', () => {
    const result = identifyChord(['B', 'D', 'F', 'G'])
    expect(result.root).toBe('G')
    expect(result.quality).toMatch(/7|dominant/)
  })

  test('identifies G7 second inversion (D-F-G-B)', () => {
    const result = identifyChord(['D', 'F', 'G', 'B'])
    expect(result.root).toBe('G')
    expect(result.quality).toMatch(/7|dominant/)
  })

  test('identifies G7 third inversion (F-G-B-D)', () => {
    const result = identifyChord(['F', 'G', 'B', 'D'])
    expect(result.root).toBe('G')
    expect(result.quality).toMatch(/7|dominant/)
  })

  test('identifies Cmaj7 first inversion (E-G-B-C)', () => {
    const result = identifyChord(['E', 'G', 'B', 'C'])
    expect(result.root).toBe('C')
    expect(result.quality).toMatch(/maj7/)
  })
})

describe('Chord Identification - Ambiguous Chords (5 tests)', () => {
  test('Am or C6 ambiguity (A-C-E)', () => {
    const result = identifyChord(['A', 'C', 'E'])
    expect(result.alternatives).toBeDefined()
    expect(result.alternatives.length).toBeGreaterThan(0)
    // Could be Am or C6 missing a note
  })

  test('Em or Cmaj7 ambiguity (E-G-B)', () => {
    const result = identifyChord(['E', 'G', 'B'])
    expect(result.alternatives).toBeDefined()
    // Primary should be Em, but Cmaj7 is alternative
  })

  test('augmented chord symmetry (C-E-G# = E-G#-C = G#-C-E)', () => {
    const result1 = identifyChord(['C', 'E', 'G#'])
    const result2 = identifyChord(['E', 'G#', 'C'])
    const result3 = identifyChord(['G#', 'C', 'E'])
    // All should be augmented, but root may differ
    expect(result1.quality).toBe('augmented')
    expect(result2.quality).toBe('augmented')
    expect(result3.quality).toBe('augmented')
  })

  test('diminished chord symmetry', () => {
    const result1 = identifyChord(['C', 'Eb', 'Gb'])
    const result2 = identifyChord(['Eb', 'Gb', 'C'])
    expect(result1.quality).toBe('diminished')
    expect(result2.quality).toBe('diminished')
  })

  test('provides alternatives for partial match', () => {
    const result = identifyChord(['C', 'E', 'G', 'A'])
    expect(result.alternatives).toBeDefined()
    expect(result.alternatives.length).toBeGreaterThanOrEqual(2)
    // Could be Cmaj with added 6th, Am7, etc.
  })
})

describe('Chord Identification - Edge Cases (5 tests)', () => {
  test('throws error for empty array', () => {
    expect(() => identifyChord([])).toThrow('INSUFFICIENT_NOTES')
  })

  test('throws error for single note', () => {
    expect(() => identifyChord(['C'])).toThrow('INSUFFICIENT_NOTES')
  })

  test('throws error for invalid note name', () => {
    expect(() => identifyChord(['H', 'J', 'K'])).toThrow('INVALID_NOTES')
  })

  test('handles notes with octave numbers', () => {
    const result = identifyChord(['C4', 'E4', 'G4'])
    expect(result.root).toBe('C')
    expect(result.quality).toBe('major')
  })

  test('handles mixed octaves correctly', () => {
    const result = identifyChord(['C3', 'E4', 'G5'])
    expect(result.root).toBe('C')
    expect(result.quality).toBe('major')
    expect(result.confidence).toBe(1.0)
  })
})

describe('Chord Identification - Confidence Scoring (5 tests)', () => {
  test('complete triad has confidence 1.0', () => {
    const result = identifyChord(['C', 'E', 'G'])
    expect(result.confidence).toBe(1.0)
  })

  test('incomplete chord has confidence < 1.0', () => {
    const result = identifyChord(['C', 'G'])
    expect(result.confidence).toBeLessThan(1.0)
    expect(result.confidence).toBeGreaterThan(0.0)
  })

  test('complete 7th chord has high confidence', () => {
    const result = identifyChord(['C', 'E', 'G', 'Bb'])
    expect(result.confidence).toBeGreaterThanOrEqual(0.95)
  })

  test('ambiguous notes reduce confidence', () => {
    const result = identifyChord(['C', 'D', 'G'])
    expect(result.confidence).toBeLessThan(0.9)
  })

  test('extra non-chord tones reduce confidence', () => {
    const result = identifyChord(['C', 'E', 'F', 'G'])
    expect(result.confidence).toBeLessThan(0.95)
  })
})
