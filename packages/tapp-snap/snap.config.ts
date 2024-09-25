import type { SnapConfig } from "@metamask/snaps-cli";
import { resolve } from "path";
import * as dotenv from "dotenv";
dotenv.config();

const config: SnapConfig = {
  bundler: "webpack",
  input: resolve(__dirname, "src/index.tsx"),
  server: {
    port: 8080,
  },
  polyfills: true,
  environment: {
    VIEWER_ROOT: process.env.VIEWER_ROOT,
    COMMON_API_ROOT: process.env.COMMON_API_ROOT,
    API_KEY: process.env.API_KEY,
  },
};

export default config;
