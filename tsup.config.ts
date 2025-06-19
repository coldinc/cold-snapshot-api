import { defineConfig } from "tsup";
import { join } from "path";

export default defineConfig({
    entry: ['src/api/**/*.ts', 'src/lib/**/*.ts', 'src/utils/**/*.ts'],
    outDir: "api",
    format: ["esm"],
    target: "node20",
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    shims: false,
    noExternal: ['uri-js', 'tr46', 'punycode'],
    esbuildOptions(options) {
        options.external = options.external || [];
        options.external.push("openai"); // Safely mark as external
    },
    alias: {
        "@": join(__dirname, "./")
    }
});
