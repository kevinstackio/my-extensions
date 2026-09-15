import test from 'node:test';
import assert from 'node:assert/strict';
import { act, createElement } from 'react';
import { BookmarkCard } from '../components/bookmark-card/index.js';
import { BookmarkFolder } from '../components/bookmark-folder/index.js';
import { Popover } from '../components/popover/index.js';
import { renderReact } from './helpers/react-dom.mjs';

const bookmark = {
  id: 'github',
  name: 'GitHub',
  url: 'https://github.com',
  icon: 'brand/github.svg',
};

test('React BookmarkCard 保留安全链接、图标资源和名称语义', async () => {
  const previousChrome = globalThis.chrome;
  globalThis.chrome = { runtime: { getURL: (path) => `chrome-extension://mytabs/${path}` } };
  const view = await renderReact(createElement(BookmarkCard, { bookmark }));

  try {
    const card = view.container.querySelector('a.bookmark-card');
    assert.ok(card);
    assert.equal(card.getAttribute('href'), bookmark.url);
    assert.equal(card.getAttribute('target'), '_blank');
    assert.equal(card.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(card.getAttribute('aria-label'), '在新标签页打开 GitHub');
    assert.equal(card.querySelector('img').getAttribute('src'), 'chrome-extension://mytabs/src/assets/brand/github.svg');
    assert.equal(card.querySelector('.bookmark-card__name').textContent, 'GitHub');
  } finally {
    await view.cleanup();
    if (previousChrome === undefined) delete globalThis.chrome;
    else globalThis.chrome = previousChrome;
  }
});

test('React BookmarkFolder 解除遮罩后聚焦首个书签并上报打开事件', async () => {
  const previousChrome = globalThis.chrome;
  globalThis.chrome = { runtime: { getURL: (path) => `chrome-extension://mytabs/${path}` } };
  const folder = {
    name: 'EDU',
    blur: true,
    items: [bookmark],
  };
  const opened = [];
  const view = await renderReact(createElement(BookmarkFolder, {
    folder,
    onOpenBookmark: (targetFolder, targetBookmark) => opened.push({ targetFolder, targetBookmark }),
  }));

  try {
    const root = view.container.querySelector('.bookmark-folder');
    const firstBookmark = root.querySelector('a.bookmark-card');
    const blurButton = root.querySelector('button.bookmark-folder__blur');
    assert.match(root.className, /bookmark-folder--blurred/);
    await act(async () => {
      blurButton.click();
    });
    assert.equal(view.document.activeElement, firstBookmark);
    assert.equal(root.className, 'bookmark-folder');
    await act(async () => {
      firstBookmark.click();
    });
    assert.deepEqual(opened, [{ targetFolder: folder, targetBookmark: bookmark }]);
  } finally {
    await view.cleanup();
    if (previousChrome === undefined) delete globalThis.chrome;
    else globalThis.chrome = previousChrome;
  }
});

test('React Popover 渲染触发器和浮层语义', async () => {
  const trigger = createElement('button', { type: 'button', className: 'trigger' }, 'Tools');
  const view = await renderReact(createElement(Popover, {
    trigger,
    children: createElement('ul', { className: 'content' }, createElement('li', null, 'Item')),
  }));

  try {
    const button = view.container.querySelector('button.trigger');
    const popover = view.container.querySelector('section.popover');
    await act(async () => {
      button.click();
    });
    assert.equal(popover.hidden, false);
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    assert.equal(popover.dataset.placement, 'top');
  } finally {
    await view.cleanup();
  }
});
