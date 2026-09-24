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
  vite: () => ({
    // 只扫描源码入口，避免 WXT 重建时清空临时产物导致入口消失。
    optimizeDeps: {
      entries: ['src/entrypoints/popup/index.html'],
    },
  }),
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
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvqSR8wl23oG3G2quX/RuxIQSLvlOHXEIzz4WRy911X38imQIk9OX/KY6HuWLBnbWYB5AQCBTH0WLHt8AbkflBD7CPuj/A4rjMz+lzvbg7IJvMIPxFsY90pVDj3yB0b/UJxnRjR0ucl1ieM/PVMYoi1og5w1zGAtC+5jqfcqhNiRgN6M6tRcdd3w0ex+RAZ9WTmWArgmd5IxpEGyECInkNxf9EULHdBhSfDc9OjnNJSuEgqPqN48DX36pa1eppa6eMPKSHgTnZ10hUG6xzucChAK3Z75/LcTBe5d4/C7D5iXsM/AmKLCZLybTDTvK6udaQj40HUEgchd+IEaxQBIV9QIDAQAB',
    permissions: ['activeTab', 'nativeMessaging'],
    icons: actionIconPaths,
    action: {
      default_icon: actionIconPaths,
      default_title: 'X Download',
    },
  },
});
