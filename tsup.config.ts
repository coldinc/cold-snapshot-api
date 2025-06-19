import { defineConfig } from "tsup";

export default defineConfig({
  entry: ['src/api/**/*.ts'],
  outDir: '.vercel/output/functions',
  clean: true,
  format: ['cjs'],
  target: 'node20',
  outbase: 'src',
  shims: false,
  });
