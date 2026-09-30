import { resolve } from 'node:path';

import { createStableDevelopmentHooks } from '@omyexts/stable-extension-dev';
import { defineConfig } from 'wxt';

const logoFiles = [
  'omydl-16.png',
  'omydl-32.png',
  'omydl-48.png',
  'omydl-128.png',
  'omydl-light-16.png',
  'omydl-light-32.png',
  'omydl-light-48.png',
  'omydl-light-128.png',
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
    artifactTemplate: 'omydl-{{packageVersion}}-chromium.zip',
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
    name: 'OmyDL',
    description: '在 Telegram Web 中右键保存图片和视频。',
    icons: {
      16: '/icon/omydl-16.png',
      32: '/icon/omydl-32.png',
      48: '/icon/omydl-48.png',
      128: '/icon/omydl-128.png',
    },
    action: {
      default_icon: {
        16: '/icon/omydl-16.png',
        32: '/icon/omydl-32.png',
        48: '/icon/omydl-48.png',
        128: '/icon/omydl-128.png',
      },
      default_title: 'OmyDL',
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
