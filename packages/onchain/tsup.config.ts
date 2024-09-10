import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  // this will caused esm module import json issue
  // external: ["./tokens.json"],
  shims: true,
  minify: true,
  treeshake: true,
});
