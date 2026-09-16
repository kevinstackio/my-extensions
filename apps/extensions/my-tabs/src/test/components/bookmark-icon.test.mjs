import assert from 'node:assert/strict';
import { createElement } from 'react';
import { test } from 'vitest';
import { BookmarkIcon } from '../../components/bookmark-icon/index.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

test('书签图标默认保留原始色调并使用 md 尺寸', async () => {
  const view = await renderReact(createElement(BookmarkIcon, {
    icon: 'brand/github.svg',
    name: 'GitHub',
  }));

  try {
    const icon = view.container.querySelector('img.bookmark-icon');
    assert.equal(icon.dataset.tone, 'original');
    assert.equal(icon.dataset.size, 'md');
    assert.match(icon.className, /bookmark-icon--md/);
    assert.equal(icon.getAttribute('alt'), '');
  } finally {
    await view.cleanup();
  }
});

test('自适应 SVG 图标声明主题色调并支持受控尺寸', async () => {
  const view = await renderReact(createElement(BookmarkIcon, {
    icon: 'icons/devtools.svg',
    name: 'DevTools',
    tone: 'adaptive',
    size: 'wide',
  }));

  try {
    const icon = view.container.querySelector('img.bookmark-icon');
    assert.equal(icon.dataset.tone, 'adaptive');
    assert.equal(icon.dataset.size, 'wide');
    assert.match(icon.className, /bookmark-icon--adaptive/);
    assert.match(icon.className, /bookmark-icon--wide/);
  } finally {
    await view.cleanup();
  }
});
