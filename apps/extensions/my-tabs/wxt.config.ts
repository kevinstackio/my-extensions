import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { createStableDevelopmentHooks } from '@my-extensions/stable-extension-dev';
import { defineConfig } from 'wxt';

import { createBundleSizeWarningHook } from './scripts/bundle-size.mjs';

const assetFiles = [
  'brand/bilibili.svg',
  'brand/chatgpt.svg',
  'brand/github.svg',
  'brand/gmail.svg',
  'brand/linear.svg',
  'brand/namecheap.svg',
  'brand/notion.svg',
  'brand/text-chsi.svg',
  'brand/text-ielts.svg',
  'brand/text-jlpt.svg',
  'brand/text-pmi.svg',
  'brand/vercel.svg',
  'brand/x.svg',
  'brand/youtube.svg',
  'fonts/OFL.txt',
  'fonts/SOURCE.md',
  'logo/my-tabs-dark-128.png',
  'logo/my-tabs-dark-16.png',
  'logo/my-tabs-dark-32.png',
  'logo/my-tabs-dark-48.png',
  'logo/my-tabs-light-128.png',
  'logo/my-tabs-light-16.png',
  'logo/my-tabs-light-32.png',
  'logo/my-tabs-light-48.png',
  'tools/antd.svg',
  'tools/element-plus.svg',
  'tools/element-ui.svg',
  'tools/google-translate.png',
  'tools/iconfont.svg',
  'tools/lucide.svg',
] as const;

const outputAssetPaths = assetFiles.map((file) => `/src/assets/${file}`);
const assetCopies = assetFiles.map((file) => ({
  absoluteSrc: resolve('src/assets', file),
  relativeDest: `src/assets/${file}`,
}));

const actionIcons = {
  16: '/src/assets/logo/my-tabs-dark-16.png',
  32: '/src/assets/logo/my-tabs-dark-32.png',
  48: '/src/assets/logo/my-tabs-dark-48.png',
  128: '/src/assets/logo/my-tabs-dark-128.png',
};

const stableDevelopmentHooks = createStableDevelopmentHooks();
const bundleSizeWarningHook = createBundleSizeWarningHook();

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
    // 只扫描源码入口，避免 WXT 重建临时目录时与 Vite 的 HTML 扫描发生竞态。
    optimizeDeps: {
      entries: ['src/entrypoints/newtab/index.html'],
    },
  }),
  hooks: {
    ...stableDevelopmentHooks,
    // 稳定目录发布成功后再测量开发产物，预警失败不能阻断 WXT dev 的持续重建。
    'build:done': async (wxt, output) => {
      await stableDevelopmentHooks['build:done'](wxt, output);
      await bundleSizeWarningHook(wxt, output);
    },
    'prepare:publicPaths': (_, paths) => {
      paths.push(...outputAssetPaths);
    },
    'build:publicAssets': (_, files) => {
      files.push(...assetCopies);
    },
  },
  manifest: {
    name: 'My Tabs',
    version: '1.0.0',
    description: '我的标签页，保存和组织我喜爱的网站。',
    permissions: ['tabGroups'],
    icons: actionIcons,
    action: {
      default_icon: actionIcons,
      default_title: 'My Tabs',
    },
  },
});
