import { defineConfig } from 'tsdown'

export default defineConfig({
  workspace: true,
  exports: true,
  sourcemap: false,
  minify: true,
  dts: true,
  outDir: "dist"
})
