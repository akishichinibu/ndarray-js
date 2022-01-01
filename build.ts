import { build } from 'esbuild';
import wasmLoader from 'esbuild-plugin-wasm';

build({
  entryPoints: [
    "./src/core.ts",
  ],
  outdir: "build",
  plugins: [
    wasmLoader()
  ],
});
