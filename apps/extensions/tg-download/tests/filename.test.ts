import { describe, expect, it } from 'vitest';

import { createDownloadFilename } from '../src/features/download/filename';

describe('下载文件名', () => {
  it('按媒体类型生成固定宽度时间戳文件名', () => {
    const now = new Date(2026, 8, 10, 14, 23, 45);

    expect(createDownloadFilename('IMG', now)).toBe('TG_IMG_20260910_142345.jpg');
    expect(createDownloadFilename('VIDEO', now)).toBe('TG_VIDEO_20260910_142345.mp4');
  });
});
