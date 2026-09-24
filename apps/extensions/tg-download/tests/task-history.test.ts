import { describe, expect, it } from 'vitest';

import {
  createBrowserTaskHistoryStorage,
  createTaskHistoryStore,
  TASK_HISTORY_STORAGE_KEY,
  type TaskHistoryStorage,
} from '../src/features/download/task-history';

function createMemoryStorage(initial: unknown): TaskHistoryStorage & { writes: unknown[] } {
  const writes: unknown[] = [];
  return {
    writes,
    async get() {
      return initial;
    },
    async set(value) {
      writes.push(value);
      initial = value;
    },
  };
}

describe('下载历史存储', () => {
  it('使用固定存储键读写任务快照', async () => {
    let saved: Record<string, unknown> | undefined;
    const browserStorage = {
      get: async (key: string) => ({ [key]: { tasks: [] } }),
      set: async (value: Record<string, unknown>) => { saved = value; },
    };
    const storage = createBrowserTaskHistoryStorage(browserStorage);

    await expect(storage.get()).resolves.toEqual({ tasks: [] });
    await storage.set({ tasks: [] });
    expect(saved).toEqual({ [TASK_HISTORY_STORAGE_KEY]: { tasks: [] } });
  });

  it('读取历史并将重启前的下载中任务标记为中断失败', async () => {
    const storage = createMemoryStorage({
      tasks: [
        { id: 'done', filename: 'done.mp4', state: 'completed', loadedBytes: 10, totalBytes: 10 },
        { id: 'active', filename: 'active.mp4', state: 'downloading', loadedBytes: 4, totalBytes: 10 },
      ],
    });
    const history = createTaskHistoryStore(storage);

    await expect(history.markInterrupted()).resolves.toEqual({
      tasks: [
        {
          id: 'active',
          filename: 'active.mp4',
          state: 'failed',
          loadedBytes: 4,
          totalBytes: 10,
          errorCode: 'interrupted',
        },
        { id: 'done', filename: 'done.mp4', state: 'completed', loadedBytes: 10, totalBytes: 10 },
      ],
    });
    expect(storage.writes).toHaveLength(1);
  });

  it('按加入时间倒叙返回历史任务', async () => {
    const history = createTaskHistoryStore(createMemoryStorage({ tasks: [] }));

    await history.applySnapshot({
      tasks: [
        { id: 'old', filename: 'old.mp4', state: 'completed', loadedBytes: 8, totalBytes: 8 },
        { id: 'new', filename: 'new.mp4', state: 'downloading', loadedBytes: 1 },
      ],
    });

    expect(history.snapshot().tasks.map(task => task.id)).toEqual(['new', 'old']);
  });

  it('合并页面快照并只清除完成和失败历史记录', async () => {
    const storage = createMemoryStorage({
      tasks: [
        { id: 'failed', filename: 'failed.mp4', state: 'failed', loadedBytes: 0, errorCode: 'network' },
        { id: 'active', filename: 'active.mp4', state: 'downloading', loadedBytes: 2 },
      ],
    });
    const history = createTaskHistoryStore(storage);

    await history.applySnapshot({
      tasks: [{ id: 'new', filename: 'new.mp4', state: 'completed', loadedBytes: 8, totalBytes: 8 }],
    });

    expect(await history.clearFinished()).toEqual({
      tasks: [{ id: 'active', filename: 'active.mp4', state: 'downloading', loadedBytes: 2 }],
    });
  });
});
