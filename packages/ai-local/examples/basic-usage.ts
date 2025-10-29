/**
 * Basic usage examples for @music-reasoning/ai-local
 *
 * Run this example:
 * ```bash
 * pnpm tsx examples/basic-usage.ts
 * ```
 *
 * **Prerequisites**:
 * 1. v4.5 model must be available at one of these locations:
 *    - specs/004-research-and-validate/phase3-v4/models/music-reasoning-core3b-v4.5-q4km.gguf
 *    - ~/.cache/music-reasoning-sdk/models/music-reasoning-core3b-v4.5-q4km.gguf
 * 2. Minimum 4GB RAM
 * 3. (Optional) GPU for faster inference (Metal on M1/M2, CUDA on NVIDIA)
 */

import {
  generateExplanation,
  generateFactualExplanation,
  generateCreativeSuggestion,
  isModelLoaded,
  getModelStatus,
} from '../src/index.js'

async function main() {
  console.log('🎵 Music Reasoning SDK - Local AI Demo\n')

  // Check model status before first inference
  console.log('Model status before loading:')
  console.log(getModelStatus())
  console.log()

  // Example 1: Factual question (low temperature = 0.3)
  console.log('📚 Example 1: Factual Explanation')
  console.log('Question: "What notes are in a G7 chord?"\n')

  try {
    const explanation = await generateFactualExplanation('What notes are in a G7 chord?')
    console.log('Answer:', explanation)
    console.log()
  } catch (error) {
    console.error('Error:', (error as Error).message)
    console.log('\n❌ Model loading failed. Check that v4.5 model is available.\n')
    process.exit(1)
  }

  // Model should now be loaded
  console.log(`Model loaded: ${isModelLoaded()}`)
  console.log()

  // Example 2: Creative suggestion (default temperature = 0.5)
  console.log('🎨 Example 2: Creative Suggestion')
  console.log('Question: "Suggest a jazz progression starting with Dm7"\n')

  const suggestion = await generateCreativeSuggestion(
    'Suggest a jazz progression starting with Dm7'
  )
  console.log('Answer:', suggestion)
  console.log()

  // Example 3: General explanation (balanced)
  console.log('🎹 Example 3: General Explanation')
  console.log('Question: "Explain modal interchange"\n')

  const modalExplanation = await generateExplanation('Explain modal interchange in music theory')
  console.log('Answer:', modalExplanation)
  console.log()

  // Example 4: Batch processing
  console.log('📦 Example 4: Batch Processing')
  console.log('Processing 3 questions in sequence...\n')

  const questions = [
    'What is a Cmaj7 chord?',
    'What is a Dm7 chord?',
    'What is the difference between major and minor chords?',
  ]

  for (const question of questions) {
    const answer = await generateFactualExplanation(question)
    console.log(`Q: ${question}`)
    console.log(`A: ${answer}\n`)
  }

  console.log('✅ Demo complete!')
  console.log('\n💡 Tip: Model stays loaded in memory for fast subsequent calls.')
  console.log('   First call: ~2-5s (model loading)')
  console.log('   Subsequent calls: ~0.5-2s (inference only)')
}

// Run demo
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
