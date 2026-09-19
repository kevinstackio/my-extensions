import { resolve } from 'node:path';

import { createStableDevelopmentHooks } from '@my-extensions/stable-extension-dev';
import { defineConfig } from 'wxt';

const logoFiles = [
  'x-download-16.png',
  'x-download-32.png',
  'x-download-48.png',
  'x-download-128.png',
  'x-download-light-16.png',
  'x-download-light-32.png',
  'x-download-light-48.png',
  'x-download-light-128.png',
] as const;

const actionIconPaths = {
  16: '/icon/x-download-16.png',
  32: '/icon/x-download-32.png',
  48: '/icon/x-download-48.png',
  128: '/icon/x-download-128.png',
};

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  hooks: {
    ...createStableDevelopmentHooks(),
    'prepare:publicPaths': (_, paths) => {
      paths.push(...logoFiles.map(filename => `/icon/${filename}`));
    },
    'build:publicAssets': (_, files) => {
      files.push(...logoFiles.map(filename => ({
        absoluteSrc: resolve('src/assets/logo', filename),
        relativeDest: `icon/${filename}`,
      })));
    },
  },
  manifest: {
    name: 'X Download',
    version: '1.0.0',
    description: '识别当前打开的 X 单篇帖子地址。',
    permissions: ['activeTab'],
    icons: actionIconPaths,
    action: {
      default_icon: actionIconPaths,
      default_title: 'X Download',
    },
  },
});
