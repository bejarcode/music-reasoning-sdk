# Music Reasoning SDK

**Offline-first music theory intelligence SDK with local AI**

[![npm version](https://img.shields.io/npm/v/@music-reasoning/sdk)](https://www.npmjs.com/package/@music-reasoning/sdk)
[![CI](https://github.com/bejarcode/music-reasoning-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/bejarcode/music-reasoning-sdk/actions/workflows/ci.yml)
[![License: Dual](https://img.shields.io/badge/License-Dual%20%28MIT%20+%20Commercial%29-blue)](https://github.com/bejarcode/music-reasoning-sdk#license)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

## Why Music Reasoning SDK?

**Musicians create offline.** Music apps requiring internet are fundamentally broken.

This SDK enables music applications to work **anywhere** (basements, planes, cabins) with intelligent music theory analysis powered by local AI—no internet required. Optional cloud enhancement available for advanced features.

```typescript
import { chord } from '@music-reasoning/sdk'

// Get chord identification + AI explanation (works 100% offline)
const result = await chord.explain(['C', 'E', 'G'])
console.log(result.data.chord) // "C major"
console.log(result.explanation) // "The C major chord is a bright, consonant triad..."
```

---

## Key Features

- **Offline-First Architecture**: Works 100% offline after installation. No API keys required.
- **Hybrid Intelligence**: Local AI (Phi-3-Mini v4.5, 87.5% accuracy) + optional cloud (GPT-4o)
- **Graceful Degradation**: Deterministic music theory always works, AI optional
- **Production Ready**: 277 tests passing, full TypeScript support, comprehensive docs
- **High Performance**: Cold start <6s, warm inference 1-4s, cache hits <50ms
- **Four Packages**: Types (MIT), Core (MIT), SDK (Commercial), AI Runtime (Commercial, coming soon)

---

## Quick Start

### Installation

```bash
npm install @music-reasoning/sdk
# or
pnpm add @music-reasoning/sdk
```

### Basic Usage

```typescript
import { chord, scale, progression } from '@music-reasoning/sdk'

// Chord identification + AI explanation
const chordResult = await chord.explain(['C', 'E', 'G', 'B'])
console.log(chordResult.data) // { chord: 'Cmaj7', root: 'C', quality: 'major 7th', ... }
console.log(chordResult.explanation) // AI-generated explanation

// Scale generation + AI explanation
const scaleResult = await scale.explain('D', 'dorian')
console.log(scaleResult.data.notes) // ['D', 'E', 'F', 'G', 'A', 'B', 'C']
console.log(scaleResult.explanation) // AI-generated explanation

// Progression analysis with genre detection
const progResult = await progression.analyze(['Dm7', 'G7', 'Cmaj7'])
console.log(progResult.data.suggestedGenres[0])
// { genre: 'jazz', confidence: 1.0, matchedPatterns: ['ii-V-I'], ... }
```

### Deterministic Functions (Instant, No AI)

```typescript
import { chord, progression } from '@music-reasoning/sdk'

// Instant chord identification (no AI needed)
const chordData = chord.identify(['G', 'B', 'D', 'F'])
// { chord: 'G7', root: 'G', quality: 'dominant 7th', intervals: ['P1', 'M3', 'P5', 'm7'] }

// Genre detection (50+ patterns across 6 genres)
const genres = progression.detectGenre(['I', 'V', 'vi', 'IV'])
// [{ genre: 'pop', confidence: 1.0, matchedPatterns: [...], description: '...' }]
```

**Works 100% offline after installation.** No API keys, no internet required for core functionality.

---

## Package Architecture

This SDK follows a **dual-licensing model** to balance open-source benefits with sustainable development:

| Package                                      | License    | Source Available   | Purpose                           |
| -------------------------------------------- | ---------- | ------------------ | --------------------------------- |
| **[@music-reasoning/types](packages/types)** | MIT        | Yes (full source)  | Shared TypeScript definitions     |
| **[@music-reasoning/core](packages/core)**   | MIT        | Yes (full source)  | Deterministic music theory engine |
| **[@music-reasoning/sdk](packages/sdk)**     | Commercial | No (compiled only) | Hybrid intelligence SDK with AI   |
| **@music-reasoning/ai-local**                | Commercial | No (compiled only) | Local AI runtime (coming soon)    |

### What's Always Free & Open Source?

- **Full music theory engine** (`@music-reasoning/core`) - chord identification, scale generation, progression analysis
- **TypeScript types** (`@music-reasoning/types`) - complete type definitions
- **Genre pattern database** - 50+ patterns across jazz, pop, classical, rock, EDM, blues
- **Unlimited offline usage** - no rate limits, no API keys

### What Requires a License?

- **AI explanations** - Natural language explanations of chords, scales, progressions
- **Advanced analysis** - AI-powered reharmonization suggestions (coming soon)
- **Cloud integration** - Optional GPT-4o enhancement for advanced features (coming soon)

**Try it free:** Deterministic functions work immediately after `npm install`. AI features gracefully degrade if not configured.

---

## Core Principles

### 1. Offline-First Architecture

Every feature works offline after initial setup. Internet is optional, never required.

### 2. Deterministic Truth Layer

Music theory calculations are mathematically accurate using [tonal.js](https://github.com/tonaljs/tonal)—no AI hallucinations. C-E-G is **always** C major.

### 3. Hybrid Intelligence

Three layers working together:

- **Deterministic** (instant) → Local AI (2-4s) → Cloud AI (optional, <1s)
- Graceful degradation: Always get deterministic data, AI adds explanation layer

### 4. Developer Experience

Zero-config installation, comprehensive TypeScript support, extensive documentation, 5+ examples included.

---

## Documentation

- **[SDK API Documentation](packages/sdk/README.md)** - Complete API reference
- **[Performance Benchmarks](packages/sdk/PERFORMANCE.md)** - Detailed performance analysis
- **[Changelog](packages/sdk/CHANGELOG.md)** - Release notes and migration guides
- **[Examples](packages/sdk/examples/)** - 5 complete usage examples
- **[Core Engine Docs](packages/core/README.md)** - Deterministic music theory API
- **[TypeScript Types](packages/types/README.md)** - Type definitions reference

---

## Technology Stack

- **TypeScript 5.x** - Full type safety
- **tonal.js v6+** - Music theory primitives
- **Phi-3-Mini-3.8B v4.5** - Local AI model (87.5% accuracy, 2.2GB)
- **llama.cpp** - High-performance inference engine with Metal/CUDA acceleration
- **Vitest** - 277+ tests ensuring quality

---

## Contributing

We welcome contributions to our **open-source packages** (`@music-reasoning/types` and `@music-reasoning/core`)!

**Get Started:**

- **Report Issues**: [Open an issue](https://github.com/bejarcode/music-reasoning-sdk/issues) for bugs or feature requests
- **Submit Pull Requests**: Fork, make changes, and submit a PR
- **Improve Documentation**: Help us make the docs better!

For development setup, testing guidelines, and coding standards, see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## License

This project uses **dual licensing**:

### Open Source (MIT License)

- `@music-reasoning/types` - [MIT License](packages/types/LICENSE)
- `@music-reasoning/core` - [MIT License](packages/core/LICENSE)

These packages are **fully open source**. You can use, modify, and distribute them freely.

### Commercial (Proprietary License)

- `@music-reasoning/sdk` - [Commercial License](packages/sdk/LICENSE)
- `@music-reasoning/ai-local` - [Commercial License](packages/ai-local/LICENSE) (coming soon)

These packages require a commercial license for production use. See individual LICENSE files for details.

**Summary:**

- **Free forever**: Deterministic music theory engine (MIT)
- **Commercial license**: AI-powered features (explanations, advanced analysis)

---

## Links

- **Website**: [musicreasoningsdk.com](https://musicreasoningsdk.com)
- **npm Packages**: [@music-reasoning/sdk](https://www.npmjs.com/package/@music-reasoning/sdk), [@music-reasoning/core](https://www.npmjs.com/package/@music-reasoning/core), [@music-reasoning/types](https://www.npmjs.com/package/@music-reasoning/types)
- **GitHub**: [music-reasoning-sdk](https://github.com/bejarcode/music-reasoning-sdk)
- **Contact**: me@victorbejar.com (Music Reasoning SDK support)
- **Built with**: [tonal.js](https://github.com/tonaljs/tonal)

---

## Built for Musicians, by Musicians

Music Reasoning SDK enables the next generation of **offline-capable music applications**. Whether you're building a composition tool, practice assistant, or music education platform—start with intelligence that works everywhere.

```bash
npm install @music-reasoning/sdk
```

**Get started in seconds. Works offline forever.**

---

**Version 0.1.1** - October 2025
