import { describe, expect, it } from 'vitest';

import { extractMediaSources } from '../src/features/media-source/extract';

function tweetPayload(media: unknown[], postId = '123') {
  return {
    data: {
      tweet: {
        result: {
          rest_id: postId,
          legacy: {
            extended_entities: { media },
          },
        },
      },
    },
  };
}

describe('X 页面视频媒体来源提取', () => {
  it('selects one complete HLS source for each video and ignores photos', () => {
    const sources = extractMediaSources(tweetPayload([
      {
        id_str: 'video-1',
        type: 'video',
        video_info: {
          variants: [
            { content_type: 'video/mp4', bitrate: 256000, url: 'https://video.twimg.com/a-low.mp4' },
            { content_type: 'application/x-mpegURL', url: 'https://video.twimg.com/a.m3u8' },
          ],
        },
      },
      { id_str: 'photo-1', type: 'photo', media_url_https: 'https://pbs.twimg.com/a.jpg' },
    ]), '123');

    expect(sources).toEqual([
      { mediaId: 'video-1', type: 'hls', url: 'https://video.twimg.com/a.m3u8' },
    ]);
  });

  it('prefers DASH over MP4 and then chooses the highest bitrate MP4', () => {
    const sources = extractMediaSources(tweetPayload([
      {
        id_str: 'dash-video',
        type: 'video',
        video_info: {
          variants: [
            { content_type: 'video/mp4', bitrate: 100, url: 'https://video.twimg.com/low.mp4' },
            { content_type: 'application/dash+xml', url: 'https://video.twimg.com/video.mpd' },
            { content_type: 'video/mp4', bitrate: 1000, url: 'https://video.twimg.com/high.mp4' },
          ],
        },
      },
      {
        id_str: 'mp4-video',
        type: 'video',
        video_info: {
          variants: [
            { content_type: 'video/mp4', bitrate: 256000, url: 'https://video.twimg.com/medium.mp4' },
            { content_type: 'video/mp4', bitrate: 1024000, url: 'https://video.twimg.com/high.mp4' },
          ],
        },
      },
    ]), '123');

    expect(sources).toEqual([
      { mediaId: 'dash-video', type: 'dash', url: 'https://video.twimg.com/video.mpd' },
      { mediaId: 'mp4-video', type: 'mp4', url: 'https://video.twimg.com/high.mp4' },
    ]);
  });

  it('rejects blob URLs, image URLs, isolated segments and other hosts', () => {
    const sources = extractMediaSources(tweetPayload([
      {
        id_str: 'invalid-1',
        type: 'video',
        video_info: {
          variants: [
            { content_type: 'video/mp4', url: 'blob:https://x.com/123' },
            { content_type: 'video/mp4', url: 'https://video.twimg.com/chunk.m4s' },
            { content_type: 'video/mp4', url: 'https://pbs.twimg.com/photo.mp4' },
          ],
        },
      },
    ]), '123');

    expect(sources).toEqual([]);
  });

  it('does not collect media from a different or quoted post', () => {
    const sources = extractMediaSources({
      data: {
        timeline: [
          tweetPayload([{
            id_str: 'other-video',
            type: 'video',
            video_info: { variants: [{ content_type: 'video/mp4', url: 'https://video.twimg.com/other.mp4' }] },
          }], '456'),
          {
            rest_id: '123',
            legacy: { extended_entities: { media: [] } },
            quoted_status_result: {
              result: {
                rest_id: 'quoted-1',
                legacy: {
                  extended_entities: {
                    media: [{
                      id_str: 'quoted-video',
                      type: 'video',
                      video_info: { variants: [{ content_type: 'video/mp4', url: 'https://video.twimg.com/quoted.mp4' }] },
                    }],
                  },
                },
              },
            },
          },
        ],
      },
    }, '123');

    expect(sources).toEqual([]);
  });

  it('deduplicates repeated complete variants while preserving media order', () => {
    const sources = extractMediaSources(tweetPayload([
      {
        id_str: 'video-1',
        type: 'video',
        video_info: {
          variants: [
            { content_type: 'video/mp4', bitrate: 1024, url: 'https://video.twimg.com/a.mp4?tag=10' },
            { content_type: 'video/mp4', bitrate: 1024, url: 'https://video.twimg.com/a.mp4?tag=10' },
          ],
        },
      },
      {
        id_str: 'video-2',
        type: 'video',
        video_info: {
          variants: [{ content_type: 'video/mp4', bitrate: 1024, url: 'https://video.twimg.com/b.mp4' }],
        },
      },
    ]), '123');

    expect(sources).toEqual([
      { mediaId: 'video-1', type: 'mp4', url: 'https://video.twimg.com/a.mp4?tag=10' },
      { mediaId: 'video-2', type: 'mp4', url: 'https://video.twimg.com/b.mp4' },
    ]);
  });
});
