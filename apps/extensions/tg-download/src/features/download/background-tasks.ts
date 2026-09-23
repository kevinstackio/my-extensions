import {
  parseTaskSnapshot,
  TASK_MESSAGE_CLEAR_FAILED,
  TASK_MESSAGE_GET_SNAPSHOT,
  TASK_MESSAGE_SNAPSHOT,
  type TaskRuntimeCommand,
  type TaskRuntimeSnapshotMessage,
  type TaskSnapshot,
} from './task-protocol';

export const POPUP_GET_TASKS_MESSAGE = 'tg-download:popup:get-tasks';
export const POPUP_CLEAR_FAILED_MESSAGE = 'tg-download:popup:clear-failed';
export const POPUP_OPEN_DOWNLOADS_MESSAGE = 'tg-download:popup:open-downloads';
export const POPUP_TAB_SNAPSHOT_MESSAGE = 'tg-download:popup:tab-snapshot';
export const POPUP_TAB_REMOVED_MESSAGE = 'tg-download:popup:tab-removed';

export type PopupTaskMessage =
  | { type: typeof POPUP_GET_TASKS_MESSAGE }
  | { type: typeof POPUP_CLEAR_FAILED_MESSAGE }
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

    return results.flatMap(result => (
      result.status === 'fulfilled' && result.value ? [result.value] : []
    ));
  };

  return {
    async handleMessage(message: unknown, sender: TaskMessageSender = {}) {
      if (!message || typeof message !== 'object') return undefined;
      const type = (message as { type?: unknown }).type;

      if (type === POPUP_GET_TASKS_MESSAGE) return getSnapshots();

      if (type === POPUP_CLEAR_FAILED_MESSAGE) {
        const tabs = await telegramTabs(dependencies);
        await Promise.allSettled(
          tabs
            .filter((tab): tab is TelegramTab & { id: number } => typeof tab.id === 'number')
            .map(tab => dependencies.tabsSendMessage(tab.id, {
              type: TASK_MESSAGE_CLEAR_FAILED,
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

        await dependencies.runtimeSendMessage({
          type: POPUP_TAB_SNAPSHOT_MESSAGE,
          tabId,
          snapshot,
        });
      }

      return undefined;
    },

    async handleTabRemoved(tabId: number) {
      await dependencies.runtimeSendMessage({
        type: POPUP_TAB_REMOVED_MESSAGE,
        tabId,
      });
    },
  };
}
