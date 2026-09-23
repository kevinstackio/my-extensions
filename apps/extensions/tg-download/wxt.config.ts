import { resolve } from 'node:path';

import { createStableDevelopmentHooks } from '@my-extensions/stable-extension-dev';
import { defineConfig } from 'wxt';

const logoFiles = [
  'tg-download-16.png',
  'tg-download-32.png',
  'tg-download-48.png',
  'tg-download-128.png',
  'tg-download-light-16.png',
  'tg-download-light-32.png',
  'tg-download-light-48.png',
  'tg-download-light-128.png',
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
    name: 'TG Download',
    version: '1.0.0',
    description: '在 Telegram Web 中右键保存图片和视频。',
    icons: {
      16: '/icon/tg-download-16.png',
      32: '/icon/tg-download-32.png',
      48: '/icon/tg-download-48.png',
      128: '/icon/tg-download-128.png',
    },
    action: {
      default_icon: {
        16: '/icon/tg-download-16.png',
        32: '/icon/tg-download-32.png',
        48: '/icon/tg-download-48.png',
        128: '/icon/tg-download-128.png',
      },
      default_title: 'TG Download',
    },
    permissions: ['downloads'],
    web_accessible_resources: [
      {
        matches: ['https://web.telegram.org/*'],
        resources: ['/icon/*.svg'],
      },
    ],
  },
});
