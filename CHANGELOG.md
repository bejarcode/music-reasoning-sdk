# Changelog

All notable changes to the Music Reasoning SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-29

**Initial public release** of Music Reasoning SDK - The first offline-first music theory intelligence SDK with local AI.

### 🎯 Core Features

#### Hybrid Intelligence APIs

- **`chord.explain()`** - Get deterministic chord data + AI-powered explanations
  - Returns chord identification (root, quality, intervals, notes)
  - Generates contextual AI explanations of music theory concepts
  - Gracefully degrades when AI unavailable (deterministic data always works)

- **`scale.explain()`** - Get deterministic scale data + AI-powered explanations
  - Returns scale information (root, type, notes, intervals)
  - Provides AI-generated educational explanations
  - Works offline-first with graceful AI degradation

- **`progression.analyze()`** - Get deterministic progression analysis + AI explanations
  - Detects key and confidence
  - Analyzes chord functions and scale degrees
  - Identifies genre patterns (jazz, pop, classical, rock, EDM, blues)
  - Suggests musical genres with confidence scores
  - Provides AI-powered harmonic analysis

#### Performance Optimizations

- **Batch Processing** - `chord.explainBatch()` for efficient multi-chord analysis
  - Processes multiple chords with one model load (~50-60% faster than sequential)
  - Shared cache and model instance across batch
  - Example: 8 chords in ~8s vs ~20s sequential

- **Intelligent Caching** - Hybrid in-memory + disk cache system
  - Cache hits: <50ms response time (p95)
  - 24-hour default TTL
  - Temperature-aware cache keys
  - Cache validation and corruption detection

#### Configurable Creativity

- **Temperature Control** (0.0-1.0) for AI explanation style
  - `0.3` - Factual, consistent (education, quizzes)
  - `0.5` - Balanced (default, general use)
  - `0.7` - Creative, varied (composition, songwriting)

- **Token Limits** - Control explanation length (100-200 tokens)

#### Error Handling & Resilience

- **Graceful Degradation** - Deterministic data always available even when AI fails
- **Structured Error Types**:
  - `MODEL_UNAVAILABLE` - Model not loaded (returns deterministic data)
  - `TIMEOUT` - Inference exceeded timeout (returns deterministic data)
  - `INVALID_INPUT` - Input validation failed (helpful suggestions)
  - `INSUFFICIENT_RAM` - System RAM below requirements
  - `CORRUPTED_MODEL` - Model file integrity issues

- **Timeout Configuration** - Configurable inference timeouts (default: 30s)
- **Non-Blocking Errors** - SDK never throws, always returns structured results

### 📦 Packages

#### Core Package (`@music-reasoning/core`)

- Deterministic music theory engine powered by tonal.js v6+
- Chord identification with 135+ golden tests
- Scale generation with 71+ golden tests
- Progression analysis with Roman numeral notation
- Genre detection (50+ patterns across 6 genres: jazz, pop, classical, rock, EDM, blues)
- **472 tests (100% passing, 100% coverage)**

#### SDK Package (`@music-reasoning/sdk`)

- Hybrid intelligence API (deterministic + local AI)
- Namespace-based API design (`chord.*`, `scale.*`, `progression.*`)
- Batch processing support
- Graceful degradation pattern
- **277 tests (100% passing, 100% coverage)**

#### Types Package (`@music-reasoning/types`)

- Shared TypeScript definitions
- Full type safety across SDK
- Exported for consumer use

### 🤖 Local AI Integration

- **Model**: Music Reasoning Core 3B v4.5 (fine-tuned Phi-3-Mini-3.8B INT4)
  - Base: Microsoft Phi-3-Mini-3.8B
  - Fine-tuned on MusicTheoryBench + GPT-4o curated examples
  - Size: ~2.2GB (GGUF Q4_K_M quantization)
  - Accuracy: **87.5%** on diagnostic tests

- **Performance Benchmarks**:
  - Cold start: 3-6 seconds (includes model loading)
  - Warm inference: 1.3-4 seconds (model loaded)
  - Cache hits: <50ms (p95)
  - Batch processing: 55-77% faster than sequential

### ⚙️ System Requirements

**Minimum:**

- RAM: 4GB available
- Storage: 2.2GB for model file
- Node.js: 18+

**Recommended:**

- RAM: 8GB+
- GPU: M1/M2 (Metal) or RTX series (CUDA)
- Storage: SSD for faster model loading

**Platform Support:**

- ✅ **Supported**: Node.js (v18+)
- 🔜 **Planned**: Browser (v0.3.0)

### 🎨 Developer Experience

- **TypeScript-First** - Full type safety with exported definitions
- **ESM + CJS** - Dual module format for maximum compatibility
- **Comprehensive Examples** - 5 runnable examples covering all use cases
- **100% Test Coverage** - 749 total tests across packages
- **Offline-First** - Works 100% offline after initial setup

### 🏗️ Architecture Principles

1. **Offline-First** (Non-Negotiable)
   - SDK is PRIMARY product, cloud API is optional enhancement
   - Every feature works offline after initial setup
   - No hard lockouts, graceful degradation everywhere

2. **Deterministic Truth Layer**
   - Music theory calculations use tonal.js (mathematically accurate, no AI hallucinations)
   - C-E-G is ALWAYS C major (deterministic, not AI-inferred)
   - 100% accuracy on basic triads, 95%+ accuracy on 7th chords

3. **Hybrid Intelligence Model**
   - Layer 1: Deterministic (always offline) - tonal.js
   - Layer 2: Local AI (offline after download) - Phi-3 fine-tuned
   - Layer 3: Cloud AI (online, optional) - GPT-4o (future)

### 📄 License

**Dual License**:

- **Open Source**: Core (`@music-reasoning/core`) and Types (`@music-reasoning/types`) - MIT License
- **Commercial**: SDK (`@music-reasoning/sdk`) - Proprietary License

### 🚀 Getting Started

```bash
# Install
npm install @music-reasoning/sdk

# Use
import { chord } from '@music-reasoning/sdk'

const result = await chord.explain(['C', 'E', 'G'])
console.log(result.data.chord)      // "C major"
console.log(result.explanation)     // AI-generated explanation
```

See [README.md](README.md) for complete documentation.

### Known Limitations

- **Browser Support**: Not yet available (planned for v0.3.0)
- **Model Download**: 2.2GB model must be downloaded separately
- **First Call Latency**: 3-6s cold start includes model loading
- **RAM Requirements**: 4GB minimum for model inference

---

## Release History

- [0.1.0] - 2025-10-29 - Initial public release

[0.1.0]: https://github.com/bejarcode/music-reasoning-sdk/releases/tag/v0.1.0
