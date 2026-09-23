import { createDownloadFilename } from './filename';
import { parseContentRange, writeResponse } from './range';

export interface DownloadMenuController {
  loading(): void;
  close(): void;
  dismiss(duration: number): void;
  ready(): void;
  result(text: string): void;
}

export interface MediaWritable {
  write(chunk: Uint8Array): Promise<void> | void;
  close(): Promise<void> | void;
  abort?(): Promise<void> | void;
}

export interface SaveFileHandle {
  name?: string;
  createWritable(): Promise<MediaWritable>;
}

export interface VideoDownloadLifecycle {
  start(filename: string): string;
  progress(taskId: string, loadedBytes: number, totalBytes?: number): void;
  complete(taskId: string): void;
  fail(taskId: string, errorCode: string): void;
}

export interface SaveMediaDependencies {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  logger: Pick<Console, 'error'>;
  now(): number;
  setTimeout(callback: () => void, delay: number): unknown;
  showSaveFilePicker?(options: {
    id: string;
    startIn: string;
    suggestedName: string;
  }): Promise<SaveFileHandle>;
}

export interface DownloadableMedia {
  currentSrc: string;
  src: string;
  tagName: string;
}

type DownloadStage = 'create-writable' | 'fetch' | 'stream' | 'close';

function getDownloadFailureCode(error: unknown, stage: DownloadStage): string {
  if (error instanceof Error) {
    const httpStatus = /^HTTP (\d{3})$/.exec(error.message)?.[1];
    if (httpStatus) return `http-${httpStatus}`;
  }

  switch (stage) {
    case 'create-writable':
      return 'file-write';
    case 'fetch':
      return 'network';
    case 'stream':
      return 'stream';
    case 'close':
      return 'file-close';
  }
}

function defaultDependencies(): SaveMediaDependencies {
  const runtime = globalThis as typeof globalThis & {
    showSaveFilePicker?: SaveMediaDependencies['showSaveFilePicker'];
  };

  return {
    fetch: globalThis.fetch.bind(globalThis),
    logger: console,
    now: Date.now,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    showSaveFilePicker: runtime.showSaveFilePicker?.bind(runtime),
  };
}

function isAbortError(error: unknown): boolean {
  return Boolean(
    error
    && typeof error === 'object'
    && 'name' in error
    && error.name === 'AbortError',
  );
}

export async function saveMedia(
  media: DownloadableMedia,
  menu: DownloadMenuController,
  dependencies = defaultDependencies(),
  videoLifecycle?: VideoDownloadLifecycle,
): Promise<void> {
  const src = media.currentSrc || media.src;
  if (!src || !dependencies.showSaveFilePicker) return;

  let writable: MediaWritable | undefined;
  let loadingStartedAt = 0;
  let taskId: string | undefined;
  let stage: DownloadStage = 'create-writable';
  const isVideoTask = media.tagName === 'VIDEO' && Boolean(videoLifecycle);
  const suggestedName = createDownloadFilename(media.tagName);

  try {
    const handle = await dependencies.showSaveFilePicker({
      id: 'tg-download',
      startIn: 'downloads',
      suggestedName,
    });
    if (isVideoTask && videoLifecycle) {
      taskId = videoLifecycle.start(handle.name || suggestedName);
      menu.close();
    }
    stage = 'create-writable';
    writable = await handle.createWritable();
    loadingStartedAt = dependencies.now();
    if (!taskId) menu.loading();

    let offset = 0;
    let total = 0;
    for (;;) {
      stage = 'fetch';
      const response = await dependencies.fetch(src, {
        credentials: 'include',
        headers: { Range: `bytes=${offset}-` },
      });
      if (response.status !== 200 && response.status !== 206) {
        throw new Error(`HTTP ${response.status}`);
      }

      const range = parseContentRange(response.headers.get('Content-Range'));
      total = range?.total || Number(response.headers.get('Content-Length')) || total;
      stage = 'stream';
      offset = await writeResponse(
        response,
        writable,
        (loaded, responseTotal) => {
          if (taskId && videoLifecycle) {
            videoLifecycle.progress(
              taskId,
              loaded,
              responseTotal > 0 ? responseTotal : undefined,
            );
          }
        },
        offset,
        total,
      );
      if (response.status === 200 || !range || offset >= range.total) break;
    }

    stage = 'close';
    await writable.close();
    if (taskId && videoLifecycle) {
      videoLifecycle.complete(taskId);
      return;
    }

    const remaining = Math.max(0, 300 - (dependencies.now() - loadingStartedAt));
    dependencies.setTimeout(() => {
      menu.result('下载成功');
      menu.dismiss(300);
    }, remaining);
  } catch (error) {
    if (isAbortError(error) && !taskId) {
      menu.close();
      return;
    }

    await writable?.abort?.();
    const errorCode = getDownloadFailureCode(error, stage);
    dependencies.logger.error('TG Download 下载失败：', { errorCode, error });
    if (taskId && videoLifecycle) {
      videoLifecycle.fail(taskId, errorCode);
      return;
    }

    menu.result('下载失败');
    dependencies.setTimeout(() => menu.ready(), 1000);
  }
}
