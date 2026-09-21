import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';

import { MediaSourceCache } from '../features/media-source/cache';
import {
  parseMediaCaptureEvent,
  parseMediaSourceQuery,
} from '../features/media-source/bridge-message';
import { parseXPostUrl } from '../features/post-url';

export default defineContentScript({
  matches: ['https://x.com/*', 'https://www.x.com/*'],
  runAt: 'document_start',
  main() {
    // 隔离世界只负责校验、缓存和响应查询，避免把页面原始响应或登录凭据带入扩展后台。
    const cache = new MediaSourceCache(() => location.href);
    const currentPostId = () => parseXPostUrl(location.href)?.postId;

    window.addEventListener('message', event => {
      // 收到页面消息时再次绑定当前帖子，防止 SPA 切页后旧媒体来源串到新帖子。
      const capture = parseMediaCaptureEvent(event.data, currentPostId());
      if (capture) cache.accept(capture);
    });

    const syncLocation = () => cache.syncLocation();
    window.addEventListener('popstate', syncLocation);
    // X 主要使用 SPA 导航，DOM 变化是清理旧缓存的补充信号；查询时还会再次校验帖子 ID。
    const navigationObserver = new MutationObserver(syncLocation);
    navigationObserver.observe(document, { childList: true, subtree: true });

    browser.runtime.onMessage.addListener(message => {
      const query = parseMediaSourceQuery(message);
      return query ? cache.get(query.postId, query.timeoutMs) : undefined;
    });
  },
});
