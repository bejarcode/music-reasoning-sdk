/**
 * Example 3: Configurable AI Creativity
 *
 * This example demonstrates how temperature settings affect explanation style:
 * - Low temperature (0.3): Factual, consistent explanations (textbooks, quizzes)
 * - High temperature (0.7): Creative, varied explanations (composition tools)
 *
 * Run: pnpm tsx examples/03-configurable-creativity.ts
 */

import { chord } from '../src'

async function main() {
  console.log('🎵 Configurable Creativity Example\n')

  const chordNotes = ['D', 'F#', 'A', 'C'] // D7 (D dominant 7th)

  // Factual mode (for music theory education)
  console.log('1. FACTUAL MODE (temperature: 0.3)')
  console.log('   Use case: Music theory textbooks, quiz apps\n')

  const factual = await chord.explain(chordNotes, {
    temperature: 0.3,
    maxTokens: 100,
  })

  console.log(`   ${factual.explanation || 'No explanation available'}\n`)

  console.log('─'.repeat(60) + '\n')

  // Balanced mode (default)
  console.log('2. BALANCED MODE (temperature: 0.5, default)')
  console.log('   Use case: General music apps\n')

  const balanced = await chord.explain(chordNotes, {
    temperature: 0.5,
    maxTokens: 150,
  })

  console.log(`   ${balanced.explanation || 'No explanation available'}\n`)

  console.log('─'.repeat(60) + '\n')

  // Creative mode (for composition tools)
  console.log('3. CREATIVE MODE (temperature: 0.7)')
  console.log('   Use case: Composition assistants, songwriting tools\n')

  const creative = await chord.explain(chordNotes, {
    temperature: 0.7,
    maxTokens: 200,
  })

  console.log(`   ${creative.explanation || 'No explanation available'}\n`)

  console.log('─'.repeat(60) + '\n')

  // Comparison
  console.log('COMPARISON:')
  console.log(`  Factual length: ${factual.explanation?.split(' ').length || 0} words`)
  console.log(`  Balanced length: ${balanced.explanation?.split(' ').length || 0} words`)
  console.log(`  Creative length: ${creative.explanation?.split(' ').length || 0} words`)
}

main().catch(console.error)
