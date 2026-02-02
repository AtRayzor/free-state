import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { playwright } from "@vitest/browser-playwright";
import { resolve } from "node:path";
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
    include: ["**/*.test.ts", "**/*.test.tsx"],
    root: resolve(__dirname),
  },
  plugins: [tsConfigPaths()],
  build: {
    sourcemap: true,
  },
});
