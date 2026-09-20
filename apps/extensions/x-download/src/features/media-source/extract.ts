import { isAllowedMediaSourceURL, type MediaSource, type MediaSourceType } from './model';

interface MediaVariant {
  content_type?: unknown;
  bitrate?: unknown;
  url?: unknown;
}

interface MediaItem {
  id_str?: unknown;
  id?: unknown;
  media_key?: unknown;
  type?: unknown;
  video_info?: unknown;
}

const sourcePriority: Record<MediaSourceType, number> = {
  dash: 3,
  hls: 2,
  mp4: 1,
};

export function extractMediaSources(value: unknown, postId: string): MediaSource[] {
  const tweet = findTweetByRestId(value, postId);
  if (!tweet) return [];

  const seenMediaIds = new Set<string>();
  const sources: MediaSource[] = [];
  for (const item of mediaItems(tweet)) {
    if (item.type !== 'video' && item.type !== 'animated_gif') continue;
    const mediaId = readString(item.id_str) ?? readString(item.id) ?? readString(item.media_key);
    if (!mediaId || seenMediaIds.has(mediaId)) continue;

    const source = selectCompleteSource(item.video_info);
    if (!source) continue;
    seenMediaIds.add(mediaId);
    sources.push({ mediaId, ...source });
  }
  return sources;
}

function findTweetByRestId(value: unknown, postId: string): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findTweetByRestId(item, postId);
      if (result) return result;
    }
    return null;
  }
  if (!isRecord(value)) return null;
  if (value.rest_id === postId || value.restId === postId) return value;

  for (const child of Object.values(value)) {
    const result = findTweetByRestId(child, postId);
    if (result) return result;
  }
  return null;
}

function mediaItems(tweet: Record<string, unknown>): MediaItem[] {
  const legacy = isRecord(tweet.legacy) ? tweet.legacy : tweet;
  const extended = isRecord(legacy.extended_entities) ? legacy.extended_entities : undefined;
  const entities = extended ?? (isRecord(legacy.entities) ? legacy.entities : undefined);
  if (!entities || !Array.isArray(entities.media)) return [];
  return entities.media.filter(isRecord) as MediaItem[];
}

function selectCompleteSource(videoInfo: unknown): Omit<MediaSource, 'mediaId'> | null {
  if (!isRecord(videoInfo) || !Array.isArray(videoInfo.variants)) return null;

  const candidates = videoInfo.variants
    .filter(isRecord)
    .map(toCandidate)
    .filter((candidate): candidate is SourceCandidate => candidate !== null);
  const unique = [...new Map(candidates.map(candidate => [candidate.url, candidate])).values()];
  unique.sort((left, right) => {
    const priorityDifference = sourcePriority[right.type] - sourcePriority[left.type];
    if (priorityDifference !== 0) return priorityDifference;
    return right.bitrate - left.bitrate;
  });

  const selected = unique[0];
  return selected ? { type: selected.type, url: selected.url } : null;
}

interface SourceCandidate {
  type: MediaSourceType;
  url: string;
  bitrate: number;
}

function toCandidate(value: Record<string, unknown>): SourceCandidate | null {
  const url = readString(value.url);
  if (!url || !isAllowedMediaSourceURL(url)) return null;

  const type = mediaSourceType(value);
  if (!type) return null;
  const bitrate = typeof value.bitrate === 'number' && Number.isFinite(value.bitrate)
    ? value.bitrate
    : 0;
  return { type, url, bitrate };
}

function mediaSourceType(variant: Record<string, unknown>): MediaSourceType | null {
  const contentType = readString(variant.content_type)?.toLowerCase();
  const pathname = mediaPathname(variant.url);
  if (contentType === 'application/dash+xml' || pathname.endsWith('.mpd')) return 'dash';
  if (contentType === 'application/x-mpegurl'
    || contentType === 'application/vnd.apple.mpegurl'
    || pathname.endsWith('.m3u8')) return 'hls';
  if (contentType === 'video/mp4' || pathname.endsWith('.mp4')) return 'mp4';
  return null;
}

function mediaPathname(value: unknown): string {
  const url = readString(value);
  if (!url) return '';
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return '';
  }
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
