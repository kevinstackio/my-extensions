import { describe, expect, it } from 'vitest';

import { parseXPostUrl } from '../src/features/post-url';

describe('parseXPostUrl', () => {
  it('recognizes a specific X post URL', () => {
    expect(parseXPostUrl('https://x.com/OpenAI/status/1960000000000000000')).toEqual({
      postId: '1960000000000000000',
      url: 'https://x.com/OpenAI/status/1960000000000000000',
    });
  });

  it('normalizes the www host, media suffix, query, and hash', () => {
    expect(parseXPostUrl(
      'https://www.x.com/OpenAI/status/1960000000000000000/video/1?s=1#media',
    )).toEqual({
      postId: '1960000000000000000',
      url: 'https://x.com/OpenAI/status/1960000000000000000',
    });
  });

  it.each([
    ['https://x.com/home', 'a list page'],
    ['http://x.com/OpenAI/status/1960000000000000000', 'an insecure URL'],
    ['https://example.com/OpenAI/status/1960000000000000000', 'another host'],
    ['https://x.com/OpenAI/status/not-a-number', 'a non-numeric post ID'],
  ])('rejects %s (%s)', (url) => {
    expect(parseXPostUrl(url)).toBeNull();
  });

});
