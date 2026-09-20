import { defineContentScript } from 'wxt/utils/define-content-script';

import { installPageMediaObserver } from '../features/media-source/page-observer';

export default defineContentScript({
  matches: ['https://x.com/*', 'https://www.x.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    installPageMediaObserver(window);
  },
});
