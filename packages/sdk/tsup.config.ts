import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false, // Keep readable for debugging
  outDir: 'dist',
  external: [
    '@music-reasoning/types', // Workspace dependencies
    '@music-reasoning/core',
  ],
})
