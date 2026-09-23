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
  createWritable(): Promise<MediaWritable>;
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
): Promise<void> {
  const src = media.currentSrc || media.src;
  if (!src || !dependencies.showSaveFilePicker) return;

  let writable: MediaWritable | undefined;
  let loadingStartedAt = 0;

  try {
    const handle = await dependencies.showSaveFilePicker({
      id: 'tg-download',
      startIn: 'downloads',
      suggestedName: createDownloadFilename(media.tagName),
    });
    writable = await handle.createWritable();
    loadingStartedAt = dependencies.now();
    menu.loading();

    let offset = 0;
    let total = 0;
    for (;;) {
      const response = await dependencies.fetch(src, {
        credentials: 'include',
        headers: { Range: `bytes=${offset}-` },
      });
      if (response.status !== 200 && response.status !== 206) {
        throw new Error(`HTTP ${response.status}`);
      }

      const range = parseContentRange(response.headers.get('Content-Range'));
      total = range?.total || Number(response.headers.get('Content-Length')) || total;
      offset = await writeResponse(response, writable, () => {}, offset, total);
      if (response.status === 200 || !range || offset >= range.total) break;
    }

    await writable.close();
    const remaining = Math.max(0, 300 - (dependencies.now() - loadingStartedAt));
    dependencies.setTimeout(() => {
      menu.result('下载成功');
      menu.dismiss(300);
    }, remaining);
  } catch (error) {
    if (isAbortError(error)) {
      menu.close();
      return;
    }

    await writable?.abort?.();
    dependencies.logger.error('TG Download 下载失败：', error);
    menu.result('下载失败');
    dependencies.setTimeout(() => menu.ready(), 1000);
  }
}
