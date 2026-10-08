import { defineContentScript } from 'wxt/utils/define-content-script';

import { installPageMediaObserver } from '../features/media-source/page-observer';

export default defineContentScript({
  matches: ['https://x.com/*', 'https://www.x.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    // 只能在页面主世界观察 fetch/XHR：这里复用 X 当前登录会话，但只读取响应副本，不改写页面请求。
    installPageMediaObserver(window);
  },
});
