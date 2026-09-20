import { parseXPostUrl } from '../post-url';
import type { MediaCaptureEvent } from './bridge-message';
import type { MediaSource } from './model';

interface CacheEntry {
  postId: string;
  mediaSources: MediaSource[];
}

interface Waiter {
  postId: string;
  resolve: (mediaSources: MediaSource[]) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class MediaSourceCache {
  private entry: CacheEntry | undefined;
  private readonly waiters = new Set<Waiter>();

  constructor(private readonly getCurrentURL: () => string) {}

  accept(event: MediaCaptureEvent): void {
    this.syncLocation();
    if (this.currentPostId() !== event.postId) return;

    this.entry = { postId: event.postId, mediaSources: [...event.mediaSources] };
    for (const waiter of [...this.waiters]) {
      if (waiter.postId !== event.postId) continue;
      this.waiters.delete(waiter);
      clearTimeout(waiter.timer);
      waiter.resolve([...event.mediaSources]);
    }
  }

  syncLocation(): void {
    const currentPostId = this.currentPostId();
    if (this.entry && this.entry.postId !== currentPostId) {
      this.entry = undefined;
      for (const waiter of [...this.waiters]) {
        this.waiters.delete(waiter);
        clearTimeout(waiter.timer);
        waiter.resolve([]);
      }
    }
  }

  async get(postId: string, timeoutMs: number): Promise<MediaSource[]> {
    this.syncLocation();
    if (this.currentPostId() !== postId) return [];
    if (this.entry?.postId === postId) return [...this.entry.mediaSources];
    if (timeoutMs <= 0) return [];

    return new Promise(resolve => {
      const waiter: Waiter = {
        postId,
        resolve,
        timer: setTimeout(() => {
          this.waiters.delete(waiter);
          resolve([]);
        }, timeoutMs),
      };
      this.waiters.add(waiter);
    });
  }

  private currentPostId(): string | undefined {
    return parseXPostUrl(this.getCurrentURL())?.postId;
  }
}
