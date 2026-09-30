import { resolve } from 'node:path';

import { createStableDevelopmentHooks } from '@omyexts/stable-extension-dev';
import { defineConfig } from 'wxt';

const logoFiles = [
  'ohmy-dl-16.png',
  'ohmy-dl-32.png',
  'ohmy-dl-48.png',
  'ohmy-dl-128.png',
  'ohmy-dl-light-16.png',
  'ohmy-dl-light-32.png',
  'ohmy-dl-light-48.png',
  'ohmy-dl-light-128.png',
] as const;

const menuIconFiles = ['download.svg', 'loader.svg', 'folder-down.svg', 'trash.svg'] as const;

const outputIconPaths = [
  ...logoFiles.map(filename => `/icon/${filename}`),
  ...menuIconFiles.map(filename => `/icon/${filename}`),
];

const assetCopies = [
  ...logoFiles.map(filename => ({
    absoluteSrc: resolve('src/assets/logo', filename),
    relativeDest: `icon/${filename}`,
  })),
  ...menuIconFiles.map(filename => ({
    absoluteSrc: resolve('src/assets/icons', filename),
    relativeDest: `icon/${filename}`,
  })),
];

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  vite: () => ({
    // 只扫描源码入口，避免 WXT 重建时清空临时产物导致入口消失。
    optimizeDeps: {
      entries: ['src/entrypoints/popup/index.html'],
    },
  }),
  zip: {
    artifactTemplate: 'ohmy-dl-{{packageVersion}}-chromium.zip',
  },
  hooks: {
    ...createStableDevelopmentHooks(),
    'prepare:publicPaths': (_, paths) => {
      paths.push(...outputIconPaths);
    },
    'build:publicAssets': (_, files) => {
      files.push(...assetCopies);
    },
  },
  manifest: {
    name: 'Oh My DL',
    description: '在 Telegram Web 中右键保存图片和视频。',
    icons: {
      16: '/icon/ohmy-dl-16.png',
      32: '/icon/ohmy-dl-32.png',
      48: '/icon/ohmy-dl-48.png',
      128: '/icon/ohmy-dl-128.png',
    },
    action: {
      default_icon: {
        16: '/icon/ohmy-dl-16.png',
        32: '/icon/ohmy-dl-32.png',
        48: '/icon/ohmy-dl-48.png',
        128: '/icon/ohmy-dl-128.png',
      },
      default_title: 'Oh My DL',
    },
    permissions: ['downloads', 'storage'],
    web_accessible_resources: [
      {
        matches: ['https://web.telegram.org/*'],
        resources: ['/icon/*.svg'],
      },
    ],
  },
});
