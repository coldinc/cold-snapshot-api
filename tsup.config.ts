import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['api/**/*.ts', 'lib/**/*.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node18',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: false,
  esbuildOptions(options) {
    options.external = ['openai'] // Mark external to avoid bundling errors
  },
  alias: {
    '@': '.'
  }
})
