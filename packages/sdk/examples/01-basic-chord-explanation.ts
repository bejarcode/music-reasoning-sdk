/**
 * Example 1: Basic Chord Explanation
 *
 * This example demonstrates the core functionality of the SDK:
 * getting deterministic chord data + AI-generated explanations.
 *
 * Run: pnpm tsx examples/01-basic-chord-explanation.ts
 */

import { chord } from '../src'

async function main() {
  console.log('🎵 Basic Chord Explanation Example\n')

  // Example 1: Simple major triad
  console.log('1. C Major Triad:')
  const cMajor = await chord.explain(['C', 'E', 'G'])

  console.log('Deterministic Data:')
  console.log(`  Chord: ${cMajor.data.chord}`)
  console.log(`  Root: ${cMajor.data.root}`)
  console.log(`  Quality: ${cMajor.data.quality}`)
  console.log(`  Intervals: ${cMajor.data.intervals.join(', ')}`)
  console.log(`  Notes: ${cMajor.data.notes.join(', ')}`)

  if (cMajor.explanation) {
    console.log('\nAI Explanation:')
    console.log(`  ${cMajor.explanation}`)
  }

  console.log('\n' + '─'.repeat(60) + '\n')

  // Example 2: Seventh chord
  console.log('2. G Dominant 7th:')
  const g7 = await chord.explain(['G', 'B', 'D', 'F'])

  console.log(`Chord: ${g7.data.chord}`)
  console.log(`Intervals: ${g7.data.intervals.join(', ')}`)

  if (g7.explanation) {
    console.log(`\nExplanation: ${g7.explanation}`)
  }

  console.log('\n' + '─'.repeat(60) + '\n')

  // Example 3: Complex jazz chord
  console.log('3. Dm9 Chord:')
  const dm9 = await chord.explain(['D', 'F', 'A', 'C', 'E'])

  console.log(`Chord: ${dm9.data.chord}`)
  console.log(`Notes: ${dm9.data.notes.join(', ')}`)

  if (dm9.explanation) {
    console.log(`\nExplanation: ${dm9.explanation}`)
  }
}

main().catch(console.error)
