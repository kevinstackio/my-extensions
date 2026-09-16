import { test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement } from 'react';
import { BookmarkList } from '../../components/bookmark-list/index.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

const translate = {
  id: 'google-translate',
  name: 'Google Translate',
  url: 'https://translate.google.com',
  icon: 'tools/google-translate.png',
};

test('书签列表将工具配置渲染为安全的新标签页链接', async () => {
  const view = await renderReact(createElement(BookmarkList, { bookmarks: [translate] }));

  try {
    const link = view.container.querySelector('.bookmark-list__item');
    assert.equal(link.getAttribute('href'), translate.url);
    assert.equal(link.getAttribute('target'), '_blank');
    assert.equal(link.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(link.querySelector('img').getAttribute('src'), 'src/assets/tools/google-translate.png');
    assert.equal(link.querySelector('span').textContent, 'Google Translate');
    assert.match(link.className, /whitespace-nowrap/);
    assert.match(link.querySelector('span').className, /whitespace-nowrap/);
  } finally {
    await view.cleanup();
  }
});

test('书签列表可将点击事件交给外层处理，而不耦合浏览器业务', async () => {
  let selectedBookmark;
  const view = await renderReact(createElement(BookmarkList, {
    bookmarks: [translate],
    onSelect: (bookmark) => { selectedBookmark = bookmark; },
  }));

  try {
    await act(async () => view.container.querySelector('a').click());
    assert.equal(selectedBookmark, translate);
  } finally {
    await view.cleanup();
  }
});

test('书签列表使用 16 像素图标与横向链接行', async () => {
  const view = await renderReact(createElement(BookmarkList, { bookmarks: [translate] }));

  try {
    const link = view.container.querySelector('.bookmark-list__item');
    const icon = link.querySelector('img');
    assert.match(link.className, /flex/);
    assert.match(link.className, /items-center/);
    assert.match(icon.className, /h-4/);
    assert.match(icon.className, /w-4/);
    assert.match(link.querySelector('span').className, /font-medium/);
  } finally {
    await view.cleanup();
  }
});
