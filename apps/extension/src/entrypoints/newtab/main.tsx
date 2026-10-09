import '../../styles/index.css';

import { createRoot } from 'react-dom/client';
import { browser } from 'wxt/browser';

import { App } from '../../app/NewtabApp';

// 覆盖页面显式使用完整扩展资源地址，避免浏览器内置页地址参与 favicon 解析。
const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (favicon) {
  favicon.type = 'image/png';
  favicon.sizes.value = '32x32';
  favicon.href = browser.runtime.getURL('/src/assets/logo/exts-32.png');
}

// WXT 只负责提供页面容器，React 从这里接管新标签页的渲染生命周期。
const container = document.getElementById('app');

if (!container) {
  throw new Error('exts React 根节点不存在。');
}

createRoot(container).render(<App />);
