import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { handleThemeMessage } from '../features/theme';
import {
  enqueueCurrentTab,
  getPopupTaskState,
  POPUP_CLEAR_FAILED_MESSAGE,
  POPUP_GET_STATE_MESSAGE,
  POPUP_OPEN_DOWNLOADS_MESSAGE,
  sendPopupAction,
} from '../features/native-messaging/background-communication';

export default defineBackground(() => {
  const sendNativeMessage = (host: string, request: unknown) => browser.runtime.sendNativeMessage(host, request as object);

  browser.runtime.onMessage.addListener((message) => {
    if (message && typeof message === 'object' && 'type' in message && message.type === 'enqueue-current-tab') {
      return enqueueCurrentTab({
        getActiveTab: async () => (await browser.tabs.query({ active: true, currentWindow: true }))[0],
        getMediaSources: (tabId, postId, timeoutMs) => browser.tabs.sendMessage(tabId, {
          type: 'media-source.get-current',
          postId,
          timeoutMs,
        }),
        notifyPage: (tabId, message) => browser.tabs.sendMessage(tabId, message),
        sendNativeMessage,
      });
    }
    if (message && typeof message === 'object' && 'type' in message && message.type === POPUP_GET_STATE_MESSAGE) {
      return getPopupTaskState({ sendNativeMessage });
    }
    if (message && typeof message === 'object' && 'type' in message
      && (message.type === POPUP_OPEN_DOWNLOADS_MESSAGE || message.type === POPUP_CLEAR_FAILED_MESSAGE)) {
      return sendPopupAction(
        message.type === POPUP_OPEN_DOWNLOADS_MESSAGE ? 'popup.open-downloads' : 'popup.clear-failed',
        { sendNativeMessage },
      );
    }
    return handleThemeMessage(message, options => browser.action.setIcon(options));
  });
});
