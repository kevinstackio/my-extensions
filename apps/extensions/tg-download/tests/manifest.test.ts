import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import config from '../wxt.config';
import downloadEntrypoint from '../src/entrypoints/download.content';
import themeEntrypoint from '../src/entrypoints/theme.content';
import tasksEntrypoint from '../src/entrypoints/tasks.content';

const sizes = [16, 32, 48, 128] as const;

describe('WXT 扩展清单', () => {
  it('只从 Popup 源码入口扫描 Vite 依赖', () => {
    const viteFactory = (config as {
      vite?: () => { optimizeDeps?: { entries?: string[] } };
    }).vite;

    expect(viteFactory?.().optimizeDeps?.entries).toEqual([
      'src/entrypoints/popup/index.html',
    ]);
  });

  it('声明固定品牌图标和 Telegram Web 资源访问范围', () => {
    const manifest = config.manifest as Record<string, unknown>;
    const icons = manifest.icons as Record<number, string>;
    const action = manifest.action as Record<string, unknown>;
    const accessible = manifest.web_accessible_resources as Array<Record<string, unknown>>;
    const permissions = manifest.permissions as string[];

    expect(icons).toEqual({
      16: '/icon/tg-download-16.png',
      32: '/icon/tg-download-32.png',
      48: '/icon/tg-download-48.png',
      128: '/icon/tg-download-128.png',
    });
    expect(action.default_icon).toEqual(icons);
    expect(permissions).toContain('downloads');
    expect(permissions).toContain('storage');
    expect(accessible).toEqual([{
      matches: ['https://web.telegram.org/*'],
      resources: ['/icon/*.svg'],
    }]);
  });

  it('把源码资源映射到扩展输出的 icon 目录', () => {
    const hooks = config.hooks as Record<string, (wxt: unknown, value: unknown[]) => void>;
    const paths: unknown[] = [];
    const files: unknown[] = [];

    hooks['prepare:publicPaths']?.({}, paths);
    hooks['build:publicAssets']?.({}, files);

    expect(paths).toEqual(expect.arrayContaining([
      '/icon/tg-download-16.png',
      '/icon/tg-download-128.png',
      '/icon/download.svg',
      '/icon/loader.svg',
    ]));
    expect(files).toEqual(expect.arrayContaining([
      expect.objectContaining({ relativeDest: 'icon/tg-download-16.png' }),
      expect.objectContaining({ relativeDest: 'icon/tg-download-128.png' }),
      expect.objectContaining({ relativeDest: 'icon/download.svg' }),
      expect.objectContaining({ relativeDest: 'icon/loader.svg' }),
    ]));
  });

  it('两个内容脚本声明正确的执行世界和时机', () => {
    expect(themeEntrypoint).toMatchObject({
      matches: ['https://web.telegram.org/*'],
      runAt: 'document_start',
    });
    expect(downloadEntrypoint).toMatchObject({
      matches: ['https://web.telegram.org/*'],
      runAt: 'document_idle',
      world: 'MAIN',
    });
    expect(tasksEntrypoint).toMatchObject({
      matches: ['https://web.telegram.org/*'],
      runAt: 'document_idle',
    });
    expect(tasksEntrypoint).not.toHaveProperty('world', 'MAIN');
  });

  it('固定品牌图标的 PNG 尺寸正确', async () => {
    for (const size of sizes) {
      const icon = await readFile(
        new URL('../src/assets/logo/tg-download-' + size + '.png', import.meta.url),
      );

      expect(icon.readUInt32BE(16)).toBe(size);
      expect(icon.readUInt32BE(20)).toBe(size);
    }
  });

  it('按钮状态和 Popup SVG 位于源码资源目录并映射到输出', async () => {
    const hooks = config.hooks as Record<string, (wxt: unknown, value: unknown[]) => void>;
    const files: unknown[] = [];
    hooks['build:publicAssets']?.({}, files);

    for (const name of ['download', 'loader', 'folder-down', 'trash']) {
      const svg = await readFile(
        new URL('../src/assets/icons/' + name + '.svg', import.meta.url),
        'utf8',
      );

      expect(svg).toContain('<svg');
      expect(files).toEqual(expect.arrayContaining([
        expect.objectContaining({
          absoluteSrc: expect.stringContaining(`${name}.svg`),
          relativeDest: `icon/${name}.svg`,
        }),
      ]));
    }
  });
});
