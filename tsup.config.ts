import { defineConfig } from 'tsup'
import { join } from 'path'

export default defineConfig({
  entry: ['api/**/*.ts', 'lib/**/*.ts', 'utils/**/*.ts'],
  outDir: 'api',
  format: ['esm'],
  target: 'node18',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  shims: false,
  esbuildOptions(options) {
    options.external = options.external || []
    options.external.push('openai') // Safely mark as external
  },
  alias: {
    '@': join(__dirname, './')
  }
})
