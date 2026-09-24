import {
  parseTaskSnapshot,
  type TaskSnapshot,
  type VideoDownloadTask,
} from './task-protocol';

export interface TaskHistoryStorage {
  get(): Promise<unknown>;
  set(snapshot: TaskSnapshot): Promise<void>;
}

export interface BrowserTaskHistoryStorage {
  get(key: string): Promise<Record<string, unknown>>;
  set(value: Record<string, unknown>): Promise<void>;
}

export const TASK_HISTORY_STORAGE_KEY = 'tg-download-task-history';

export function createBrowserTaskHistoryStorage(
  storage: BrowserTaskHistoryStorage,
): TaskHistoryStorage {
  return {
    async get() {
      const values = await storage.get(TASK_HISTORY_STORAGE_KEY);
      return values[TASK_HISTORY_STORAGE_KEY];
    },
    set(snapshot) {
      return storage.set({ [TASK_HISTORY_STORAGE_KEY]: snapshot });
    },
  };
}

export interface TaskHistoryStore {
  hydrate(): Promise<TaskSnapshot>;
  snapshot(): TaskSnapshot;
  applySnapshot(snapshot: TaskSnapshot): Promise<TaskSnapshot>;
  clearFinished(): Promise<TaskSnapshot>;
  markInterrupted(): Promise<TaskSnapshot>;
}

function cloneTask(task: VideoDownloadTask): VideoDownloadTask {
  return { ...task };
}

function cloneSnapshot(tasks: readonly VideoDownloadTask[]): TaskSnapshot {
  return { tasks: tasks.map(cloneTask) };
}

export function createTaskHistoryStore(storage: TaskHistoryStorage): TaskHistoryStore {
  const tasks = new Map<string, VideoDownloadTask>();
  let hydrated = false;
  let hydration: Promise<TaskSnapshot> | undefined;

  const storageSnapshot = (): TaskSnapshot => cloneSnapshot([...tasks.values()]);
  // Map 按首次加入顺序保存，展示快照反转后即可让最新任务位于列表顶部。
  const currentSnapshot = (): TaskSnapshot => ({
    tasks: storageSnapshot().tasks.reverse(),
  });

  const hydrate = async (): Promise<TaskSnapshot> => {
    if (hydrated) return currentSnapshot();
    if (!hydration) {
      hydration = storage.get().then(value => {
        // 存储内容来自浏览器扩展边界，解析失败时从空历史安全启动。
        const snapshot = parseTaskSnapshot(value) ?? { tasks: [] };
        tasks.clear();
        for (const task of snapshot.tasks) tasks.set(task.id, cloneTask(task));
        hydrated = true;
        return currentSnapshot();
      });
    }
    return hydration;
  };

  const persist = async (): Promise<TaskSnapshot> => {
    const snapshot = storageSnapshot();
    await storage.set(snapshot);
    return currentSnapshot();
  };

  return {
    hydrate,
    snapshot: currentSnapshot,
    async applySnapshot(snapshot) {
      await hydrate();
      for (const task of snapshot.tasks) {
        const previous = tasks.get(task.id);
        // 成功记录一旦写入历史，不允许旧的页面快照把它退回下载中。
        if (previous?.state === 'completed' && task.state !== 'completed') continue;
        tasks.set(task.id, cloneTask(task));
      }
      return persist();
    },
    async clearFinished() {
      await hydrate();
      // 下载中任务属于当前工作，不能因清理历史而被页面任务移除。
      for (const [id, task] of tasks) {
        if (task.state !== 'downloading') tasks.delete(id);
      }
      return persist();
    },
    async markInterrupted() {
      await hydrate();
      let changed = false;
      for (const task of tasks.values()) {
        if (task.state !== 'downloading') continue;
        task.state = 'failed';
        task.errorCode = 'interrupted';
        changed = true;
      }
      return changed ? persist() : currentSnapshot();
    },
  };
}
