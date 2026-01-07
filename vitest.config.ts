import { defineConfig } from "vitest/config";
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
  },
  plugins: [tsConfigPaths()],
  build: {
    sourcemap: true,
  }
});
