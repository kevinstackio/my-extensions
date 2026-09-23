import { describe, expect, it, vi } from 'vitest';

import {
  POPUP_CLEAR_FAILED_MESSAGE,
  POPUP_GET_TASKS_MESSAGE,
  POPUP_OPEN_DOWNLOADS_MESSAGE,
  POPUP_TAB_REMOVED_MESSAGE,
  POPUP_TAB_SNAPSHOT_MESSAGE,
  createBackgroundTaskHandler,
} from '../src/features/download/background-tasks';
import {
  TASK_MESSAGE_SNAPSHOT,
  type TaskSnapshot,
} from '../src/features/download/task-protocol';

const snapshot: TaskSnapshot = {
  tasks: [{
    id: 'task-a',
    filename: 'video-a.mp4',
    state: 'downloading',
    loadedBytes: 4,
    totalBytes: 10,
  }],
};

function createDependencies() {
  return {
    tabsQuery: vi.fn(async () => [
      { id: 11, url: 'https://web.telegram.org/k/' },
      { id: 12, url: 'https://web.telegram.org/a/' },
    ]),
    tabsSendMessage: vi.fn(async (tabId: number) => {
      if (tabId === 12) throw new Error('tab unavailable');
      return snapshot;
    }),
    runtimeSendMessage: vi.fn(async () => {}),
    showDefaultFolder: vi.fn(async () => {}),
  };
}

describe('后台视频任务聚合', () => {
  it('只查询 Telegram 标签页并隔离无响应标签页', async () => {
    const dependencies = createDependencies();
    const handler = createBackgroundTaskHandler(dependencies);

    await expect(handler.handleMessage({ type: POPUP_GET_TASKS_MESSAGE })).resolves.toEqual([
      { tabId: 11, snapshot },
    ]);
    expect(dependencies.tabsQuery).toHaveBeenCalledWith({
      url: ['https://web.telegram.org/*'],
    });
    expect(dependencies.tabsSendMessage).toHaveBeenCalledTimes(2);
  });

  it('清理命令只广播到 Telegram 标签页', async () => {
    const dependencies = createDependencies();
    const handler = createBackgroundTaskHandler(dependencies);

    await handler.handleMessage({ type: POPUP_CLEAR_FAILED_MESSAGE });

    expect(dependencies.tabsSendMessage).toHaveBeenCalledTimes(2);
    expect(dependencies.tabsSendMessage).toHaveBeenCalledWith(11, {
      type: 'tg-download:tasks:clear-failed',
    });
  });

  it('文件夹命令只调用一次系统默认目录 API', async () => {
    const dependencies = createDependencies();
    const handler = createBackgroundTaskHandler(dependencies);

    await handler.handleMessage({ type: POPUP_OPEN_DOWNLOADS_MESSAGE });

    expect(dependencies.showDefaultFolder).toHaveBeenCalledOnce();
    expect(dependencies.tabsQuery).not.toHaveBeenCalled();
  });
  it('转发合法内容脚本快照并拒绝缺少标签页身份的消息', async () => {
    const dependencies = createDependencies();
    const handler = createBackgroundTaskHandler(dependencies);

    await handler.handleMessage(
      { type: TASK_MESSAGE_SNAPSHOT, snapshot },
      { tab: { id: 11 } },
    );
    await handler.handleMessage({ type: TASK_MESSAGE_SNAPSHOT, snapshot }, {});

    expect(dependencies.runtimeSendMessage).toHaveBeenCalledWith({
      type: POPUP_TAB_SNAPSHOT_MESSAGE,
      tabId: 11,
      snapshot,
    });
    expect(dependencies.runtimeSendMessage).toHaveBeenCalledTimes(1);
  });

  it('标签页移除时通知 Popup 删除对应投影', async () => {
    const dependencies = createDependencies();
    const handler = createBackgroundTaskHandler(dependencies);

    await handler.handleTabRemoved(11);

    expect(dependencies.runtimeSendMessage).toHaveBeenCalledWith({
      type: POPUP_TAB_REMOVED_MESSAGE,
      tabId: 11,
    });
  });
});
