export type VideoDownloadState = 'downloading' | 'failed';

export interface VideoDownloadTask {
  id: string;
  filename: string;
  state: VideoDownloadState;
  loadedBytes: number;
  totalBytes?: number;
  errorCode?: string;
}

export interface TaskSnapshot {
  tasks: VideoDownloadTask[];
}

export interface VideoTaskStore {
  start(filename: string): string;
  progress(id: string, loadedBytes: number, totalBytes?: number): void;
  fail(id: string, errorCode: string): void;
  complete(id: string): void;
  clearFailed(): void;
  snapshot(): TaskSnapshot;
  subscribe(listener: (snapshot: TaskSnapshot) => void): () => void;
}

export interface VideoTaskStoreOptions {
  createId?: () => string;
}

function cloneSnapshot(tasks: VideoDownloadTask[]): TaskSnapshot {
  return {
    tasks: tasks.map(task => ({ ...task })),
  };
}

function isValidByteCount(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function defaultCreateId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createVideoTaskStore(options: VideoTaskStoreOptions = {}): VideoTaskStore {
  const tasks: VideoDownloadTask[] = [];
  const listeners = new Set<(snapshot: TaskSnapshot) => void>();
  const createId = options.createId ?? defaultCreateId;

  const notify = () => {
    const snapshot = cloneSnapshot(tasks);
    for (const listener of listeners) listener(cloneSnapshot(snapshot.tasks));
  };

  return {
    start(filename) {
      const id = createId();
      tasks.push({
        id,
        filename,
        state: 'downloading',
        loadedBytes: 0,
      });
      notify();
      return id;
    },

    progress(id, loadedBytes, totalBytes) {
      const task = tasks.find(item => item.id === id);
      if (!task || task.state !== 'downloading' || !isValidByteCount(loadedBytes)) return;

      const nextLoadedBytes = Math.max(task.loadedBytes, loadedBytes);
      const nextTotalBytes = isValidByteCount(totalBytes ?? Number.NaN)
        ? Math.max(task.totalBytes ?? 0, totalBytes!, nextLoadedBytes)
        : task.totalBytes;

      if (
        task.loadedBytes === nextLoadedBytes
        && task.totalBytes === nextTotalBytes
      ) return;

      task.loadedBytes = nextLoadedBytes;
      if (nextTotalBytes !== undefined && nextTotalBytes > 0) {
        task.totalBytes = nextTotalBytes;
      }
      notify();
    },

    fail(id, errorCode) {
      const task = tasks.find(item => item.id === id);
      if (!task || task.state === 'failed') return;

      task.state = 'failed';
      task.errorCode = errorCode;
      notify();
    },

    complete(id) {
      const index = tasks.findIndex(item => item.id === id);
      if (index < 0) return;

      tasks.splice(index, 1);
      notify();
    },

    clearFailed() {
      const remaining = tasks.filter(task => task.state !== 'failed');
      if (remaining.length === tasks.length) return;

      tasks.splice(0, tasks.length, ...remaining);
      notify();
    },

    snapshot() {
      return cloneSnapshot(tasks);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
