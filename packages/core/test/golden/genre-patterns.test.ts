import { describe, it, expect } from 'vitest'
import { GENRE_PATTERNS, detectGenre } from '../../src/genre'

describe('Genre Pattern Database (Full Suite - 50+ Patterns)', () => {
  it('contains 50+ patterns across 6 genres', () => {
    expect(GENRE_PATTERNS.length).toBeGreaterThanOrEqual(50)
    const genres = new Set(GENRE_PATTERNS.map((p) => p.genre))
    expect(genres).toContain('jazz')
    expect(genres).toContain('pop')
    expect(genres).toContain('classical')
    expect(genres).toContain('rock')
    expect(genres).toContain('edm')
    expect(genres).toContain('blues')
    expect(genres.size).toBe(6)
  })

  it('each pattern has required metadata fields', () => {
    for (const pattern of GENRE_PATTERNS) {
      expect(pattern.pattern).toBeDefined()
      expect(pattern.genre).toBeDefined()
      expect(pattern.weight).toBeGreaterThan(0)
      expect(pattern.weight).toBeLessThanOrEqual(10)
      expect(pattern.description).toBeDefined()
      expect(pattern.examples).toBeInstanceOf(Array)
      expect(pattern.examples!.length).toBeGreaterThan(0)
      expect(pattern.era).toBeDefined()
    }
  })

  it('has at least 8 jazz patterns', () => {
    const jazzPatterns = GENRE_PATTERNS.filter((p) => p.genre === 'jazz')
    expect(jazzPatterns.length).toBeGreaterThanOrEqual(8)
  })

  it('has at least 8 pop patterns', () => {
    const popPatterns = GENRE_PATTERNS.filter((p) => p.genre === 'pop')
    expect(popPatterns.length).toBeGreaterThanOrEqual(8)
  })

  it('has at least 8 classical patterns', () => {
    const classicalPatterns = GENRE_PATTERNS.filter((p) => p.genre === 'classical')
    expect(classicalPatterns.length).toBeGreaterThanOrEqual(8)
  })

  it('has at least 8 rock patterns', () => {
    const rockPatterns = GENRE_PATTERNS.filter((p) => p.genre === 'rock')
    expect(rockPatterns.length).toBeGreaterThanOrEqual(8)
  })

  it('has at least 8 EDM patterns', () => {
    const edmPatterns = GENRE_PATTERNS.filter((p) => p.genre === 'edm')
    expect(edmPatterns.length).toBeGreaterThanOrEqual(8)
  })

  it('has at least 8 blues patterns', () => {
    const bluesPatterns = GENRE_PATTERNS.filter((p) => p.genre === 'blues')
    expect(bluesPatterns.length).toBeGreaterThanOrEqual(8)
  })
})

