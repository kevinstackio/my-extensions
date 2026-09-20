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
    const cache = new MediaSourceCache(() => location.href);
    const currentPostId = () => parseXPostUrl(location.href)?.postId;

    window.addEventListener('message', event => {
      const capture = parseMediaCaptureEvent(event.data, currentPostId());
      if (capture) cache.accept(capture);
    });

    const syncLocation = () => cache.syncLocation();
    window.addEventListener('popstate', syncLocation);
    const navigationObserver = new MutationObserver(syncLocation);
    navigationObserver.observe(document, { childList: true, subtree: true });

    browser.runtime.onMessage.addListener(message => {
      const query = parseMediaSourceQuery(message);
      return query ? cache.get(query.postId, query.timeoutMs) : undefined;
    });
  },
});
