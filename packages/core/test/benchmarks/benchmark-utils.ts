/**
 * Performance Benchmarking Utilities
 *
 * Provides utilities for measuring and validating performance of music theory operations.
 * Ensures all deterministic operations meet the <50ms p95 requirement.
 *
 * @packageDocumentation
 * @since v1.0.0
 */

/**
 * Benchmark result statistics.
 */
export interface BenchmarkResult {
  /** 50th percentile (median) in milliseconds */
  p50: number

  /** 95th percentile in milliseconds */
  p95: number

  /** 99th percentile in milliseconds */
  p99: number

  /** Maximum execution time in milliseconds */
  max: number

  /** Minimum execution time in milliseconds */
  min: number

  /** Average execution time in milliseconds */
  avg: number

  /** Total number of iterations */
  iterations: number
}

/**
 * Runs a benchmark test on a function and returns performance statistics.
 *
 * @param fn - Function to benchmark (should be synchronous)
 * @param iterations - Number of times to run the function (default: 1000)
 * @returns Performance statistics including p50, p95, p99, max, min, avg
 *
 * @example
 * ```typescript
 * const result = runBenchmark(() => {
 *   identifyChord(['C', 'E', 'G'])
 * }, 1000)
 *
 * console.log(`p95: ${result.p95}ms`)
 * expect(result.p95).toBeLessThan(50) // Should be under 50ms
 * ```
 *
 * @since v1.0.0
 */
export function runBenchmark(fn: () => void, iterations: number = 1000): BenchmarkResult {
  if (iterations < 1) {
    throw new Error('Iterations must be at least 1')
  }

  const times: number[] = []

  // Warmup run (not counted)
  fn()

  // Benchmark runs
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    const end = performance.now()
    times.push(end - start)
  }

  // Sort times for percentile calculations
  times.sort((a, b) => a - b)

  // Calculate statistics
  const p50Index = Math.floor(times.length * 0.5)
  const p95Index = Math.floor(times.length * 0.95)
  const p99Index = Math.floor(times.length * 0.99)

  const sum = times.reduce((acc, time) => acc + time, 0)
  const avg = sum / times.length

  return {
    p50: times[p50Index] ?? 0,
    p95: times[p95Index] ?? 0,
    p99: times[p99Index] ?? 0,
    max: times[times.length - 1] ?? 0,
    min: times[0] ?? 0,
    avg,
    iterations,
  }
}

/**
 * Asserts that a benchmark result meets performance requirements.
 *
 * @param result - Benchmark result from runBenchmark()
 * @param maxP95 - Maximum allowed p95 time in milliseconds
 * @throws {Error} If p95 exceeds the maximum
 *
 * @example
 * ```typescript
 * const result = runBenchmark(() => identifyChord(['C', 'E', 'G']), 1000)
 * assertPerformance(result, 50) // Throws if p95 > 50ms
 * ```
 *
 * @since v1.0.0
 */
export function assertPerformance(result: BenchmarkResult, maxP95: number): void {
  if (result.p95 > maxP95) {
    throw new Error(
      `Performance requirement not met: p95 (${result.p95.toFixed(2)}ms) exceeds max (${maxP95}ms)\n` +
        `Stats: p50=${result.p50.toFixed(2)}ms, p95=${result.p95.toFixed(2)}ms, p99=${result.p99.toFixed(2)}ms, max=${result.max.toFixed(2)}ms`
    )
  }
}

/**
 * Formats a benchmark result as a human-readable string.
 *
 * @param result - Benchmark result to format
 * @returns Formatted string with all statistics
 *
 * @example
 * ```typescript
 * const result = runBenchmark(() => identifyChord(['C', 'E', 'G']), 1000)
 * console.log(formatBenchmarkResult(result))
 * // Output:
 * // Iterations: 1000
 * // p50: 1.23ms
 * // p95: 2.45ms
 * // p99: 3.67ms
 * // avg: 1.50ms
 * // min: 0.89ms
 * // max: 4.12ms
 * ```
 *
 * @since v1.0.0
 */
export function formatBenchmarkResult(result: BenchmarkResult): string {
  return [
    `Iterations: ${result.iterations}`,
    `p50: ${result.p50.toFixed(2)}ms`,
    `p95: ${result.p95.toFixed(2)}ms`,
    `p99: ${result.p99.toFixed(2)}ms`,
    `avg: ${result.avg.toFixed(2)}ms`,
    `min: ${result.min.toFixed(2)}ms`,
    `max: ${result.max.toFixed(2)}ms`,
  ].join('\n')
}

/**
 * Compares two benchmark results and returns the percentage difference.
 *
 * Useful for regression testing and performance tracking.
 *
 * @param baseline - Baseline benchmark result
 * @param current - Current benchmark result
 * @returns Percentage difference (positive = slower, negative = faster)
 *
 * @example
 * ```typescript
 * const baseline = runBenchmark(() => oldImplementation(), 1000)
 * const current = runBenchmark(() => newImplementation(), 1000)
 * const diff = compareBenchmarks(baseline, current)
 *
 * if (diff > 10) {
 *   console.warn(`Performance regression: ${diff.toFixed(1)}% slower`)
 * } else if (diff < -10) {
 *   console.log(`Performance improvement: ${Math.abs(diff).toFixed(1)}% faster`)
 * }
 * ```
 *
 * @since v1.0.0
 */
export function compareBenchmarks(baseline: BenchmarkResult, current: BenchmarkResult): number {
  if (baseline.p95 === 0) {
    throw new Error('Baseline p95 cannot be zero')
  }

  return ((current.p95 - baseline.p95) / baseline.p95) * 100
}
