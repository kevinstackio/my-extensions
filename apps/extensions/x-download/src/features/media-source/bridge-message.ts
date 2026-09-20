import { isAllowedMediaSourceURL, type MediaSource, type MediaSourceType } from './model';

export interface MediaCaptureEvent {
  source: 'x-download-page-media';
  type: 'media-source.captured';
  postId: string;
  mediaSources: MediaSource[];
}

export interface MediaSourceQuery {
  type: 'media-source.get-current';
  postId: string;
  timeoutMs: number;
}

export function parseMediaCaptureEvent(value: unknown, currentPostId: string | undefined): MediaCaptureEvent | null {
  if (!isRecord(value)
    || value.source !== 'x-download-page-media'
    || value.type !== 'media-source.captured'
    || typeof value.postId !== 'string'
    || !currentPostId
    || value.postId !== currentPostId
    || !Array.isArray(value.mediaSources)) {
    return null;
  }

  const mediaSources = parseMediaSources(value.mediaSources);
  return mediaSources.length > 0
    ? { source: 'x-download-page-media', type: 'media-source.captured', postId: currentPostId, mediaSources }
    : null;
}

export function parseMediaSources(value: unknown): MediaSource[] {
  if (!Array.isArray(value)) return [];
  const mediaSources: MediaSource[] = [];
  const mediaIds = new Set<string>();
  for (const candidate of value) {
    if (!isRecord(candidate)
      || typeof candidate.mediaId !== 'string'
      || mediaIds.has(candidate.mediaId)
      || !isMediaSourceType(candidate.type)
      || !isAllowedMediaSourceURL(candidate.url)) {
      return [];
    }
    mediaIds.add(candidate.mediaId);
    mediaSources.push({
      mediaId: candidate.mediaId,
      type: candidate.type,
      url: candidate.url,
    });
  }

  return mediaSources;
}

export function parseMediaSourceQuery(value: unknown): MediaSourceQuery | null {
  if (!isRecord(value) || value.type !== 'media-source.get-current' || typeof value.postId !== 'string') {
    return null;
  }
  const timeoutMs = typeof value.timeoutMs === 'number' && Number.isFinite(value.timeoutMs)
    ? Math.min(Math.max(value.timeoutMs, 0), 3000)
    : 3000;
  return { type: 'media-source.get-current', postId: value.postId, timeoutMs };
}

function isMediaSourceType(value: unknown): value is MediaSourceType {
  return value === 'hls' || value === 'dash' || value === 'mp4';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
