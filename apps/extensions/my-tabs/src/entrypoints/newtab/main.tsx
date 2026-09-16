import '../../styles/index.css';

import { createRoot } from 'react-dom/client';

import { App } from './App';

// WXT 只负责提供页面容器，React 从这里接管新标签页的渲染生命周期。
const container = document.getElementById('app');

if (!container) {
  throw new Error('My Tabs React 根节点不存在。');
}

createRoot(container).render(<App />);
