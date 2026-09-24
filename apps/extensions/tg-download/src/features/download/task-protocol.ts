import type { TaskSnapshot, VideoDownloadTask } from './task-store';

export type { TaskSnapshot, VideoDownloadTask } from './task-store';

export const TASK_SNAPSHOT_EVENT = 'tg-download:task-snapshot';
export const TASK_REQUEST_SNAPSHOT_EVENT = 'tg-download:task-request-snapshot';
export const TASK_CLEAR_FINISHED_EVENT = 'tg-download:task-clear-finished';

export const TASK_MESSAGE_GET_SNAPSHOT = 'tg-download:tasks:get-snapshot';
export const TASK_MESSAGE_CLEAR_FINISHED = 'tg-download:tasks:clear-finished';
export const TASK_MESSAGE_SNAPSHOT = 'tg-download:tasks:snapshot';
export const TASK_MESSAGE_TAB_REMOVED = 'tg-download:tasks:tab-removed';

export type TaskRuntimeCommand =
  | { type: typeof TASK_MESSAGE_GET_SNAPSHOT }
  | { type: typeof TASK_MESSAGE_CLEAR_FINISHED };

export interface TaskRuntimeSnapshotMessage {
  type: typeof TASK_MESSAGE_SNAPSHOT;
  snapshot: TaskSnapshot;
}

export type TaskRuntimeMessage = TaskRuntimeCommand | TaskRuntimeSnapshotMessage;

const MAX_ID_LENGTH = 128;
const MAX_FILENAME_LENGTH = 512;
const MAX_ERROR_CODE_LENGTH = 128;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every(key => keys.includes(key));
}

function isValidTask(value: unknown): value is VideoDownloadTask {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    'id',
    'filename',
    'state',
    'loadedBytes',
    'totalBytes',
    'errorCode',
  ])) return false;

  if (
    typeof value.id !== 'string'
    || value.id.length === 0
    || value.id.length > MAX_ID_LENGTH
    || typeof value.filename !== 'string'
    || value.filename.length === 0
    || value.filename.length > MAX_FILENAME_LENGTH
    || (
      value.state !== 'downloading'
      && value.state !== 'completed'
      && value.state !== 'failed'
    )
    || typeof value.loadedBytes !== 'number'
    || !Number.isFinite(value.loadedBytes)
    || value.loadedBytes < 0
  ) return false;

  if (value.totalBytes !== undefined) {
    if (
      typeof value.totalBytes !== 'number'
      || !Number.isFinite(value.totalBytes)
      || value.totalBytes < 0
      || value.loadedBytes > value.totalBytes
    ) return false;
  }

  if (
    value.errorCode !== undefined
    && (
      typeof value.errorCode !== 'string'
      || value.errorCode.length > MAX_ERROR_CODE_LENGTH
    )
  ) return false;

  return true;
}

export function isTaskSnapshot(value: unknown): value is TaskSnapshot {
  if (!isRecord(value) || !hasOnlyKeys(value, ['tasks']) || !Array.isArray(value.tasks)) {
    return false;
  }

  return value.tasks.every(isValidTask);
}

export function parseTaskSnapshot(value: unknown): TaskSnapshot | undefined {
  if (!isTaskSnapshot(value)) return undefined;

  return {
    tasks: value.tasks.map(task => ({ ...task })),
  };
}
