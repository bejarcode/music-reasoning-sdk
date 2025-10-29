# Changelog

All notable changes to @music-reasoning/sdk will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-29

**Initial public release** - Hybrid intelligence music theory SDK with local AI.

### Added

#### Hybrid Intelligence APIs

- **`chord.explain()`** - Deterministic chord data + AI explanations
- **`scale.explain()`** - Deterministic scale data + AI explanations
- **`progression.analyze()`** - Genre detection + harmonic analysis
- **`chord.explainBatch()`** - Batch processing (50-60% faster)

#### Performance & Caching

- Intelligent caching system (cache hits: <50ms)
- Temperature-aware cache keys
- 24-hour TTL with corruption detection

#### Configuration Options

- Temperature control (0.3-0.7) for explanation creativity
- Token limits (100-200) for response length
- Timeout configuration (default: 30s)

#### Error Handling

- Graceful degradation (deterministic data always available)
- Structured error types with actionable suggestions
- Non-blocking error pattern (never throws)

### Performance Benchmarks

- **Cold start**: 3-6 seconds (includes model loading)
- **Warm inference**: 1.3-4 seconds (model loaded)
- **Cache hits**: <50ms (p95)
- **Batch processing**: 55-77% faster than sequential

### Tests

- **277 tests** (100% passing)
- **100% test coverage**
- 191 unit tests, 24 integration tests, 3 batch tests

### Breaking Changes

None. This is the initial release.

---

## Release History

- [0.1.0] - 2025-10-29 - Initial public release

[0.1.0]: https://github.com/bejarcode/music-reasoning-sdk/releases/tag/v0.1.0
