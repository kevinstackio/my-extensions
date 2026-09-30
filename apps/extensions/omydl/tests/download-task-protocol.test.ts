import { describe, expect, it } from 'vitest';

import {
  TASK_CLEAR_FINISHED_EVENT,
  TASK_REQUEST_SNAPSHOT_EVENT,
  TASK_SNAPSHOT_EVENT,
  isTaskSnapshot,
  type TaskSnapshot,
} from '../src/features/download/task-protocol';

const validSnapshot: TaskSnapshot = {
  tasks: [{
    id: 'task-a',
    filename: 'video.mp4',
    state: 'downloading',
    loadedBytes: 4,
    totalBytes: 10,
  }],
};

describe('视频任务页面协议', () => {
  it('接受最小合法任务快照', () => {
    expect(isTaskSnapshot(validSnapshot)).toBe(true);
  });

  it.each([
    ['非法状态', { ...validSnapshot, tasks: [{ ...validSnapshot.tasks[0], state: 'cancelled' }] }],
    ['空任务 ID', { ...validSnapshot, tasks: [{ ...validSnapshot.tasks[0], id: '' }] }],
    ['超长文件名', { ...validSnapshot, tasks: [{ ...validSnapshot.tasks[0], filename: 'x'.repeat(513) }] }],
    ['负数字节数', { ...validSnapshot, tasks: [{ ...validSnapshot.tasks[0], loadedBytes: -1 }] }],
    ['非有限字节数', { ...validSnapshot, tasks: [{ ...validSnapshot.tasks[0], loadedBytes: Number.NaN }] }],
    ['已写入字节超过总大小', { ...validSnapshot, tasks: [{ ...validSnapshot.tasks[0], loadedBytes: 11 }] }],
    ['携带媒体地址', { ...validSnapshot, url: 'https://telegram.test/video' }],
    ['携带文件句柄', { ...validSnapshot, fileHandle: {} }],
    ['携带未知任务字段', { ...validSnapshot, tasks: [{ ...validSnapshot.tasks[0], blob: 'secret' }] }],
  ])('拒绝%s', (_name, value) => {
    expect(isTaskSnapshot(value)).toBe(false);
  });

  it('导出固定且互不重复的页面事件名', () => {
    expect(new Set([
      TASK_SNAPSHOT_EVENT,
      TASK_REQUEST_SNAPSHOT_EVENT,
      TASK_CLEAR_FINISHED_EVENT,
    ]).size).toBe(3);
  });
});
