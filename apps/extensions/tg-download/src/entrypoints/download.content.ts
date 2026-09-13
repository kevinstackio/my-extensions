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

export default defineContentScript({
  matches: ['https://web.telegram.org/*'],
  runAt: 'document_idle',
  world: 'MAIN',
  main() {
    let activeMedia: HTMLImageElement | HTMLVideoElement | undefined;
    let menu: DownloadMenu;

    menu = createDownloadMenu(document, () => {
      if (activeMedia) void saveMedia(activeMedia, menu);
    });

    document.addEventListener('contextmenu', (event) => {
      const media = findMediaAt(document, event.target, event.clientX, event.clientY);
      if (!canOpenDownloadMenu(menu.busy(), media)) return;

      event.preventDefault();
      activeMedia = media;
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
