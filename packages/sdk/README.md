# @music-reasoning/sdk

> Offline-first music theory intelligence SDK with local AI explanations

The Music Reasoning SDK provides deterministic music theory calculations combined with optional AI-powered explanations. All core functionality works 100% offline, with AI features gracefully degrading when unavailable.

## Features

- **Hybrid Intelligence**: Deterministic music theory (tonal.js) + optional AI explanations
- **Offline-First**: Core functions work without internet or AI model
- **Graceful Degradation**: AI unavailable? Get deterministic data + clear error message
- **Smart Caching**: Repeated queries return instantly (<50ms) from cache
- **Configurable AI**: Factual (0.3 temp) or creative (0.7 temp) explanations
- **Batch Processing**: Process multiple chords efficiently with model reuse
- **TypeScript Native**: Full type safety with IntelliSense support

## Installation

```bash
npm install @music-reasoning/sdk
# or
pnpm add @music-reasoning/sdk
# or
yarn add @music-reasoning/sdk
```

## Model Setup

The SDK uses a local AI model for explanations. You'll need to download and place the model file before AI features will work.

**Model**: Music Reasoning SDK - Core 3B v4.5 (Phi-3-Mini-3.8B INT4, 2.2GB GGUF Q4_K_M)

### Automatic Setup (Recommended)

```bash
# Download and place model automatically (coming soon)
npx @music-reasoning/sdk setup
```

### Manual Setup

1. **Download the model** from the releases page or research repository
2. **Create the models directory**:
   ```bash
   mkdir -p ~/.music-reasoning/models
   ```
3. **Place the model file**:
   ```bash
   # Move or copy the downloaded model
   mv music-reasoning-core3b-v4.5-q4km.gguf ~/.music-reasoning/models/
   ```

**Note**: Without the model, AI explanation features will gracefully degrade—you'll still get deterministic music theory data, but explanations will return clear error messages.

### CI/CD Environments

For continuous integration or automated testing:

```bash
# Skip integration tests that require the model
npm test

# Or download model in CI (if hosted)
curl -L https://example.com/models/v4.5.gguf -o ~/.music-reasoning/models/music-reasoning-core3b-v4.5-q4km.gguf
```

## Quick Start

**Note**: All code examples use top-level `await`. If you're in a CommonJS environment or non-async context, wrap them in an async function:

```javascript
;(async () => {
  // Your code here
})()
```

### Basic Chord Explanation

```typescript
import { chord } from '@music-reasoning/sdk'

// Get deterministic chord data + AI explanation
const result = await chord.explain(['C', 'E', 'G'])

console.log(result.data)
// {
//   chord: 'C major',
//   root: 'C',
//   quality: 'major',
//   intervals: ['P1', 'M3', 'P5'],
//   notes: ['C', 'E', 'G']
// }

console.log(result.explanation)
// "The C major chord is a bright, consonant triad consisting of the root (C),
//  major third (E), and perfect fifth (G). It's one of the most fundamental
//  chords in Western music theory."
```

### Scale Explanation

```typescript
import { scale } from '@music-reasoning/sdk'

// Explain a scale with AI-generated insights
const result = await scale.explain('C', 'major')

console.log(result.data)
// {
//   root: 'C',
//   type: 'major',
//   notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
//   intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']
// }

console.log(result.explanation)
// "The C major scale is the foundational diatonic scale with no sharps or
//  flats. Its bright, stable character makes it ideal for beginners and
//  serves as the reference point for understanding other scales."
```

### Progression Analysis

```typescript
import { progression } from '@music-reasoning/sdk'

// Analyze a chord progression with genre detection
const result = await progression.analyze(['Dm7', 'G7', 'Cmaj7'])

console.log(result.data)
// {
//   key: 'C major',
//   analysis: [
//     { chord: 'Dm7', degree: 'ii', function: 'predominant' },
//     { chord: 'G7', degree: 'V', function: 'dominant' },
//     { chord: 'Cmaj7', degree: 'I', function: 'tonic' }
//   ],
//   suggestedGenres: [
//     { genre: 'jazz', confidence: 1.0, matchedPatterns: ['ii-V-I'] }
//   ]
// }

console.log(result.explanation)
// "This is a classic ii-V-I progression in C major, fundamental to jazz harmony.
//  The Dm7 sets up tension as the predominant chord, G7 creates maximum pull as
//  the dominant, and Cmaj7 provides resolution as the tonic."
```

## Advanced Usage

### Configurable AI Creativity

```typescript
// Factual explanations (music theory textbooks, quizzes)
const factual = await chord.explain(['Dm7', 'G7', 'Cmaj7'], {
  temperature: 0.3, // Low temperature = consistent, factual
  maxTokens: 100, // Shorter explanations
})

// Creative explanations (composition tools, brainstorming)
const creative = await chord.explain(['Dm7', 'G7', 'Cmaj7'], {
  temperature: 0.7, // Higher temperature = varied, creative
  maxTokens: 200, // Longer explanations with suggestions
})
```

### Batch Processing

