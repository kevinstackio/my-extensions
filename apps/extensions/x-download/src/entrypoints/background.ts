import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { handleThemeMessage } from '../features/theme';
import { enqueueCurrentTab } from '../features/native-messaging/background-communication';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message) => {
    if (message && typeof message === 'object' && 'type' in message && message.type === 'enqueue-current-tab') {
      return enqueueCurrentTab({
        getActiveTab: async () => (await browser.tabs.query({ active: true, currentWindow: true }))[0],
        sendNativeMessage: (host, request) => browser.runtime.sendNativeMessage(host, request as object),
      });
    }
    return handleThemeMessage(message, options => browser.action.setIcon(options));
  });
});
