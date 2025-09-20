import { defineConfig } from "tsup";

export default defineConfig({
  // Four build entry points: the public API, worker core, and two worker files
  entry: ["src/index.ts", "src/worker-core.ts", "src/run-with-piscina.worker.ts", "src/run-with-piscina.worker.cjs.ts"],
  // Emit CommonJS and ESModule builds
  format: ["cjs", "esm"],
  // Generate declaration files alongside the builds
  dts: true,
  // Node-specific build target
  target: "node20",
  // Place compiled output in the "dist" directory
  outDir: "dist",
  // Clean the output directory before each build
  clean: true,
  // Disable code-splitting so each entry produces a single file
  splitting: false,
  // Fill in some code when building esm/cjs to make it work, such as __dirname
  shims: true,
  // External packages that should not be bundled
  external: ["@nestjs/common", "@nestjs/core", "piscina", "reflect-metadata"],
});
