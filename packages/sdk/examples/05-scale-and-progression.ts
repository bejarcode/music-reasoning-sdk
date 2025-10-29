/**
 * Example 5: Scale and Progression Analysis
 *
 * This example demonstrates the scale.explain() and progression.analyze() APIs,
 * which extend the hybrid intelligence pattern to scales and chord progressions.
 *
 * Run: pnpm tsx examples/05-scale-and-progression.ts
 */

import { scale, progression } from '../src'

async function main() {
  console.log('🎵 Scale and Progression Analysis Example\n')

  // Example 1: Scale Explanation
  console.log('1. SCALE EXPLANATION')
  console.log('─'.repeat(60))

  const cMajor = await scale.explain('C', 'major')

  console.log('C Major Scale:')
  console.log(`  Root: ${cMajor.data.root}`)
  console.log(`  Type: ${cMajor.data.type}`)
  console.log(`  Notes: ${cMajor.data.notes.join(' - ')}`)
  console.log(`  Intervals: ${cMajor.data.intervals.join(', ')}`)

  if (cMajor.explanation) {
    console.log(`\n  AI Explanation:`)
    console.log(`  ${cMajor.explanation}`)
  }

  console.log('\n')

  // Example 2: Modal Scale
  const dorian = await scale.explain('D', 'dorian')

  console.log('D Dorian Scale:')
  console.log(`  Notes: ${dorian.data.notes.join(' - ')}`)

  if (dorian.explanation) {
    console.log(`  Explanation: ${dorian.explanation}`)
  }

  console.log('\n' + '─'.repeat(60) + '\n')

  // Example 3: Progression Analysis
  console.log('2. PROGRESSION ANALYSIS')
  console.log('─'.repeat(60))

  // Jazz ii-V-I progression
  const jazzProgression = await progression.analyze(['Dm7', 'G7', 'Cmaj7'])

  console.log('Jazz Progression (Dm7 - G7 - Cmaj7):')
  console.log(`  Key: ${jazzProgression.data.key}`)

  console.log('\n  Analysis:')
  jazzProgression.data.analysis.forEach((chord) => {
    console.log(`    ${chord.chord} → ${chord.degree} (${chord.function})`)
  })

  console.log('\n  Detected Genres:')
  jazzProgression.data.suggestedGenres.forEach((genre) => {
    console.log(`    ${genre.genre} (${(genre.confidence * 100).toFixed(0)}% confidence)`)
    console.log(`    Matched patterns: ${genre.matchedPatterns.join(', ')}`)
  })

  if (jazzProgression.explanation) {
    console.log(`\n  AI Analysis:`)
    console.log(`  ${jazzProgression.explanation}`)
  }

  console.log('\n' + '─'.repeat(60) + '\n')

  // Example 4: Pop Progression
  const popProgression = await progression.analyze(['C', 'G', 'Am', 'F'])

  console.log('Pop Progression (I-V-vi-IV in C):')
  console.log(`  Key: ${popProgression.data.key}`)

  console.log('\n  Detected Genres:')
  popProgression.data.suggestedGenres.forEach((genre) => {
    console.log(`    ${genre.genre} (${(genre.confidence * 100).toFixed(0)}% confidence)`)
  })

  if (popProgression.explanation) {
    console.log(`\n  AI Analysis:`)
    console.log(`  ${popProgression.explanation}`)
  }

  console.log('\n' + '─'.repeat(60) + '\n')

  // Example 5: Using deterministic functions (no AI)
  console.log('3. DETERMINISTIC FUNCTIONS (No AI, Always Offline)')
  console.log('─'.repeat(60))

  // Get scale without AI explanation
  const lydianScale = scale.get('F', 'lydian')
  console.log(`F Lydian scale notes: ${lydianScale.notes.join(' - ')}`)

  // Detect genre without AI analysis
  const genreResults = progression.detectGenre(['C7', 'F7', 'G7'])
  console.log(`\nGenre detection (C7-F7-G7):`)
  genreResults.forEach((result) => {
    console.log(`  ${result.genre}: ${(result.confidence * 100).toFixed(0)}%`)
  })
}

main().catch(console.error)
