import { describe, expect, it } from 'vitest';

import {
  canOpenDownloadMenu,
  findMediaAt,
  isPreviewMedia,
} from '../src/features/download/media-target';

describe('Telegram 预览媒体定位', () => {
  it('返回指针命中的预览媒体', () => {
    const preview = {};
    const media = {
      closest: (selector: string) => selector === 'img,video' ? media : preview,
      getBoundingClientRect: () => ({ left: 10, top: 10, right: 210, bottom: 210 }),
    };
    const document = {
      elementFromPoint: () => media,
    };

    expect(findMediaAt(
      document as unknown as Document,
      media as unknown as EventTarget,
      100,
      100,
    )).toBe(media);
  });

  it('指针未命中媒体时返回空值', () => {
    const target = { closest: () => null };
    const document = { elementFromPoint: () => null };

    expect(findMediaAt(
      document as unknown as Document,
      target as unknown as EventTarget,
      100,
      100,
    )).toBeUndefined();
  });

  it('只把放大预览层中的媒体标记为可下载目标', () => {
    expect(isPreviewMedia({ closest: selector => selector === '.media-viewer-mover' ? {} : null })).toBe(true);
    expect(isPreviewMedia({ closest: () => null })).toBe(false);
  });

  it('下载中或非预览媒体不允许打开下载菜单', () => {
    const previewMedia = { closest: () => ({}) };
    const pageMedia = { closest: () => null };

    expect(canOpenDownloadMenu(false, previewMedia)).toBe(true);
    expect(canOpenDownloadMenu(true, previewMedia)).toBe(false);
    expect(canOpenDownloadMenu(false, pageMedia)).toBe(false);
  });
});
