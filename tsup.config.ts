import { defineConfig } from "tsup";

export default defineConfig({
  entry: ['src/api/**/*.ts'],
  outDir: 'api',
  clean: true,
  format: ['esm'],
  target: 'node20',
  shims: false,
  esbuildOptions(opts) {
    opts.outbase = 'src/api';
  },
});
