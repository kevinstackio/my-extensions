import { describe, expect, it, vi } from 'vitest';

import {
  createVideoDownloadController,
  registerTaskEventHandlers,
} from '../src/entrypoints/download.content';
import { createVideoTaskStore } from '../src/features/download/task-store';

function createMenu() {
  return {
    loading: vi.fn(),
    close: vi.fn(),
    dismiss: vi.fn(),
    notice: vi.fn(),
    ready: vi.fn(),
    result: vi.fn(),
    busy: vi.fn(() => false),
    contains: vi.fn(() => false),
    open: vi.fn(),
  };
}

describe('视频下载页面编排', () => {
  it('连续保存两个视频时分别使用点击时捕获的媒体引用', () => {
    const menu = createMenu();
    const store = createVideoTaskStore({
      createId: vi.fn()
        .mockReturnValueOnce('task-a')
        .mockReturnValueOnce('task-b'),
    });
    const saveMedia = vi.fn(async () => {});
    const controller = createVideoDownloadController({ menu, store, saveMedia });
    const first = { tagName: 'VIDEO', src: 'blob:first', currentSrc: '' };
    const second = { tagName: 'VIDEO', src: 'blob:second', currentSrc: '' };

    controller.selectMedia(first);
    controller.saveActiveMedia();
    controller.selectMedia(second);
    controller.saveActiveMedia();

    expect(saveMedia).toHaveBeenNthCalledWith(1, first, menu, undefined, store);
    expect(saveMedia).toHaveBeenNthCalledWith(2, second, menu, undefined, store);
  });

  it('快照请求只发布当前任务，清空事件只移除终态任务', () => {
    const menu = createMenu();
    const store = createVideoTaskStore({
      createId: vi.fn()
        .mockReturnValueOnce('active')
        .mockReturnValueOnce('failed')
        .mockReturnValueOnce('downloading'),
    });
    const publishSnapshot = vi.fn();
    const controller = createVideoDownloadController({
      menu,
      store,
      saveMedia: vi.fn(async () => {}),
      publishSnapshot,
    });

    const activeId = store.start('active.mp4');
    const failedId = store.start('failed.mp4');
    const downloadingId = store.start('downloading.mp4');
    store.fail(failedId, 'network');
    controller.handleSnapshotRequest();
    controller.clearFinished();

    expect(publishSnapshot).toHaveBeenCalledWith({
      tasks: [{
        id: activeId,
        filename: 'active.mp4',
        state: 'downloading',
        loadedBytes: 0,
      }, {
        id: failedId,
        filename: 'failed.mp4',
        state: 'failed',
        loadedBytes: 0,
        errorCode: 'network',
      }, {
        id: downloadingId,
        filename: 'downloading.mp4',
        state: 'downloading',
        loadedBytes: 0,
      }],
    });
    expect(store.snapshot()).toEqual({
      tasks: [{
        id: activeId,
        filename: 'active.mp4',
        state: 'downloading',
        loadedBytes: 0,
      }, {
        id: downloadingId,
        filename: 'downloading.mp4',
        state: 'downloading',
        loadedBytes: 0,
      }],
    });
  });

  it('在同一个事件目标上接收 Popup 的快照请求和清空终态事件', () => {
    const target = new EventTarget();
    const controller = {
      handleSnapshotRequest: vi.fn(),
      clearFinished: vi.fn(),
    };

    registerTaskEventHandlers(target, controller);
    target.dispatchEvent(new Event('tg-download:task-request-snapshot'));
    target.dispatchEvent(new Event('tg-download:task-clear-finished'));

    expect(controller.handleSnapshotRequest).toHaveBeenCalledOnce();
    expect(controller.clearFinished).toHaveBeenCalledOnce();
  });
});