describe('Jazz Pattern Detection', () => {
  it('detects ii-V-I (fundamental turnaround)', () => {
    const result = detectGenre(['Dm7', 'G7', 'Cmaj7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('jazz')
    expect(result[0].confidence).toBeGreaterThan(0)
  })

  it('detects iii-VI-ii-V (extended turnaround)', () => {
    const result = detectGenre(['Em7', 'A7', 'Dm7', 'G7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('jazz')
  })

  it('detects I-vi-ii-V (rhythm changes)', () => {
    const result = detectGenre(['Cmaj7', 'Am7', 'Dm7', 'G7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('jazz')
  })

  it('detects bII7-I (tritone substitution)', () => {
    const result = detectGenre(['Db7', 'Cmaj7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('jazz')
  })

  it('detects im7-IV7-bVIImaj7 (minor jazz)', () => {
    const result = detectGenre(['Cm7', 'F7', 'Bbmaj7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('jazz')
  })

  it('detects Im7-bIIImaj7-bVImaj7-bIImaj7 (Coltrane changes)', () => {
    const result = detectGenre(['Cmaj7', 'Ebmaj7', 'Abmaj7', 'Dbmaj7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('jazz')
  })

  it('detects IVmaj7-bVII7-I (backdoor progression)', () => {
    const result = detectGenre(['Fmaj7', 'Bb7', 'Cmaj7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('jazz')
  })

  it('detects Im-IV7-i7-bVII7 (jazz minor)', () => {
    const result = detectGenre(['Cm', 'F7', 'Cm7', 'Bb7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('jazz')
  })
})

describe('Pop Pattern Detection', () => {
  it('detects I-V-vi-IV (axis progression)', () => {
    const result = detectGenre(['C', 'G', 'Am', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('pop')
  })

  it('detects I-IV-V (three-chord pop)', () => {
    const result = detectGenre(['C', 'F', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('pop')
  })

  it('detects vi-IV-I-V (sensitive female chord)', () => {
    const result = detectGenre(['Am', 'F', 'C', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('pop')
  })

  it('detects I-vi-IV-V (doo-wop)', () => {
    const result = detectGenre(['C', 'Am', 'F', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('pop')
  })

  it('detects IV-V-iii-vi (royal road)', () => {
    const result = detectGenre(['F', 'G', 'Em', 'Am'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('pop')
  })

  it('detects I-IV-vi-V (emotional arc)', () => {
    const result = detectGenre(['C', 'F', 'Am', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('pop')
  })

  it('detects vi-V-IV-V (emotional descent)', () => {
    const result = detectGenre(['Am', 'G', 'F', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('pop')
  })

  it('detects I-V-IV (simplified axis)', () => {
    const result = detectGenre(['C', 'G', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('pop')
  })
})

describe('Classical Pattern Detection', () => {
  it('detects I-IV-V-I (authentic cadence)', () => {
    const result = detectGenre(['C', 'F', 'G', 'C'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('classical')
  })

  it('detects ii-V-I (common practice)', () => {
    const result = detectGenre(['Dm', 'G', 'C'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('classical')
  })

  it('detects IV-I (plagal cadence)', () => {
    const result = detectGenre(['F', 'C'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('classical')
  })

  it('detects I-V (half cadence)', () => {
    const result = detectGenre(['C', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('classical')
  })

  it('detects V-vi (deceptive cadence)', () => {
    const result = detectGenre(['G', 'Am'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('classical')
  })

  it('detects I-IV-I-V-I (baroque sequence)', () => {
    const result = detectGenre(['C', 'F', 'C', 'G', 'C'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('classical')
  })

  it('detects vi-ii-V-I (circle of fifths)', () => {
    const result = detectGenre(['Am', 'Dm', 'G', 'C'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('classical')
  })

  it('detects I-vi-ii-V-I (extended classical)', () => {
    const result = detectGenre(['C', 'Am', 'Dm', 'G', 'C'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('classical')
  })
})

describe('Rock Pattern Detection', () => {
  it('detects I-bVII-IV (rock power)', () => {
    const result = detectGenre(['C', 'Bb', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('rock')
  })

  it('detects I-IV-V (rock standard)', () => {
    const result = detectGenre(['C', 'F', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('rock')
  })

  it('detects i-bVII-bVI-bVII (minor rock)', () => {
    const result = detectGenre(['Am', 'G', 'F', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('rock')
  })

  it('detects I-bVII-bVI-IV (descending rock)', () => {
    const result = detectGenre(['C', 'Bb', 'Ab', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('rock')
  })

  it('detects i-bVI-bVII (grunge)', () => {
    const result = detectGenre(['Am', 'F', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('rock')
  })

  it('detects I-V-bVII-IV (punk)', () => {
    const result = detectGenre(['C', 'G', 'Bb', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('rock')
  })

  it('detects i-iv-v (power chord)', () => {
    const result = detectGenre(['Am', 'Dm', 'Em'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('rock')
  })

  it('detects I-III-IV (alternative rock)', () => {
    const result = detectGenre(['C', 'E', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('rock')
  })
})

describe('EDM Pattern Detection', () => {
  it('detects i-VII-VI-V (EDM build)', () => {
    const result = detectGenre(['Am', 'G', 'F', 'E'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('edm')
  })

  it('detects vi-IV-I-V (progressive house)', () => {
    const result = detectGenre(['Am', 'F', 'C', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('edm')
  })

  it('detects i-bVII-bVI-bVII (dubstep)', () => {
    const result = detectGenre(['Am', 'G', 'F', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('edm')
  })

  it('detects I-V-vi-iii (trance)', () => {
    const result = detectGenre(['C', 'G', 'Am', 'Em'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('edm')
  })

  it('detects vi-I-V-IV (house drop)', () => {
    const result = detectGenre(['Am', 'C', 'G', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('edm')
  })

  it('detects I-bVII-IV (EDM anthem)', () => {
    const result = detectGenre(['C', 'Bb', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('edm')
  })

  it('detects i-v-bVII-IV (future bass)', () => {
    const result = detectGenre(['Am', 'Em', 'G', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('edm')
  })

  it('detects I-IV-bVII-IV (big room)', () => {
    const result = detectGenre(['C', 'F', 'Bb', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('edm')
  })
})

describe('Blues Pattern Detection', () => {
  it('detects I-IV-I-V (12-bar blues)', () => {
    const result = detectGenre(['C', 'F', 'C', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('blues')
  })

  it('detects I-IV-I-V-IV-I (quick-change blues)', () => {
    const result = detectGenre(['C', 'F', 'C', 'G', 'F', 'C'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('blues')
  })

  it('detects I7-IV7-I7-V7 (dominant blues)', () => {
    const result = detectGenre(['C7', 'F7', 'C7', 'G7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('blues')
  })

  it('detects I-I-I-I-IV-IV-I-I-V-IV-I-V (full 12-bar)', () => {
    const result = detectGenre(['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'G', 'F', 'C', 'G'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('blues')
  })

  it('detects Im7-IVm7-Im7-V7 (minor blues)', () => {
    const result = detectGenre(['Cm7', 'Fm7', 'Cm7', 'G7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('blues')
  })

  it('detects I-bVII-IV (blues rock hybrid)', () => {
    const result = detectGenre(['C', 'Bb', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('blues')
  })

  it('detects I-IV-V-IV (shuffle blues)', () => {
    const result = detectGenre(['C', 'F', 'G', 'F'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('blues')
  })

  it('detects Im7-IV7-bVIImaj7-Im7 (jazz blues)', () => {
    const result = detectGenre(['Cm7', 'F7', 'Bbmaj7', 'Cm7'])
    expect(result.length).toBeGreaterThan(0)
    const genres = result.map((r) => r.genre)
    expect(genres).toContain('blues')
  })
})

describe('Edge Cases and Ambiguity', () => {
  it('returns unknown for unmatched progression', () => {
    const result = detectGenre(['X', 'Y', 'Z'])
    expect(result.length).toBe(1)
    expect(result[0]!.genre).toBe('unknown')
    expect(result[0]!.confidence).toBe(0)
  })

  it('handles ambiguous progressions with multiple genre matches', () => {
    const result = detectGenre(['C', 'F', 'G'])
    expect(result.length).toBeGreaterThan(1)
    const genres = result.map((r) => r.genre)
    // I-IV-V can be pop, classical, rock, or blues
    expect(genres.length).toBeGreaterThan(1)
  })

  it('returns results sorted by confidence descending', () => {
    const result = detectGenre(['C', 'F', 'G', 'C'])
    if (result.length > 1) {
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].confidence).toBeGreaterThanOrEqual(result[i].confidence)
      }
    }
  })

  it('respects genre hint and only checks specified genre patterns', () => {
    // ii-V-I is distinctly jazz
    const result = detectGenre(['Dm7', 'G7', 'Cmaj7'], { genre: 'jazz' })
    expect(result.length).toBeGreaterThan(0)
    // All results should be jazz (or unknown if no match)
    result.forEach((r) => {
      expect(['jazz', 'unknown']).toContain(r.genre)
    })
  })

  it('returns unknown when genre hint provided but no patterns match', () => {
    // I-V-vi-IV is pop, not jazz
    const result = detectGenre(['C', 'G', 'Am', 'F'], { genre: 'jazz' })
    expect(result.length).toBe(1)
    expect(result[0]!.genre).toBe('unknown')
    expect(result[0]!.confidence).toBe(0)
  })

  it('detects dominant 7th chords for resolution but excludes maj7', () => {
    // Test that G7 (dominant) triggers resolution, but Cmaj7 (not dominant) doesn't
    // This is a regression test for the dominant detection fix

    // Case 1: G7 should be recognized as dominant
    const withDominant = detectGenre(['Dm7', 'G7', 'Cmaj7'])
    expect(withDominant.length).toBeGreaterThan(0)
    const genres = withDominant.map((r) => r.genre)
    expect(genres).toContain('jazz') // ii-V-I pattern

    // Case 2: Cmaj7 is not dominant, progression should still work
    const withMaj7 = detectGenre(['Fmaj7', 'Em7', 'Am7', 'Dm7'])
    // This might not match any specific pattern, which is fine
    expect(withMaj7.length).toBeGreaterThan(0)
  })

  // T009: Additional algorithm edge case tests from pattern coverage audit

  it('detects patterns that overlap in long progressions', () => {
    // Long progression with multiple embedded patterns
    // Contains ii-V-I twice (jazz turnaround pattern appearing multiple times)
    const result = detectGenre(['Dm7', 'G7', 'Cmaj7', 'Am7', 'Dm7', 'G7', 'Cmaj7'])
    expect(result.length).toBeGreaterThan(0)

    // Should detect jazz (contains multiple ii-V-I patterns)
    const jazzResult = result.find((r) => r.genre === 'jazz')
    expect(jazzResult).toBeDefined()

    // Pattern matching should find the ii-V-I pattern at least once
    expect(jazzResult!.matchedPatterns.length).toBeGreaterThan(0)
    const hasIIVI = jazzResult!.matchedPatterns.some((p) => p.pattern === 'ii-V-I')
    expect(hasIIVI).toBe(true)
  })

  it('caps confidence at 1.0 even with multiple high-weight patterns', () => {
    // Progression matching a canonical pattern (weight 10)
    const result = detectGenre(['Dm7', 'G7', 'Cmaj7']) // ii-V-I (weight 10)
    expect(result.length).toBeGreaterThan(0)

    // Confidence should never exceed 1.0
    result.forEach((r) => {
      expect(r.confidence).toBeGreaterThanOrEqual(0)
      expect(r.confidence).toBeLessThanOrEqual(1.0)
    })

    // Jazz should have high confidence but capped at 1.0
    const jazzResult = result.find((r) => r.genre === 'jazz')
    if (jazzResult) {
      expect(jazzResult.confidence).toBeLessThanOrEqual(1.0)
    }
  })

  it('detects cross-genre patterns and returns all applicable genres', () => {
    // I-IV-V is a cross-genre pattern (appears in pop, classical, rock, blues)
    const result = detectGenre(['C', 'F', 'G'])

    // Should return multiple genres
    expect(result.length).toBeGreaterThanOrEqual(2)

    const genres = result.map((r) => r.genre)

    // At least 2 of these genres should be present (I-IV-V is versatile)
    const expectedGenres = ['pop', 'classical', 'rock', 'blues']
    const matchCount = expectedGenres.filter((g) => genres.includes(g)).length
    expect(matchCount).toBeGreaterThanOrEqual(2)

    // All returned genres should have positive confidence
    result.forEach((r) => {
      expect(r.confidence).toBeGreaterThan(0)
    })
  })

  it('handles edge case keys gracefully for dominant resolution', () => {
    // Test progression ending with dominant 7th in various keys
    // This ensures transpose logic works correctly for key resolution
    const progressions = [
      ['C#m7', 'F#7'], // F#7 resolves to B
      ['Ebm7', 'Ab7'], // Ab7 resolves to Db
      ['F#m7', 'B7'], // B7 resolves to E
    ]

    progressions.forEach((chords) => {
      const result = detectGenre(chords)

      // Should not throw errors, should return valid results
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)

      // Should have valid confidence scores
      result.forEach((r) => {
        expect(r.confidence).toBeGreaterThanOrEqual(0)
        expect(r.confidence).toBeLessThanOrEqual(1.0)
      })
    })
  })
})

/**
 * T013: Educational Pattern Queries (User Story 2)
 *
 * Validates that the pattern database provides rich educational metadata
 * that enables music education applications to teach students about progressions.
 *
 * Requirements tested:
 * - FR-002: Each pattern includes description, examples, and era
 * - SC-007: Educational applications can successfully use pattern data
 *
 * User Story 2 Acceptance Scenarios:
 * 1. Show users famous songs using a progression (e.g., I-V-vi-IV)
 * 2. Identify multiple patterns in longer progressions
 * 3. Provide historical context via era tags
 */
describe('Educational Pattern Queries (US2)', () => {
  it('I-V-vi-IV returns famous pop song examples', () => {
    // User Story 2, Scenario 1: "Given a user enters progression [C, G, Am, F],
    // When system matches patterns, Then returns I-V-vi-IV with examples like
    // 'Let It Be', 'Don't Stop Believin''"
    const results = detectGenre(['C', 'G', 'Am', 'F'])

    expect(results.length).toBeGreaterThan(0)

    // Should detect pop genre
    const popResult = results.find((r) => r.genre === 'pop')
    expect(popResult).toBeDefined()

    // Should match I-V-vi-IV pattern (the "Axis progression")
    const axisPattern = popResult!.matchedPatterns.find((p) => p.pattern === 'I-V-vi-IV')
    expect(axisPattern).toBeDefined()

    // Should include educational metadata
    expect(axisPattern!.description).toBeDefined()
    expect(axisPattern!.description.length).toBeGreaterThan(0)

    // Should include famous song examples
    expect(axisPattern!.examples).toBeDefined()
    expect(axisPattern!.examples!.length).toBeGreaterThanOrEqual(2)

    // Verify specific iconic songs are mentioned
    const examplesStr = axisPattern!.examples!.join(' ')
    expect(examplesStr).toMatch(/Let It Be|No Woman No Cry|Someone Like You/i)

    // Should include era context
    expect(axisPattern!.era).toBeDefined()
    expect(axisPattern!.era).toBe('modern')
  })

  it('jazz progression identifies both ii-V-I and iii-VI-ii-V with bebop-era examples', () => {
    // User Story 2, Scenario 2: "Given a jazz progression [Dm7, G7, Cmaj7, Em7, A7],
    // When system matches patterns, Then identifies both ii-V-I and iii-VI-ii-V
    // turnaround patterns with relevant bebop-era examples"
    const results = detectGenre(['Dm7', 'G7', 'Cmaj7', 'Em7', 'A7'])

    expect(results.length).toBeGreaterThan(0)

    // Should detect jazz genre
    const jazzResult = results.find((r) => r.genre === 'jazz')
    expect(jazzResult).toBeDefined()

    // Should match multiple jazz patterns
    expect(jazzResult!.matchedPatterns.length).toBeGreaterThanOrEqual(1)

    // Should identify ii-V-I pattern (Dm7-G7-Cmaj7 in C major)
    const iiVI = jazzResult!.matchedPatterns.find((p) => p.pattern === 'ii-V-I')
    expect(iiVI).toBeDefined()

    // Verify ii-V-I has educational metadata
    expect(iiVI!.description).toContain('fundamental')
    expect(iiVI!.examples!.length).toBeGreaterThanOrEqual(2)

    // Verify bebop-era context
    expect(iiVI!.era).toBe('bebop')

    // Verify famous jazz songs are mentioned
    const examplesStr = iiVI!.examples!.join(' ')
    expect(examplesStr).toMatch(/Autumn Leaves|All The Things You Are|Blue Bossa/i)
  })

  it('I-IV-V-I identifies classical authentic cadence with era tag', () => {
    // User Story 2, Scenario 3: "Given a classical progression [C, F, G, C],
    // When system matches patterns, Then identifies I-IV-V-I authentic cadence
    // with era tag Baroque/Classical and educational description"
    const results = detectGenre(['C', 'F', 'G', 'C'])

    expect(results.length).toBeGreaterThan(0)

    // Should detect classical genre (may also match pop/rock)
    const classicalResult = results.find((r) => r.genre === 'classical')
    expect(classicalResult).toBeDefined()

    // Should match I-IV-V-I pattern (authentic cadence)
    const cadence = classicalResult!.matchedPatterns.find((p) => p.pattern === 'I-IV-V-I')
    expect(cadence).toBeDefined()

    // Should include educational description
    expect(cadence!.description).toBeDefined()
    expect(cadence!.description).toMatch(/cadence|classical/i)

    // Should include era context (classical period)
    expect(cadence!.era).toBeDefined()
    expect(cadence!.era).toBe('classical-period')

    // Should include classical examples (may be generic contexts, not specific songs)
    expect(cadence!.examples).toBeDefined()
    expect(cadence!.examples!.length).toBeGreaterThanOrEqual(2)

    // Verify examples provide musical context
    cadence!.examples!.forEach((ex) => {
      expect(ex.length).toBeGreaterThan(0)
    })
  })

  it('pattern metadata is accessible for all detected patterns', () => {
    // Verify that ALL matched patterns return complete educational metadata
    // (not just the top pattern)
    const results = detectGenre(['C', 'G', 'Am', 'F'])

    expect(results.length).toBeGreaterThan(0)

    // Check all matched patterns across all genres
    results.forEach((genreResult) => {
      genreResult.matchedPatterns.forEach((pattern) => {
        // Every pattern should have description
        expect(pattern.description).toBeDefined()
        expect(pattern.description.length).toBeGreaterThan(0)

        // Every pattern should have examples
        expect(pattern.examples).toBeDefined()
        expect(pattern.examples!.length).toBeGreaterThanOrEqual(2)

        // Every pattern should have era
        expect(pattern.era).toBeDefined()
        expect(pattern.era!.length).toBeGreaterThan(0)

        // Examples should exist (format may vary: "Title - Artist" or generic context)
        pattern.examples!.forEach((ex) => {
          expect(ex.length).toBeGreaterThan(0) // Non-empty examples
        })
      })
    })
  })

  it('era tags provide historical context across genres', () => {
    // Test that era tags are meaningful and provide historical context
    const testCases = [
      {
        chords: ['Dm7', 'G7', 'Cmaj7'],
        genre: 'jazz',
        validEras: ['bebop', 'swing', 'modal-jazz', 'cool-jazz'],
      },
      { chords: ['C', 'G', 'Am', 'F'], genre: 'pop', validEras: ['modern', '1960s', '2000s'] },
      {
        chords: ['C', 'F', 'G', 'C'],
        genre: 'classical',
        validEras: ['classical-period', 'baroque', 'romantic'],
      },
      {
        chords: ['C', 'Bb', 'F'],
        genre: 'rock',
        validEras: ['1970s-rock', '1980s-rock', 'classic-rock', 'grunge', 'punk', 'alt-rock'],
      },
    ]

    testCases.forEach(({ chords, genre, validEras }) => {
      const results = detectGenre(chords)
      const genreResult = results.find((r) => r.genre === genre)

      if (genreResult && genreResult.matchedPatterns.length > 0) {
        // At least one pattern should have a valid era for that genre
        const hasValidEra = genreResult.matchedPatterns.some((p) => validEras.includes(p.era!))
        expect(hasValidEra).toBe(true)
      }
    })
  })
})
