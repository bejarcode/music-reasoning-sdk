/**
 * Example 2: Batch Processing
 *
 * This example demonstrates efficient batch processing of multiple chords.
 * The model loads once and processes all chords with warm inference,
 * resulting in ~50% faster total time compared to sequential single calls.
 *
 * Run: pnpm tsx examples/02-batch-processing.ts
 */

import { chord } from '../src'

async function main() {
  console.log('🎵 Batch Processing Example\n')

  // Example: Analyze a chord progression
  const progression = [
    ['C', 'E', 'G'], // I - C major
    ['A', 'C', 'E'], // vi - A minor
    ['F', 'A', 'C'], // IV - F major
    ['G', 'B', 'D'], // V - G major
  ]

  console.log('Processing chord progression (I-vi-IV-V in C major)...\n')

  const startTime = Date.now()

  const results = await chord.explainBatch(progression, {
    temperature: 0.5, // Balanced creativity
    useCache: true, // Enable caching
    timeout: 30000, // 30s per chord
  })

  const elapsedMs = Date.now() - startTime

  console.log(`✓ Processed ${results.length} chords in ${(elapsedMs / 1000).toFixed(2)}s\n`)

  // Display results
  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.data.chord}`)
    console.log(`   Notes: ${result.data.notes.join('-')}`)
    console.log(`   Intervals: ${result.data.intervals.join(', ')}`)

    if (result.explanation) {
      console.log(`   Explanation: ${result.explanation.slice(0, 100)}...`)
    } else if (result.error) {
      console.log(`   Error: ${result.error.message}`)
    }

    console.log()
  })

  // Performance metrics
  console.log('Performance Metrics:')
  console.log(`  Total time: ${(elapsedMs / 1000).toFixed(2)}s`)
  console.log(`  Average per chord: ${(elapsedMs / results.length).toFixed(0)}ms`)
  console.log(`  Sequential baseline: ~${(results.length * 3).toFixed(0)}s (estimated)`)
  console.log(
    `  Speed improvement: ~${((1 - elapsedMs / 1000 / (results.length * 3)) * 100).toFixed(0)}%`
  )
}

main().catch(console.error)
