import { createRoot } from 'react-dom/client';

import { App } from './App';

const container = document.getElementById('app');

if (!container) {
  throw new Error('My Tabs React 根节点不存在。');
}

createRoot(container).render(<App />);
