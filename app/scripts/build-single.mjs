/*
 * Builds fort-kit.html: the whole app inlined into one file that runs by
 * double-clicking it, with no Node, no npm and no server. Run: npm run build:single
 */
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist-single');

await build({
  root,
  plugins: [react()],
  base: './',
  logLevel: 'warn',
  build: {
    outDir,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 4000,
    // One classic script, so the file runs from file:// where module scripts are blocked
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: 'app.[ext]' } },
  },
});

let html = readFileSync(join(outDir, 'index.html'), 'utf8');
const js = readFileSync(join(outDir, 'app.js'), 'utf8');
let css = '';
try { css = readFileSync(join(outDir, 'app.css'), 'utf8'); } catch { /* no css emitted */ }

html = html
  // Drop the PWA bits: they need a real server and 404 from a plain file
  .replace(/\s*<link rel="icon"[^>]*>/, '')
  .replace(/\s*<link rel="manifest"[^>]*>/, '')
  .replace(/\s*<link rel="stylesheet" crossorigin href="[^"]*app\.css">/, () => `\n    <style>\n${css}\n    </style>`)
  // Vite hoists the bundle into <head>; as a classic script it must run after #root exists
  .replace(/\s*<script[^>]*src="[^"]*app\.js"[^>]*><\/script>/, '')
  .replace('</body>', () => `  <script>\n${js}\n  </script>\n  </body>`);

if (html.includes('app.js')) throw new Error('the bundle was not inlined — check the output file names');

writeFileSync(join(root, 'fort-kit.html'), html);
rmSync(outDir, { recursive: true, force: true });
console.log(`fort-kit.html written (${(html.length / 1024 / 1024).toFixed(1)} MB)`);
