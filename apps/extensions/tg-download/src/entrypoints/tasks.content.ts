import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';

import {
  parseTaskSnapshot,
  TASK_CLEAR_FAILED_EVENT,
  TASK_MESSAGE_CLEAR_FAILED,
  TASK_MESSAGE_GET_SNAPSHOT,
  TASK_MESSAGE_SNAPSHOT,
  TASK_REQUEST_SNAPSHOT_EVENT,
  TASK_SNAPSHOT_EVENT,
  type TaskSnapshot,
} from '../features/download/task-protocol';

const SNAPSHOT_TIMEOUT_MS = 1000;

interface PendingSnapshotRequest {
  resolve(snapshot: TaskSnapshot | undefined): void;
  timeout: ReturnType<typeof setTimeout>;
}

export function createSnapshotRequestQueue(timeoutMs = SNAPSHOT_TIMEOUT_MS) {
  const pending = new Set<PendingSnapshotRequest>();

  return {
    request(dispatch: () => void): Promise<TaskSnapshot | undefined> {
      return new Promise((resolve) => {
        const request: PendingSnapshotRequest = {
          resolve,
          timeout: globalThis.setTimeout(() => {
            pending.delete(request);
            resolve(undefined);
          }, timeoutMs),
        };
        pending.add(request);
        dispatch();
      });
    },

    resolve(snapshot: TaskSnapshot) {
      for (const request of [...pending]) {
        globalThis.clearTimeout(request.timeout);
        pending.delete(request);
        request.resolve(snapshot);
      }
    },

    pendingCount() {
      return pending.size;
    },
  };
}

export default defineContentScript({
  matches: ['https://web.telegram.org/*'],
  runAt: 'document_idle',
  main() {
    const snapshotQueue = createSnapshotRequestQueue();

    globalThis.addEventListener(TASK_SNAPSHOT_EVENT, (event) => {
      if (!('detail' in event)) return;
      const snapshot = parseTaskSnapshot(event.detail);
      if (!snapshot) return;

      snapshotQueue.resolve(snapshot);
      void browser.runtime.sendMessage({ type: TASK_MESSAGE_SNAPSHOT, snapshot });
    });

    browser.runtime.onMessage.addListener((message: unknown) => {
      if (!message || typeof message !== 'object') return undefined;
      const type = (message as { type?: unknown }).type;

      if (type === TASK_MESSAGE_GET_SNAPSHOT) {
        return snapshotQueue.request(() => {
          globalThis.dispatchEvent(new Event(TASK_REQUEST_SNAPSHOT_EVENT));
        });
      }
      if (type === TASK_MESSAGE_CLEAR_FAILED) {
        globalThis.dispatchEvent(new Event(TASK_CLEAR_FAILED_EVENT));
      }
      return undefined;
    });
  },
});
