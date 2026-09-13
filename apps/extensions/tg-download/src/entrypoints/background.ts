import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { handleThemeMessage } from '../features/theme';

export default defineBackground(() => {
  // 内容脚本读取系统主题，后台入口负责更新浏览器工具栏图标。
  browser.runtime.onMessage.addListener((message) => {
    return handleThemeMessage(message, options => browser.action.setIcon(options));
  });
});
