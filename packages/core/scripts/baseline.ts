/**
 * Performance Baseline Measurement Script
 *
 * Measures raw tonal.js performance to establish baseline expectations.
 * Results are stored in test/benchmarks/baseline.json for comparison.
 *
 * **Purpose:**
 * - Measure system capabilities (CPU, memory)
 * - Establish baseline performance for tonal.js operations
 * - Compare against target performance (50ms p95)
 * - Document acceptable performance ranges
 *
 * **Usage:**
 * ```bash
 * pnpm run benchmark:baseline
 * ```
 *
 * @packageDocumentation
 * @since v1.0.0
 */

import { Chord, Scale } from 'tonal'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

interface BenchmarkResult {
  p50: number
  p95: number
  p99: number
  max: number
  min: number
  avg: number
}

interface BaselineData {
  timestamp: string
  system: {
    platform: string
    cpus: string
    totalMemory: string
    nodeVersion: string
  }
  benchmarks: {
    chordDetect: BenchmarkResult
    scaleGet: BenchmarkResult
  }
  analysis: {
    meetsTarget: boolean
    targetP95: number
    notes: string[]
  }
}

/**
 * Runs a benchmark on a function
 */
function runBenchmark(fn: () => void, iterations: number = 1000): BenchmarkResult {
  const times: number[] = []

  // Warmup
  fn()

  // Benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    const end = performance.now()
    times.push(end - start)
  }

  // Sort for percentiles
  times.sort((a, b) => a - b)

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
  }
}

/**
 * Main baseline measurement function
 */
function measureBaseline(): BaselineData {
  console.log('🎵 Music Theory Engine - Performance Baseline\n')

  // System info
  const cpuInfo = os.cpus()
  const system = {
    platform: `${os.platform()} ${os.release()}`,
    cpus: `${cpuInfo.length}x ${cpuInfo[0]?.model || 'unknown'}`,
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    nodeVersion: process.version,
  }

  console.log('📊 System Information:')
  console.log(`  Platform: ${system.platform}`)
  console.log(`  CPUs: ${system.cpus}`)
  console.log(`  Memory: ${system.totalMemory}`)
  console.log(`  Node: ${system.nodeVersion}\n`)

  // Benchmark Chord.detect()
  console.log('⚡ Benchmarking Chord.detect() (1000 iterations)...')
  const chordDetectResult = runBenchmark(() => {
    Chord.detect(['C', 'E', 'G'])
    Chord.detect(['D', 'F#', 'A'])
    Chord.detect(['C', 'E', 'G', 'Bb'])
  }, 1000)

  console.log(`  p50: ${chordDetectResult.p50.toFixed(2)}ms`)
  console.log(`  p95: ${chordDetectResult.p95.toFixed(2)}ms`)
  console.log(`  p99: ${chordDetectResult.p99.toFixed(2)}ms`)
  console.log(`  avg: ${chordDetectResult.avg.toFixed(2)}ms\n`)

  // Benchmark Scale.get()
  console.log('⚡ Benchmarking Scale.get() (1000 iterations)...')
  const scaleGetResult = runBenchmark(() => {
    Scale.get('C major')
    Scale.get('G major')
    Scale.get('A minor')
  }, 1000)

  console.log(`  p50: ${scaleGetResult.p50.toFixed(2)}ms`)
  console.log(`  p95: ${scaleGetResult.p95.toFixed(2)}ms`)
  console.log(`  p99: ${scaleGetResult.p99.toFixed(2)}ms`)
  console.log(`  avg: ${scaleGetResult.avg.toFixed(2)}ms\n`)

  // Analysis
  const targetP95 = 50 // Target: <50ms p95
  const meetsTarget = chordDetectResult.p95 < targetP95 && scaleGetResult.p95 < targetP95

  const notes: string[] = []

  if (meetsTarget) {
    notes.push('✅ Raw tonal.js performance meets target (<50ms p95)')
    notes.push('Wrapper overhead should be minimal (<5ms)')
  } else {
    notes.push('⚠️  Raw tonal.js performance exceeds target')
    notes.push('Optimization strategies: memoization, caching, batch operations')
  }

  // Calculate acceptable ranges (baseline + 20% tolerance)
  const chordP95Limit = chordDetectResult.p95 * 1.2
  const scaleP95Limit = scaleGetResult.p95 * 1.2

  notes.push(`Acceptable chord p95 range: <${chordP95Limit.toFixed(2)}ms (baseline + 20%)`)
  notes.push(`Acceptable scale p95 range: <${scaleP95Limit.toFixed(2)}ms (baseline + 20%)`)

  console.log('📋 Analysis:')
  notes.forEach((note) => console.log(`  ${note}`))
  console.log()

  // Build result
  const result: BaselineData = {
    timestamp: new Date().toISOString(),
    system,
    benchmarks: {
      chordDetect: chordDetectResult,
      scaleGet: scaleGetResult,
    },
    analysis: {
      meetsTarget,
      targetP95,
      notes,
    },
  }

  return result
}

/**
 * Save baseline to JSON file
 */
function saveBaseline(data: BaselineData): void {
  const outputDir = path.join(__dirname, '../test/benchmarks')
  const outputPath = path.join(outputDir, 'baseline.json')

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Write JSON
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')

  console.log(`💾 Baseline saved to: ${outputPath}`)
  console.log('\nDone! ✨\n')
}

// Run if executed directly (ESM-safe check)
// Note: In ESM, we check if the file URL matches the main module
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1])
if (isMainModule) {
  try {
    const baseline = measureBaseline()
    saveBaseline(baseline)
  } catch (error) {
    console.error('❌ Error running baseline:', error)
    process.exit(1)
  }
}

export { measureBaseline, saveBaseline }
