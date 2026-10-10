import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { createStableDevelopmentHooks } from '@exts/stable-extension-dev';
import { defineConfig } from 'wxt';

import { createBundleSizeWarningHook } from './scripts/bundle-size.mjs';
import { readProjectVersion } from '../../scripts/version.mjs';

const assetFiles = [
  'modules/newtab/assets/brand/bilibili.svg',
  'modules/newtab/assets/brand/chatgpt.svg',
  'modules/newtab/assets/brand/github.svg',
  'modules/newtab/assets/brand/gmail.svg',
  'modules/newtab/assets/brand/linear.svg',
  'modules/newtab/assets/brand/namecheap.svg',
  'modules/newtab/assets/brand/notion.svg',
  'modules/newtab/assets/brand/text-chsi.svg',
  'modules/newtab/assets/brand/text-ielts.svg',
  'modules/newtab/assets/brand/text-jlpt.svg',
  'modules/newtab/assets/brand/text-pmi.svg',
  'modules/newtab/assets/brand/vercel.svg',
  'modules/newtab/assets/brand/x.svg',
  'modules/newtab/assets/brand/youtube.svg',
  'assets/fonts/OFL.txt',
  'assets/fonts/SOURCE.md',
  'assets/logo/exts-128.png',
  'assets/logo/exts-16.png',
  'assets/logo/exts-32.png',
  'assets/logo/exts-48.png',
  'modules/newtab/assets/tools/antd.svg',
  'modules/newtab/assets/tools/element-plus.svg',
  'modules/newtab/assets/tools/element-ui.svg',
  'modules/newtab/assets/tools/google-translate.png',
  'modules/newtab/assets/tools/iconfont.svg',
  'modules/newtab/assets/tools/lucide.svg',
] as const;

const outputAssetPaths = assetFiles.map((file) => `/src/${file}`);
const assetCopies = assetFiles.map((file) => ({
  absoluteSrc: resolve('src', file),
  relativeDest: `src/${file}`,
}));

const actionIcons = {
  16: '/src/assets/logo/exts-16.png',
  32: '/src/assets/logo/exts-32.png',
  48: '/src/assets/logo/exts-48.png',
  128: '/src/assets/logo/exts-128.png',
};

const applicationDirectory = fileURLToPath(new URL('.', import.meta.url));
const stableDevelopmentHooks = createStableDevelopmentHooks({
  targetDir: resolve(applicationDirectory, '../../dist/dev/chrome-mv3-dev-stable'),
});
const bundleSizeWarningHook = createBundleSizeWarningHook();

export default defineConfig({
  srcDir: 'src',
  outDir: resolve(applicationDirectory, '../../dist/.cache/extension'),
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
    'config:resolved': (wxt) => {
      // 开发临时目录集中在根缓存；正式构建保留 WXT 浏览器目录名。
      if (wxt.config.command === 'serve') return;
      const outputName = basename(wxt.config.outDir);
      // 基础目录只含扩展缓存，避免 WXT clean 清理其他应用的产物。
      wxt.config.outDir = resolve(applicationDirectory, '../../dist/build', outputName);
    },
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
    name: 'Exts',
    version: readProjectVersion(),
    description: '我的标签页，保存和组织我喜爱的网站。',
    permissions: ['tabGroups'],
    icons: actionIcons,
    action: {
      default_icon: actionIcons,
      default_title: 'Exts',
    },
  },
});
