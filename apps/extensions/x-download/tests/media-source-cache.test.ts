import { describe, expect, it } from 'vitest';

import { MediaSourceCache } from '../src/features/media-source/cache';

const source = { mediaId: 'video-1', type: 'mp4' as const, url: 'https://video.twimg.com/video.mp4' };

describe('X 页面媒体来源缓存', () => {
  it('returns only the current post sources and clears them after SPA navigation', async () => {
    let currentURL = 'https://x.com/user/status/123';
    const cache = new MediaSourceCache(() => currentURL);

    cache.accept({
      source: 'x-download-page-media',
      type: 'media-source.captured',
      postId: '123',
      mediaSources: [source],
    });
    expect(await cache.get('123', 0)).toEqual([source]);

    currentURL = 'https://x.com/user/status/456';
    cache.syncLocation();
    expect(await cache.get('456', 0)).toEqual([]);

    cache.accept({
      source: 'x-download-page-media',
      type: 'media-source.captured',
      postId: '123',
      mediaSources: [source],
    });
    expect(await cache.get('456', 0)).toEqual([]);
  });

  it('waits for a current-post source until the timeout', async () => {
    const cache = new MediaSourceCache(() => 'https://x.com/user/status/123');
    const result = await cache.get('123', 5);
    expect(result).toEqual([]);
  });
});
