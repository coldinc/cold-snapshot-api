import { defineConfig } from "tsup";

export default defineConfig({
  entry: ['src/api/**/*.ts'],
  outDir: '.vercel/output/functions',
  clean: true,
  format: ['esm'],
  target: 'node20',
  shims: false,
  esbuildOptions(opts) {
    opts.outbase = 'src'; // keep the 'api/' segment in output paths
  },
});