```typescript
import { chord } from '@music-reasoning/sdk'

// Process multiple chords efficiently (model loads once, reused for all)
const chords = [
  ['C', 'E', 'G'], // C major
  ['D', 'F#', 'A'], // D major
  ['E', 'G#', 'B'], // E major
  ['F', 'A', 'C'], // F major
]

const results = await chord.explainBatch(chords, {
  useCache: true, // Check cache first
  timeout: 30000, // 30s timeout per chord
})

// Results array has same length as input (partial success pattern)
console.log(results.length) // 4
console.log(results[0].explanation) // "The C major chord..."
```

### Graceful Degradation

```typescript
// AI model unavailable? Get deterministic data + clear error
const result = await chord.explain(['C', 'E', 'G'])

if (result.error) {
  console.log(result.error)
  // {
  //   code: 'MODEL_UNAVAILABLE',
  //   message: 'AI model not found or failed to load',
  //   suggestion: 'Download the v4.5 model (2.2GB) or use cloud API'
  // }
}

// Deterministic data ALWAYS present (never undefined)
console.log(result.data.chord) // 'C major' (works offline!)
```

### Smart Caching

```typescript
// First call: Invokes AI model (~3s)
const first = await chord.explain(['C', 'E', 'G'])

// Second call: Returns cached result (<50ms)
const cached = await chord.explain(['C', 'E', 'G'])

// Disable cache for fresh results
const fresh = await chord.explain(['C', 'E', 'G'], {
  useCache: false,
})
```

## Configuration Options

```typescript
interface ExplainOptions {
  temperature?: number // AI creativity (0.0-1.0, default: 0.5)
  maxTokens?: number // Response length (50-500, default: 150)
  timeout?: number // Inference timeout in ms (≥5000, default: 30000)
  useCache?: boolean // Enable caching (default: true)
}
```

## Error Handling

The SDK never throws exceptions. All errors are returned in the response object:

```typescript
const result = await chord.explain(['C', 'E', 'G'])

if (result.error) {
  switch (result.error.code) {
    case 'MODEL_UNAVAILABLE':
      // AI model not loaded, deterministic data still works
      break
    case 'TIMEOUT':
      // AI inference exceeded timeout, deterministic data still works
      break
    case 'INSUFFICIENT_RAM':
      // Not enough memory to load model
      break
    case 'INVALID_INPUT':
      // Input validation failed
      break
  }
}

// Deterministic data ALWAYS present (even with errors)
console.log(result.data)
```

## API Reference

### Chord API

- `chord.explain(notes: string[], options?: ExplainOptions)` - Explain a chord with AI
- `chord.explainBatch(noteSets: string[][], options?: ExplainOptions)` - Batch explain multiple chords
- `chord.identify(notes: string[])` - Deterministic identification (no AI)

### Scale API

- `scale.explain(root: string, type: string, options?: ExplainOptions)` - Explain a scale with AI
- `scale.get(root: string, type: string)` - Deterministic generation (no AI)

### Progression API

- `progression.analyze(chords: string[], options?: ExplainOptions)` - Analyze progression with AI
- `progression.detectGenre(chords: string[])` - Deterministic genre detection (no AI)

## Performance

- **Cold start**: <6s (first AI call, model loading)
- **Warm start**: <3s (subsequent AI calls, model loaded)
- **Cache hit**: <50ms (repeated queries)
- **Batch processing**: ~50% faster than sequential calls (model reuse)

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  ExplainOptions,
  ExplanationResult,
  ExplanationError,
  ChordIdentification,
  ScaleInfo,
  ProgressionInfo,
} from '@music-reasoning/sdk'
```

## Architecture

```
┌─────────────────────────────────────────────┐
│   Hybrid Intelligence Model                 │
├─────────────────────────────────────────────┤
│ Layer 1: Deterministic (Always Offline)    │
│   • Chord identification                    │
│   • Scale generation                        │
│   • Genre detection                         │
│   • Source: @music-reasoning/core          │
├─────────────────────────────────────────────┤
│ Layer 2: Local AI (Offline After Download) │
│   • Explanations                            │
│   • Suggestions                             │
│   • Model: Phi-3-Mini-3.8B INT4 (~2.2GB)   │
│   • Inference: 2-7s (hardware-dependent)    │
├─────────────────────────────────────────────┤
│ Layer 3: Cache (In-Memory)                 │
│   • 24h TTL + 1000 entry LRU               │
│   • Pitch-class normalization              │
│   • <50ms lookup                            │
└─────────────────────────────────────────────┘
```

## Contributing

Contributions welcome! See the [contributing guidelines](https://github.com/bejarcode/music-reasoning-sdk#contributing) for development setup.

## License

MIT © Music Reasoning SDK

## Links

- **Website**: [musicreasoningsdk.com](https://musicreasoningsdk.com)
- **GitHub**: [music-reasoning-sdk](https://github.com/bejarcode/music-reasoning-sdk)
- **Issues**: [Report bugs or request features](https://github.com/bejarcode/music-reasoning-sdk/issues)
- **Contact**: me@victorbejar.com (Music Reasoning SDK support)
