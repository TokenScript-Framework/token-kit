import { defineConfig } from "tsup";

export default defineConfig({
  splitting: false,
  entry: ["src/index.ts"],
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  treeshake: true,
  minify: true,
  dts: true,
});
