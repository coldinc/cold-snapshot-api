import { defineConfig } from "tsup";

export default defineConfig({
  entry: ['src/api/**/*.ts'],
  outDir: '.vercel/output/functions',
  clean: true,
  format: ['esm'],
  target: 'node20',
  outbase: 'src',
  shims: false,
  });
