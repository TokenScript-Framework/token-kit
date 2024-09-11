import { defineConfig } from "tsup";

export default defineConfig({
  outDir: ".",
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: false,
  format: ["cjs"],
  minify: true,
});
