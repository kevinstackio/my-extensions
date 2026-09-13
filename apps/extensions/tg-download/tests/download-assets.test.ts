import { describe, expect, it, vi } from 'vitest';

import { installDownloadAssetStyles } from '../src/features/download-assets';

describe('下载按钮资源样式', () => {
  it('使用扩展运行时 URL 注入外部 SVG 资源', () => {
    const style = { id: '', textContent: '' } as HTMLStyleElement;
    const head = { append: vi.fn() };
    const document = {
      createElement: vi.fn(() => style),
      documentElement: head,
      getElementById: vi.fn(() => null),
      head,
    } as unknown as Document;

    installDownloadAssetStyles(document, path => `chrome-extension://test${path}`);

    expect(style.id).toBe('tg-download-asset-styles');
    expect(style.textContent).toContain(
      'chrome-extension://test/icon/download.svg',
    );
    expect(style.textContent).toContain(
      'chrome-extension://test/icon/loader.svg',
    );
    expect(style.textContent).not.toContain('data:image/svg+xml');
    expect(head.append).toHaveBeenCalledWith(style);
  });
});
