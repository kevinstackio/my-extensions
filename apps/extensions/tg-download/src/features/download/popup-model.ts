import type { TaskSnapshot, VideoDownloadTask } from './task-protocol';

export interface PopupTask extends VideoDownloadTask {
  tabId: number;
  key: string;
}

export interface ProgressPresentation {
  mode: 'determinate' | 'indeterminate';
  percent?: number;
  label: string;
}

export interface PopupTaskProjection {
  applyTabSnapshot(tabId: number, snapshot: TaskSnapshot): void;
  removeTab(tabId: number): void;
  getTasks(): PopupTask[];
}

function getFailureLabel(errorCode?: string): string {
  const httpStatus = /^http-(\d{3})$/.exec(errorCode ?? '')?.[1];
  if (httpStatus) return `HTTP ${httpStatus}`;

  switch (errorCode) {
    case 'file-write':
      return '无法写入文件';
    case 'network':
      return '网络请求失败';
    case 'stream':
      return '读取媒体失败';
    case 'file-close':
      return '保存文件失败';
    case 'interrupted':
      return '浏览器重启后中断';
    default:
      return '下载失败';
  }
}

function cloneTask(task: PopupTask): PopupTask {
  return { ...task };
}

export function createPopupTaskProjection(): PopupTaskProjection {
  const tasks = new Map<string, PopupTask>();

  return {
    applyTabSnapshot(tabId, snapshot) {
      // 同一来源的快照整体替换，避免已被清理的终态任务残留在 Popup。
      for (const [key, task] of tasks) {
        if (task.tabId === tabId) tasks.delete(key);
      }

      for (const task of snapshot.tasks) {
        const key = `${tabId}:${task.id}`;
        tasks.set(key, {
          ...task,
          tabId,
          key,
        });
      }
    },

    removeTab(tabId) {
      for (const [key, task] of tasks) {
        if (task.tabId === tabId) tasks.delete(key);
      }
    },

    getTasks() {
      return [...tasks.values()].map(cloneTask);
    },
  };
}

export function getProgressPresentation(task: VideoDownloadTask): ProgressPresentation {
  if (task.state === 'completed') {
    return {
      mode: 'determinate',
      percent: 100,
      label: '下载完成',
    };
  }

  const failureLabel = task.state === 'failed' ? getFailureLabel(task.errorCode) : undefined;
  const labelForUnknownTotal = failureLabel ?? '下载中';
  if (!task.totalBytes || task.totalBytes <= 0) {
    return {
      mode: 'indeterminate',
      label: labelForUnknownTotal,
    };
  }

  const percent = Math.max(0, Math.min(100, Math.round((task.loadedBytes / task.totalBytes) * 100)));
  return {
    mode: 'determinate',
    percent,
    label: failureLabel ?? `${percent}%`,
  };
}

export function hasClearableTasks(tasks: readonly VideoDownloadTask[]): boolean {
  // 下载中的任务不可清理，按钮只在存在终态记录时启用。
  return tasks.some(task => task.state !== 'downloading');
}
