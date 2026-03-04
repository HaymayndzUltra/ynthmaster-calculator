import { build } from 'esbuild';

await build({
  entryPoints: ['electron/main.ts', 'electron/preload.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist-electron',
  external: ['electron'],
  format: 'cjs',
  sourcemap: true,
});

console.log('[build-electron] Compiled main.ts + preload.ts → dist-electron/');
