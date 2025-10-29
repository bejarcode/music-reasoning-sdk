import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Integration tests may need time to load the 2.2GB model
    testTimeout: 120000, // 2 minutes for model loading
    hookTimeout: 30000, // 30 seconds for setup/teardown
    globals: true,

    // Environment
    environment: 'node',

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: ['dist/**', '**/*.test.ts', '**/*.config.ts', 'examples/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      perFile: true,
    },

    // Test organization
    include: ['tests/**/*.test.ts'],
  },
})
