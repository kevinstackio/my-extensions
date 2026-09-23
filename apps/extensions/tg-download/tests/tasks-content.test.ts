import { describe, expect, it, vi } from 'vitest';

import { createSnapshotRequestQueue } from '../src/entrypoints/tasks.content';

describe('任务桥接快照请求队列', () => {
  it('请求超时后移除包装回调，后续快照不会命中失效订阅', async () => {
    vi.useFakeTimers();
    try {
      const queue = createSnapshotRequestQueue(10);
      const dispatch = vi.fn();
      const pending = queue.request(dispatch);

      expect(queue.pendingCount()).toBe(1);
      vi.advanceTimersByTime(10);
      await expect(pending).resolves.toBeUndefined();
      expect(queue.pendingCount()).toBe(0);

      queue.resolve({ tasks: [] });
      expect(queue.pendingCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
