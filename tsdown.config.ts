import { defineConfig } from 'tsdown'

export default defineConfig({
  workspace: true,
  exports: true,
  minify: true,
  dts: true,
  outDir: "dist",
})
