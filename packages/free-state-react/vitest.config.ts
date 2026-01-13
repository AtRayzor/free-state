import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import tsConfigPaths from "vite-tsconfig-paths";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    browser: {
      enabled: true,
      headless: false,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    root: resolve(__dirname),
  },
  server: {
    fs: { allow: [resolve(__dirname, "..", "..")] },
  },
  plugins: [tsConfigPaths()],
  build: {
    sourcemap: true,
  },
});
