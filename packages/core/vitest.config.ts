import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Skip performance benchmarks in CI due to extreme variance across runners
    // Benchmarks are validated locally and in dedicated benchmark runs
    exclude: process.env.CI
      ? ['test/benchmarks/**', '**/node_modules/**', '**/dist/**']
      : ['**/node_modules/**', '**/dist/**'],
    coverage: {
      include: ['src/**'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
      perFile: true,
    },
  },
})
