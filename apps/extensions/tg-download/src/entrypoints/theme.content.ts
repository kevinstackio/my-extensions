import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';

import { installDownloadAssetStyles } from '../features/download-assets';
import { watchSystemTheme } from '../features/theme';

export default defineContentScript({
  matches: ['https://web.telegram.org/*'],
  runAt: 'document_start',
  main() {
    installDownloadAssetStyles(document, path => browser.runtime.getURL(path));

    const colorScheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
    if (!colorScheme) return;

    watchSystemTheme(colorScheme, message => {
      void browser.runtime.sendMessage(message);
    });
  },
});
