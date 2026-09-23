import { describe, expect, it, vi } from 'vitest';

import { createVideoTaskStore } from '../src/features/download/task-store';

describe('视频下载任务存储', () => {
  it('支持多个任务并按任务 ID 独立更新进度', () => {
    const store = createVideoTaskStore({
      createId: vi.fn()
        .mockReturnValueOnce('task-a')
        .mockReturnValueOnce('task-b'),
    });

    const firstId = store.start('video-a.mp4');
    const secondId = store.start('video-b.mp4');

    store.progress(firstId, 40, 100);
    store.progress(secondId, 12);

    expect(store.snapshot()).toEqual({
      tasks: [
        {
          id: 'task-a',
          filename: 'video-a.mp4',
          state: 'downloading',
          loadedBytes: 40,
          totalBytes: 100,
        },
        {
          id: 'task-b',
          filename: 'video-b.mp4',
          state: 'downloading',
          loadedBytes: 12,
        },
      ],
    });
  });

  it('成功任务立即移除，失败任务保留到清理', () => {
    const store = createVideoTaskStore({
      createId: vi.fn()
        .mockReturnValueOnce('task-success')
        .mockReturnValueOnce('task-failed'),
    });

    const successId = store.start('success.mp4');
    const failedId = store.start('failed.mp4');
    store.complete(successId);
    store.fail(failedId, 'network');

    expect(store.snapshot().tasks).toEqual([{
      id: 'task-failed',
      filename: 'failed.mp4',
      state: 'failed',
      loadedBytes: 0,
      errorCode: 'network',
    }]);

    store.clearFailed();

    expect(store.snapshot()).toEqual({ tasks: [] });
  });

  it('未知总大小保持不确定进度并拒绝倒退进度', () => {
    const store = createVideoTaskStore({ createId: () => 'task' });
    const taskId = store.start('unknown-size.mp4');

    store.progress(taskId, 20);
    store.progress(taskId, 10, 100);

    expect(store.snapshot().tasks[0]).toMatchObject({
      loadedBytes: 20,
      totalBytes: 100,
    });
  });

  it('订阅快照且外部修改不会改变存储内部状态', () => {
    const store = createVideoTaskStore({ createId: () => 'task' });
    const listener = vi.fn();
    store.subscribe(listener);

    store.start('video.mp4');
    const received = listener.mock.lastCall?.[0];
    if (!received) throw new Error('订阅者没有收到快照');
    received.tasks[0]!.filename = 'tampered.mp4';

    expect(store.snapshot().tasks[0]!.filename).toBe('video.mp4');
    expect(store.subscribe(listener)).toBeTypeOf('function');
  });
});
