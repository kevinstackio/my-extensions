import { test } from 'vitest';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import wxtConfig from '../../wxt.config.ts';
import { readProjectVersion } from '../../../../scripts/version.mjs';

// 配置行为与发布资源完整性，不依赖浏览器布局或源码写法。
test('统一扩展保留标签组权限并提供完整图标', async () => {
  assert.equal(wxtConfig.manifest.name, 'Exts');
  assert.equal(wxtConfig.manifest.version, readProjectVersion());
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
  for (const icon of ['npm', 'simpleicons']) {
    assert(files.some(file => file.relativeDest === `src/modules/newtab/assets/brand/${icon}.svg`));
  }
});

test('临时目录集中到根缓存且生产输出独立于网站目录', () => {
  const cacheDirectory = fileURLToPath(new URL('../../../../dist/.cache/extension', import.meta.url));
  assert.equal(wxtConfig.outDir, cacheDirectory);
  const wxt = { config: { command: 'build', outBaseDir: cacheDirectory, outDir: join(cacheDirectory, 'chrome-mv3') } };
  wxtConfig.hooks['config:resolved'](wxt);
  assert.equal(wxt.config.outDir, fileURLToPath(new URL('../../../../dist/build/chrome-mv3', import.meta.url)));
  assert.equal(wxt.config.outBaseDir, cacheDirectory);
});
