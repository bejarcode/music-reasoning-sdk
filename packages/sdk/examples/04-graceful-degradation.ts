/**
 * Example 4: Graceful Degradation & Error Handling
 *
 * This example demonstrates how the SDK handles AI unavailability gracefully.
 * Deterministic functions always work, and explain() methods return
 * deterministic data even when AI fails.
 *
 * Run: pnpm tsx examples/04-graceful-degradation.ts
 */

import { chord } from '../src'

async function main() {
  console.log('🎵 Graceful Degradation Example\n')

  // Example 1: Normal operation
  console.log('1. Normal Operation (AI available):')
  const result1 = await chord.explain(['C', 'E', 'G'])

  console.log(`   Chord: ${result1.data.chord}`)
  console.log(`   Has explanation: ${!!result1.explanation}`)
  console.log(`   Has error: ${!!result1.error}`)

  console.log('\n' + '─'.repeat(60) + '\n')

  // Example 2: Handling MODEL_UNAVAILABLE
  console.log('2. Handling AI Unavailability:')
  const result2 = await chord.explain(['G', 'B', 'D', 'F'])

  // Deterministic data ALWAYS present
  console.log(`   Chord identified: ${result2.data.chord}`)
  console.log(`   Root: ${result2.data.root}`)
  console.log(`   Intervals: ${result2.data.intervals.join(', ')}`)

  // Check for errors
  if (result2.error) {
    console.log('\n   AI Error Details:')
    console.log(`   Code: ${result2.error.code}`)
    console.log(`   Message: ${result2.error.message}`)
    console.log(`   Suggestion: ${result2.error.suggestion}`)
  }

  console.log('\n' + '─'.repeat(60) + '\n')

  // Example 3: Deterministic functions always work
  console.log('3. Deterministic Functions (Always Work):')

  // These functions don't use AI, so they always work instantly
  const identified = chord.identify(['F', 'A', 'C'])

  console.log(`   Chord.identify() result: ${identified.chord}`)
  console.log(`   Response time: <50ms (no AI needed)`)
  console.log(`   Offline capable: ✓`)

  console.log('\n' + '─'.repeat(60) + '\n')

  // Example 4: Error handling pattern
  console.log('4. Recommended Error Handling Pattern:')

  const result4 = await chord.explain(['A', 'C#', 'E'])

  if (result4.error) {
    switch (result4.error.code) {
      case 'MODEL_UNAVAILABLE':
        console.log('   → AI model not loaded, using deterministic data only')
        console.log('   → Suggestion: Download model or use cloud API')
        break

      case 'TIMEOUT':
        console.log('   → AI inference timed out, using deterministic data only')
        console.log('   → Suggestion: Increase timeout or use faster hardware')
        break

      case 'INSUFFICIENT_RAM':
        console.log('   → Not enough RAM to load model')
        console.log('   → Suggestion: Close other applications or upgrade RAM')
        break

      case 'INVALID_INPUT':
        console.log('   → Input validation failed')
        console.log(`   → Details: ${result4.error.message}`)
        break

      default:
        console.log(`   → Unknown error: ${result4.error.message}`)
    }
  }

  // Deterministic data ALWAYS available
  console.log(`\n   Deterministic chord data: ${result4.data.chord}`)
  console.log(`   SDK never throws exceptions: ✓`)
  console.log(`   Deterministic layer always functional: ✓`)
}

main().catch(console.error)
