import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { readProjectVersion } from '../../scripts/version.mjs';

readProjectVersion();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  cacheDir: '../../dist/.cache/website/vite',
  build: {
    outDir: '../../dist/build/exts-web',
    emptyOutDir: true,
  },
});
