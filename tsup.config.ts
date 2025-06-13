import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['api/**/*.ts', 'lib/**/*.ts', 'utils/**/*.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node18',
  clean: true,
  splitting: false,
  dts: false,
  sourcemap: true,
  external: ['openai'],
  esbuildOptions(options) {
    options.alias = {
      '@': './'
    };
  }
});
