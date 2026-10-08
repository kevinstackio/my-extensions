import { describe, expect, it } from 'vitest';

import { extractMediaSources } from '../src/features/media-source/extract';
import { parseMediaCaptureEvent } from '../src/features/media-source/bridge-message';
import {
  observeXHRPayload,
  readXHRBody,
  wrapFetch,
  type MediaCaptureEvent,
} from '../src/features/media-source/page-observer';

const payload = {
  data: {
    tweet: {
      result: {
        rest_id: '123',
        legacy: {
          extended_entities: {
            media: [{
              id_str: 'video-1',
              type: 'video',
              video_info: { variants: [{
                content_type: 'video/mp4',
                url: 'https://video.twimg.com/video.mp4',
              }] },
            }],
          },
        },
      },
    },
  },
};

describe('X 页面媒体响应观察器', () => {
  it('keeps the original fetch response readable while observing its clone', async () => {
    const events: MediaCaptureEvent[] = [];
    const originalFetch: typeof fetch = async () => new Response(JSON.stringify(payload), {
      headers: { 'content-type': 'application/json' },
    });
    const observedFetch = wrapFetch(originalFetch, () => '123', event => events.push(event));

    const response = await observedFetch('https://x.com/i/api/graphql/example');
    expect(await response.json()).toEqual(payload);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(events).toEqual([{
      source: 'x-download-page-media',
      type: 'media-source.captured',
      postId: '123',
      mediaSources: extractMediaSources(payload, '123'),
    }]);
  });

  it('ignores non-X API responses and unreadable XHR response bodies', () => {
    const events: MediaCaptureEvent[] = [];
    observeXHRPayload('https://video.twimg.com/video.mp4', 'text', JSON.stringify(payload), '123', event => events.push(event));
    observeXHRPayload('https://x.com/i/api/graphql/example', 'arraybuffer', payload, '123', event => events.push(event));
    observeXHRPayload('https://x.com/i/api/graphql/example', 'json', payload, '123', event => events.push(event));

    expect(events).toEqual([{
      source: 'x-download-page-media',
      type: 'media-source.captured',
      postId: '123',
      mediaSources: extractMediaSources(payload, '123'),
    }]);
  });

  it('does not read responseText for binary XHR response types', () => {
    expect(readXHRBody('arraybuffer', { json: true }, () => {
      throw new Error('不应读取二进制 responseText');
    })).toBeUndefined();
    expect(readXHRBody('text', undefined, () => 'payload')).toBe('payload');
    expect(readXHRBody('json', { json: true }, () => 'ignored')).toEqual({ json: true });
  });

  it('rejects spoofed page messages and duplicate media IDs at the isolated bridge', () => {
    const valid = {
      source: 'x-download-page-media',
      type: 'media-source.captured',
      postId: '123',
      mediaSources: [{ mediaId: 'video-1', type: 'mp4', url: 'https://video.twimg.com/video.mp4' }],
    } as const;
    expect(parseMediaCaptureEvent(valid, '456')).toBeNull();
    expect(parseMediaCaptureEvent({
      ...valid,
      mediaSources: [...valid.mediaSources, ...valid.mediaSources],
    }, '123')).toBeNull();
    expect(parseMediaCaptureEvent({
      ...valid,
      mediaSources: [{ mediaId: 'video-1', type: 'mp4', url: 'https://example.com/video.mp4' }],
    }, '123')).toBeNull();
  });
});
