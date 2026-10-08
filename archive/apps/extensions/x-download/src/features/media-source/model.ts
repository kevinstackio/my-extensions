export type MediaSourceType = 'hls' | 'dash' | 'mp4';

export interface MediaSource {
  mediaId: string;
  type: MediaSourceType;
  url: string;
}

export function isAllowedMediaSourceURL(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.hostname === 'video.twimg.com'
      && !url.pathname.toLowerCase().endsWith('.m4s');
  } catch {
    return false;
  }
}
