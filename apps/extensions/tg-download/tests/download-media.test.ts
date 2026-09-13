import { describe, expect, it, vi } from 'vitest';

import { saveMedia } from '../src/features/download/download-media';

function createMenu() {
  return {
    loading: vi.fn(),
    close: vi.fn(),
    dismiss: vi.fn(),
    ready: vi.fn(),
    result: vi.fn(),
  };
}

describe('媒体保存', () => {
  it('用户取消保存时不请求媒体', async () => {
    const fetchMedia = vi.fn();
    const menu = createMenu();
    const error = { name: 'AbortError' };

    await saveMedia(
      { tagName: 'IMG', currentSrc: '', src: 'blob:test' },
      menu,
      {
        fetch: fetchMedia,
        now: () => 0,
        setTimeout: vi.fn(),
        showSaveFilePicker: async () => { throw error; },
        logger: { error: vi.fn() },
      },
    );

    expect(fetchMedia).not.toHaveBeenCalled();
    expect(menu.close).toHaveBeenCalledOnce();
  });

  it('调用原生文件选择器时保留 Window 接收对象', async () => {
    const runtime = globalThis as typeof globalThis & {
      showSaveFilePicker?: (options: unknown) => Promise<unknown>;
    };
    const previous = Object.getOwnPropertyDescriptor(runtime, 'showSaveFilePicker');
    let receiver: unknown;

    Object.defineProperty(runtime, 'showSaveFilePicker', {
      configurable: true,
      value: function (this: unknown) {
        receiver = this;
        const error = new Error('取消保存');
        error.name = 'AbortError';
        throw error;
      },
    });

    try {
      await saveMedia(
        { tagName: 'IMG', currentSrc: '', src: 'blob:test' },
        createMenu(),
      );
      expect(receiver).toBe(runtime);
    } finally {
      if (previous) {
        Object.defineProperty(runtime, 'showSaveFilePicker', previous);
      } else {
        delete runtime.showSaveFilePicker;
      }
    }
  });

  it('完整响应直接写入并关闭文件', async () => {
    const writes: number[][] = [];
    const writable = {
      write: async (chunk: Uint8Array) => { writes.push([...chunk]); },
      close: vi.fn(),
      abort: vi.fn(),
    };
    const menu = createMenu();

    await saveMedia(
      { tagName: 'IMG', currentSrc: '', src: 'blob:test' },
      menu,
      {
        fetch: async () => new Response(new Uint8Array([1, 2]), {
          status: 200,
          headers: { 'Content-Length': '2' },
        }),
        now: () => 300,
        setTimeout: callback => { callback(); return 0; },
        showSaveFilePicker: async () => ({ createWritable: async () => writable }),
        logger: { error: vi.fn() },
      },
    );

    expect(writes).toEqual([[1, 2]]);
    expect(writable.close).toHaveBeenCalledOnce();
    expect(menu.result).toHaveBeenCalledWith('下载成功');
    expect(menu.dismiss).toHaveBeenCalledWith(300);
  });

  it('分段响应根据已写入字节继续请求', async () => {
    const ranges: string[] = [];
    const responses = [
      new Response(new Uint8Array([1, 2]), {
        status: 206,
        headers: { 'Content-Range': 'bytes 0-1/3' },
      }),
      new Response(new Uint8Array([3]), {
        status: 206,
        headers: { 'Content-Range': 'bytes 2-2/3' },
      }),
    ];
    const menu = createMenu();

    await saveMedia(
      { tagName: 'VIDEO', currentSrc: '', src: 'https://web.telegram.org/stream/test' },
      menu,
      {
        fetch: async (_input, init) => {
          ranges.push(new Headers(init?.headers).get('Range') ?? '');
          return responses.shift()!;
        },
        now: () => 300,
        setTimeout: callback => { callback(); return 0; },
        showSaveFilePicker: async () => ({
          createWritable: async () => ({
            write: async () => {},
            close: async () => {},
            abort: async () => {},
          }),
        }),
        logger: { error: vi.fn() },
      },
    );

    expect(ranges).toEqual(['bytes=0-', 'bytes=2-']);
  });

  it('请求失败时中止文件并恢复菜单', async () => {
    const writable = {
      write: async () => {},
      close: vi.fn(),
      abort: vi.fn(),
    };
    const menu = createMenu();
    const logger = { error: vi.fn() };

    await saveMedia(
      { tagName: 'VIDEO', currentSrc: '', src: 'https://web.telegram.org/stream/test' },
      menu,
      {
        fetch: async () => new Response(null, { status: 500 }),
        now: () => 0,
        setTimeout: callback => { callback(); return 0; },
        showSaveFilePicker: async () => ({ createWritable: async () => writable }),
        logger,
      },
    );

    expect(writable.abort).toHaveBeenCalledOnce();
    expect(menu.result).toHaveBeenCalledWith('下载失败');
    expect(menu.ready).toHaveBeenCalledOnce();
    expect(logger.error).toHaveBeenCalledOnce();
  });
});
