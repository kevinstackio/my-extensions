import { describe, expect, it } from 'vitest';

import {
  createPopupTaskProjection,
  getProgressPresentation,
  hasClearableTasks,
} from '../src/features/download/popup-model';
import type { TaskSnapshot, VideoDownloadTask } from '../src/features/download/task-protocol';

function task(overrides: Partial<VideoDownloadTask> = {}): VideoDownloadTask {
  return {
    id: 'task',
    filename: 'video.mp4',
    state: 'downloading',
    loadedBytes: 0,
    ...overrides,
  };
}

function snapshot(...tasksToAdd: VideoDownloadTask[]): TaskSnapshot {
  return { tasks: tasksToAdd };
}

describe('下载 Popup 任务投影', () => {
  it('初始没有任务', () => {
    expect(createPopupTaskProjection().getTasks()).toEqual([]);
  });

  it('不同标签页中相同任务 ID 不互相覆盖', () => {
    const projection = createPopupTaskProjection();
    projection.applyTabSnapshot(1, snapshot(task({ filename: 'one.mp4' })));
    projection.applyTabSnapshot(2, snapshot(task({ filename: 'two.mp4' })));

    expect(projection.getTasks()).toEqual([
      expect.objectContaining({ tabId: 1, key: '1:task', filename: 'one.mp4' }),
      expect.objectContaining({ tabId: 2, key: '2:task', filename: 'two.mp4' }),
    ]);
  });

  it('同一标签页的新快照替换旧任务并保留已有顺序', () => {
    const projection = createPopupTaskProjection();
    projection.applyTabSnapshot(1, snapshot(
      task({ id: 'first', filename: 'first.mp4' }),
      task({ id: 'second', filename: 'second.mp4' }),
    ));
    projection.applyTabSnapshot(1, snapshot(
      task({ id: 'second', filename: 'second-renamed.mp4' }),
      task({ id: 'third', filename: 'third.mp4' }),
    ));

    expect(projection.getTasks()).toEqual([
      expect.objectContaining({ key: '1:second', filename: 'second-renamed.mp4' }),
      expect.objectContaining({ key: '1:third', filename: 'third.mp4' }),
    ]);
  });

  it('按历史快照顺序展示最新任务在最上面', () => {
    const projection = createPopupTaskProjection();
    projection.applyTabSnapshot(1, snapshot(
      task({ id: 'old', filename: 'old.mp4' }),
      task({ id: 'new', filename: 'new.mp4' }),
    ));
    projection.applyTabSnapshot(1, snapshot(
      task({ id: 'new', filename: 'new.mp4' }),
      task({ id: 'old', filename: 'old.mp4' }),
    ));

    expect(projection.getTasks().map(item => item.id)).toEqual(['new', 'old']);
  });

  it('标签页移除时清除该标签页任务', () => {
    const projection = createPopupTaskProjection();
    projection.applyTabSnapshot(1, snapshot(task({ id: 'one' })));
    projection.applyTabSnapshot(2, snapshot(task({ id: 'two' })));
    projection.removeTab(1);

    expect(projection.getTasks()).toEqual([
      expect.objectContaining({ key: '2:two' }),
    ]);
  });

  it('已知总大小生成限制在 0 到 100 的百分比', () => {
    expect(getProgressPresentation(task({ loadedBytes: 15, totalBytes: 10 }))).toEqual({
      mode: 'determinate',
      percent: 100,
      label: '100%',
    });
  });

  it('未知总大小使用不确定进度', () => {
    expect(getProgressPresentation(task({ loadedBytes: 15 }))).toEqual({
      mode: 'indeterminate',
      label: '下载中',
    });
  });

  it('失败任务显示具体失败原因', () => {
    expect(getProgressPresentation(task({ state: 'failed', errorCode: 'http-403' }))).toEqual({
      mode: 'indeterminate',
      label: 'HTTP 403',
    });
    expect(getProgressPresentation(task({ state: 'failed', errorCode: 'file-write' }))).toEqual({
      mode: 'indeterminate',
      label: '无法写入文件',
    });
    expect(getProgressPresentation(task({ state: 'failed', errorCode: 'interrupted' }))).toEqual({
      mode: 'indeterminate',
      label: '浏览器重启后中断',
    });
  });

  it('已完成任务显示完成状态并使用 100% 进度', () => {
    expect(getProgressPresentation(task({
      state: 'completed',
      loadedBytes: 12,
      totalBytes: 12,
    }))).toEqual({
      mode: 'determinate',
      percent: 100,
      label: '下载完成',
    });
  });

  it('只有完成或失败任务时启用清空按钮', () => {
    expect(hasClearableTasks([task({ state: 'failed', errorCode: 'network' })])).toBe(true);
    expect(hasClearableTasks([task({ state: 'completed' })])).toBe(true);
    expect(hasClearableTasks([task()])).toBe(false);
    expect(hasClearableTasks([])).toBe(false);
  });
});
