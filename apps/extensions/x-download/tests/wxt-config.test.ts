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
});
