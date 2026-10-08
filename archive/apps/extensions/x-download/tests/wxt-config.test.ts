import { describe, expect, it } from 'vitest';

import config from '../wxt.config';

describe('WXT 构建配置', () => {
  it('只从 Popup 源码入口扫描 Vite 依赖', () => {
    const viteFactory = (config as {
      vite?: () => { optimizeDeps?: { entries?: string[] } };
    }).vite;

    expect(viteFactory?.().optimizeDeps?.entries).toEqual([
      'src/entrypoints/popup/index.html',
    ]);
  });

  it('把 Popup Header 图标发布到扩展 icon 目录', () => {
    const files: Array<{ relativeDest?: string }> = [];
    const hooks = (config as {
      hooks?: { 'build:publicAssets'?: (entries: unknown, files: Array<{ relativeDest?: string }>) => void };
    }).hooks;

    hooks?.['build:publicAssets']?.({}, files);

    expect(files).toEqual(expect.arrayContaining([
      expect.objectContaining({ relativeDest: 'icon/folder-down.svg' }),
      expect.objectContaining({ relativeDest: 'icon/trash.svg' }),
    ]));
  });
});
