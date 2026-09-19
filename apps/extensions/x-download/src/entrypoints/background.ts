import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { parseXPostUrl } from '../features/post-url';
import { handleThemeMessage } from '../features/theme';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message) => {
    return handleThemeMessage(message, options => browser.action.setIcon(options));
  });

  browser.action.onClicked.addListener((tab) => {
    const target = parseXPostUrl(tab.url);
    if (!target) return;

    // 当前版本只建立单篇帖子目标，后续 Helper 接入时在这里消费 target。
  });
});
