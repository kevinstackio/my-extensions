import { describe, expect, it, vi } from 'vitest';

import { saveMedia } from '../src/features/download/download-media';

function createMenu() {
  return {
    loading: vi.fn(),
    close: vi.fn(),
    dismiss: vi.fn(),
    notice: vi.fn(),
    ready: vi.fn(),
    result: vi.fn(),
  };
}

function createVideoLifecycle() {
  return {
    start: vi.fn(() => 'video-task'),
    progress: vi.fn(),
    complete: vi.fn(),
    fail: vi.fn(),
  };
}

describe('媒体保存', () => {
  it('保存窗口默认打开系统 Downloads 目录', async () => {
    let pickerOptions: { id?: string; startIn?: string } | undefined;
    const writable = {
      write: async () => {},
      close: vi.fn(),
      abort: vi.fn(),
    };

    await saveMedia(
      { tagName: 'IMG', currentSrc: '', src: 'blob:test' },
      createMenu(),
      {
        fetch: async () => new Response(new Uint8Array([1]), {
          status: 200,
          headers: { 'Content-Length': '1' },
        }),
        now: () => 300,
        setTimeout: callback => { callback(); return 0; },
        showSaveFilePicker: async options => {
          pickerOptions = options;
          return { createWritable: async () => writable };
        },
        logger: { error: vi.fn() },
      },
    );

    expect(pickerOptions).toMatchObject({
      id: 'tg-download',
      startIn: 'downloads',
    });
  });

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

  it('视频确认保存后使用实际文件名创建任务', async () => {
    const menu = createMenu();
    const lifecycle = createVideoLifecycle();
    const writes: number[][] = [];
    const writable = {
      write: async (chunk: Uint8Array) => { writes.push([...chunk]); },
      close: vi.fn(),
      abort: vi.fn(),
    };

    await saveMedia(
      { tagName: 'VIDEO', currentSrc: '', src: 'blob:test' },
      menu,
      {
        fetch: async () => new Response(new Uint8Array([1, 2]), {
          status: 200,
          headers: { 'Content-Length': '2' },
        }),
        now: () => 0,
        setTimeout: vi.fn(),
        showSaveFilePicker: async () => ({
          name: 'renamed-video.mp4',
          createWritable: async () => writable,
        }),
        logger: { error: vi.fn() },
      },
      lifecycle,
    );

    expect(lifecycle.start).toHaveBeenCalledWith('renamed-video.mp4');
    expect(menu.loading).not.toHaveBeenCalled();
    expect(menu.result).not.toHaveBeenCalled();
    expect(menu.ready).not.toHaveBeenCalled();
    expect(lifecycle.progress).toHaveBeenCalledWith('video-task', 2, 2);
    expect(lifecycle.complete).toHaveBeenCalledWith('video-task');
    expect(writes).toEqual([[1, 2]]);
  });

  it('视频确认保存后用短暂提示替换下载按钮', async () => {
    const menu = createMenu();
    const lifecycle = createVideoLifecycle();

    await saveMedia(
      { tagName: 'VIDEO', currentSrc: '', src: 'blob:test' },
      menu,
      {
        fetch: async () => new Response(new Uint8Array([1]), { status: 200 }),
        now: () => 0,
        setTimeout: vi.fn(),
        showSaveFilePicker: async () => ({
          name: 'video.mp4',
          createWritable: async () => ({
            write: async () => {},
            close: async () => {},
          }),
        }),
        logger: { error: vi.fn() },
      },
      lifecycle,
    );

    expect(menu.notice).toHaveBeenCalledWith(
      '已开始下载，可在扩展中查看进度',
      1200,
    );
    expect(menu.close).not.toHaveBeenCalled();
  });

  it('视频没有总大小时上报不确定进度并保留并发生命周期', async () => {
    const lifecycle = createVideoLifecycle();
    const menu = createMenu();

    await saveMedia(
      { tagName: 'VIDEO', currentSrc: '', src: 'blob:test' },
      menu,
      {
        fetch: async () => new Response(new Uint8Array([1, 2]), { status: 200 }),
        now: () => 0,
        setTimeout: vi.fn(),
        showSaveFilePicker: async () => ({
          name: 'unknown-size.mp4',
          createWritable: async () => ({
            write: async () => {},
            close: async () => {},
            abort: async () => {},
          }),
        }),
        logger: { error: vi.fn() },
      },
      lifecycle,
    );

    expect(lifecycle.progress).toHaveBeenCalledWith('video-task', 2, undefined);
    expect(lifecycle.complete).toHaveBeenCalledWith('video-task');
  });

  it('视频请求失败时只标记任务失败，不恢复页面菜单', async () => {
    const lifecycle = createVideoLifecycle();
    const menu = createMenu();
    const logger = { error: vi.fn() };

    await saveMedia(
      { tagName: 'VIDEO', currentSrc: '', src: 'blob:test' },
      menu,
      {
        fetch: async () => new Response(null, { status: 500 }),
        now: () => 0,
        setTimeout: callback => { callback(); return 0; },
        showSaveFilePicker: async () => ({
          name: 'failed.mp4',
          createWritable: async () => ({
            write: async () => {},
            close: async () => {},
            abort: async () => {},
          }),
        }),
        logger,
      },
      lifecycle,
    );

    expect(lifecycle.fail).toHaveBeenCalledWith('video-task', 'http-500');
    expect(menu.ready).not.toHaveBeenCalled();
    expect(menu.result).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledOnce();
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

  it('文件无法写入时标记本地写入失败', async () => {
    const lifecycle = createVideoLifecycle();
    const menu = createMenu();

    await saveMedia(
      { tagName: 'VIDEO', currentSrc: '', src: 'blob:test' },
      menu,
      {
        fetch: async () => new Response(new Uint8Array([1]), { status: 200 }),
        now: () => 0,
        setTimeout: vi.fn(),
        showSaveFilePicker: async () => ({
          name: 'unwritable.mp4',
          createWritable: async () => { throw new Error('No space left on device'); },
        }),
        logger: { error: vi.fn() },
      },
      lifecycle,
    );

    expect(lifecycle.fail).toHaveBeenCalledWith('video-task', 'file-write');
  });
});
