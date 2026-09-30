import { defineContentScript } from 'wxt/utils/define-content-script';

import {
  createDownloadMenu,
  type DownloadMenu,
} from '../components/download-menu';
import '../components/download-menu/style.css';
import { saveMedia } from '../features/download/download-media';
import {
  canOpenDownloadMenu,
  findMediaAt,
} from '../features/download/media-target';
import {
  TASK_CLEAR_FINISHED_EVENT,
  TASK_REQUEST_SNAPSHOT_EVENT,
  TASK_SNAPSHOT_EVENT,
  type TaskSnapshot,
} from '../features/download/task-protocol';
import {
  createVideoTaskStore,
  type VideoTaskStore,
} from '../features/download/task-store';
import type { DownloadableMedia } from '../features/download/download-media';

export interface VideoDownloadControllerDependencies {
  menu: DownloadMenu;
  store: VideoTaskStore;
  saveMedia?: typeof saveMedia;
  publishSnapshot?: (snapshot: TaskSnapshot) => void;
}

export function createVideoDownloadController({
  menu,
  store,
  saveMedia: save = saveMedia,
  publishSnapshot = () => {},
}: VideoDownloadControllerDependencies) {
  let activeMedia: DownloadableMedia | undefined;

  return {
    selectMedia(media: DownloadableMedia) {
      activeMedia = media;
    },
    saveActiveMedia() {
      if (!activeMedia) return;
      void save(activeMedia, menu, undefined, store);
    },
    handleSnapshotRequest() {
      publishSnapshot(store.snapshot());
    },
    clearFinished() {
      // 清理只影响历史展示，不取消底层 fetch 或文件写入。
      store.clearFinished();
    },
  };
}

export function registerTaskEventHandlers(
  target: EventTarget,
  controller: Pick<ReturnType<typeof createVideoDownloadController>, 'handleSnapshotRequest' | 'clearFinished'>,
): void {
  target.addEventListener(TASK_REQUEST_SNAPSHOT_EVENT, () => {
    controller.handleSnapshotRequest();
  });
  target.addEventListener(TASK_CLEAR_FINISHED_EVENT, () => {
    controller.clearFinished();
  });
}

export default defineContentScript({
  matches: ['https://web.telegram.org/*'],
  runAt: 'document_idle',
  world: 'MAIN',
  main() {
    const store = createVideoTaskStore();
    let controller: ReturnType<typeof createVideoDownloadController> | undefined;

    const menu = createDownloadMenu(document, () => controller?.saveActiveMedia());
    controller = createVideoDownloadController({
      menu,
      store,
      publishSnapshot: snapshot => {
        globalThis.dispatchEvent(new CustomEvent<TaskSnapshot>(TASK_SNAPSHOT_EVENT, {
          detail: snapshot,
        }));
      },
    });

    store.subscribe(snapshot => {
      globalThis.dispatchEvent(new CustomEvent<TaskSnapshot>(TASK_SNAPSHOT_EVENT, {
        detail: snapshot,
      }));
    });

    registerTaskEventHandlers(globalThis, {
      handleSnapshotRequest: () => controller?.handleSnapshotRequest(),
      clearFinished: () => controller?.clearFinished(),
    });

    document.addEventListener('contextmenu', (event) => {
      const media = findMediaAt(document, event.target, event.clientX, event.clientY);
      if (!media || !canOpenDownloadMenu(menu.busy(), media)) return;

      event.preventDefault();
      controller?.selectMedia(media);
      menu.open({ x: event.clientX, y: event.clientY });
    }, true);

    document.addEventListener('pointerdown', (event) => {
      if (!menu.busy() && !menu.contains(event.target)) menu.close();
    });

    globalThis.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.busy()) menu.close();
    }, true);
  },
});
