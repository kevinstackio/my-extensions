import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { readProjectVersion } from '../../scripts/version.mjs';

const version = readProjectVersion();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { __EXTS_VERSION__: JSON.stringify(version) },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  cacheDir: '../../dist/.cache/website/vite',
  build: {
    outDir: '../../dist/build/exts-web',
    emptyOutDir: true,
  },
});
