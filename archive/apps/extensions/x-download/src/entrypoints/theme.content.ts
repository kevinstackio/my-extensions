import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';

import { watchSystemTheme } from '../features/theme';

export default defineContentScript({
  matches: ['https://x.com/*', 'https://www.x.com/*'],
  runAt: 'document_start',
  main() {
    const colorScheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
    if (!colorScheme) return;

    watchSystemTheme(colorScheme, message => {
      void browser.runtime.sendMessage(message);
    });
  },
});
