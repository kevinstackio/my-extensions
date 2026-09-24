import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { createBackgroundTaskHandler } from '../features/download/background-tasks';
import {
  createBrowserTaskHistoryStorage,
  createTaskHistoryStore,
} from '../features/download/task-history';
import { handleThemeMessage } from '../features/theme';

export default defineBackground(() => {
  const history = createTaskHistoryStore(createBrowserTaskHistoryStorage({
    get: key => browser.storage.local.get(key),
    set: value => browser.storage.local.set(value),
  }));
  const taskHandler = createBackgroundTaskHandler({
    tabsQuery: query => browser.tabs.query(query),
    tabsSendMessage: (tabId, message) => browser.tabs.sendMessage(tabId, message),
    runtimeSendMessage: message => browser.runtime.sendMessage(message),
    showDefaultFolder: () => browser.downloads.showDefaultFolder(),
    history,
  });

  // 内容脚本读取系统主题，后台入口负责更新浏览器工具栏图标。
  browser.runtime.onMessage.addListener((message, sender) => {
    handleThemeMessage(message, options => browser.action.setIcon(options));
    return taskHandler.handleMessage(message, sender);
  });

  browser.tabs.onRemoved.addListener(tabId => {
    void taskHandler.handleTabRemoved(tabId);
  });

  browser.runtime.onStartup.addListener(() => {
    void taskHandler.markInterrupted();
  });
});
