import {
  parseTaskSnapshot,
  TASK_MESSAGE_CLEAR_FINISHED,
  TASK_MESSAGE_GET_SNAPSHOT,
  TASK_MESSAGE_SNAPSHOT,
  type TaskRuntimeCommand,
  type TaskRuntimeSnapshotMessage,
  type TaskSnapshot,
} from './task-protocol';
import type { TaskHistoryStore } from './task-history';

export const POPUP_GET_TASKS_MESSAGE = 'tg-download:popup:get-tasks';
export const POPUP_CLEAR_FINISHED_MESSAGE = 'tg-download:popup:clear-finished';
export const POPUP_OPEN_DOWNLOADS_MESSAGE = 'tg-download:popup:open-downloads';
export const POPUP_TAB_SNAPSHOT_MESSAGE = 'tg-download:popup:tab-snapshot';
export const POPUP_TAB_REMOVED_MESSAGE = 'tg-download:popup:tab-removed';
// Popup 没有真实的 Telegram 标签页，使用固定负数标识统一历史快照。
export const POPUP_HISTORY_TAB_ID = -1;

export type PopupTaskMessage =
  | { type: typeof POPUP_GET_TASKS_MESSAGE }
  | { type: typeof POPUP_CLEAR_FINISHED_MESSAGE }
  | { type: typeof POPUP_OPEN_DOWNLOADS_MESSAGE }
  | TaskRuntimeSnapshotMessage;

export interface TelegramTab {
  id?: number;
  url?: string;
}

export interface TaskMessageSender {
  tab?: { id?: number };
}

export interface BackgroundTaskDependencies {
  tabsQuery(query: { url: string[] }): Promise<TelegramTab[]>;
  tabsSendMessage(tabId: number, message: TaskRuntimeCommand): Promise<unknown>;
  runtimeSendMessage(message: unknown): Promise<unknown> | unknown;
  showDefaultFolder(): Promise<void> | void;
  history?: TaskHistoryStore;
}

export interface PopupTabSnapshot {
  tabId: number;
  snapshot: TaskSnapshot;
}

function telegramTabs(dependencies: BackgroundTaskDependencies): Promise<TelegramTab[]> {
  return dependencies.tabsQuery({ url: ['https://web.telegram.org/*'] });
}

export function createBackgroundTaskHandler(dependencies: BackgroundTaskDependencies) {
  const getSnapshots = async (): Promise<PopupTabSnapshot[]> => {
    const tabs = await telegramTabs(dependencies);
    const results = await Promise.allSettled(
      tabs
        .filter((tab): tab is TelegramTab & { id: number } => typeof tab.id === 'number')
        .map(async tab => {
          const response = await dependencies.tabsSendMessage(tab.id, {
            type: TASK_MESSAGE_GET_SNAPSHOT,
          });
          const snapshot = parseTaskSnapshot(response);
          return snapshot ? { tabId: tab.id, snapshot } : undefined;
        }),
    );

    const activeSnapshots = results.flatMap(result => (
      result.status === 'fulfilled' && result.value ? [result.value] : []
    ));

    if (!dependencies.history) return activeSnapshots;

    // 页面快照只负责补充最新状态，历史记录由后台统一合并和持久化。
    await dependencies.history.hydrate();
    for (const result of activeSnapshots) {
      await dependencies.history.applySnapshot(result.snapshot);
    }
    return [{
      tabId: POPUP_HISTORY_TAB_ID,
      snapshot: dependencies.history.snapshot(),
    }];
  };

  return {
    async handleMessage(message: unknown, sender: TaskMessageSender = {}) {
      if (!message || typeof message !== 'object') return undefined;
      const type = (message as { type?: unknown }).type;

      if (type === POPUP_GET_TASKS_MESSAGE) return getSnapshots();

      if (type === POPUP_CLEAR_FINISHED_MESSAGE) {
        if (dependencies.history) {
          // 先更新 Popup，再通知页面清理终态任务，避免下载中的任务短暂消失。
          const snapshot = await dependencies.history.clearFinished();
          await dependencies.runtimeSendMessage({
            type: POPUP_TAB_SNAPSHOT_MESSAGE,
            tabId: POPUP_HISTORY_TAB_ID,
            snapshot,
          });
        }
        const tabs = await telegramTabs(dependencies);
        await Promise.allSettled(
          tabs
            .filter((tab): tab is TelegramTab & { id: number } => typeof tab.id === 'number')
            .map(tab => dependencies.tabsSendMessage(tab.id, {
              type: TASK_MESSAGE_CLEAR_FINISHED,
            })),
        );
        return undefined;
      }

      if (type === POPUP_OPEN_DOWNLOADS_MESSAGE) {
        await dependencies.showDefaultFolder();
        return undefined;
      }

      if (type === TASK_MESSAGE_SNAPSHOT) {
        const tabId = sender.tab?.id;
        const snapshot = parseTaskSnapshot((message as TaskRuntimeSnapshotMessage).snapshot);
        if (typeof tabId !== 'number' || !snapshot) return undefined;

        const nextSnapshot = dependencies.history
          ? await dependencies.history.applySnapshot(snapshot)
          : snapshot;
        await dependencies.runtimeSendMessage({
          type: POPUP_TAB_SNAPSHOT_MESSAGE,
          tabId: dependencies.history ? POPUP_HISTORY_TAB_ID : tabId,
          snapshot: nextSnapshot,
        });
      }

      return undefined;
    },

    async handleTabRemoved(tabId: number) {
      if (dependencies.history) return;
      await dependencies.runtimeSendMessage({
        type: POPUP_TAB_REMOVED_MESSAGE,
        tabId,
      });
    },

    async markInterrupted() {
      if (!dependencies.history) return;
      const snapshot = await dependencies.history.markInterrupted();
      await dependencies.runtimeSendMessage({
        type: POPUP_TAB_SNAPSHOT_MESSAGE,
        tabId: POPUP_HISTORY_TAB_ID,
        snapshot,
      });
    },
  };
}
