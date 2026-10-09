import { test } from 'vitest';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import wxtConfig from '../../wxt.config.ts';

// 配置行为与发布资源完整性，不依赖浏览器布局或源码写法。
test('统一扩展保留标签组权限并提供完整图标', async () => {
  assert.equal(wxtConfig.manifest.name, 'Exts');
  assert.equal(wxtConfig.manifest.action.default_title, 'Exts');
  assert.deepEqual(wxtConfig.manifest.permissions, ['tabGroups']);
  for (const size of [16, 32, 48, 128]) {
    const icon = wxtConfig.manifest.icons[size];
    assert.equal(icon, `/src/assets/logo/exts-${size}.png`);
    await access(new URL(`../..${icon}`, import.meta.url));
  }
});

test('构建配置扫描源码入口并声明全部实际发布资源', async () => {
  const vite = await wxtConfig.vite();
  assert.deepEqual(vite.optimizeDeps.entries, ['src/entrypoints/newtab/index.html']);
  const files = [];
  wxtConfig.hooks['build:publicAssets'](undefined, files);
  for (const file of files) await access(file.absoluteSrc);
  assert(files.some(file => file.relativeDest === 'src/modules/newtab/assets/brand/github.svg'));
});
