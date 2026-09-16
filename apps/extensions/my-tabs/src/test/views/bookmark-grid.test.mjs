import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { BOOKMARK_GRID } from '../../constants/bookmarks.ts';
import { BookmarkGrid } from '../../views/bookmarks/bookmark-grid.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

test('独立 Grid View 按配置顺序渲染首页书签文件夹', async () => {
  const view = await renderReact(createElement('section', { className: 'bookmarks' },
    createElement(BookmarkGrid, { bookmarks: BOOKMARK_GRID })));

  try {
    const grid = view.container.querySelector('.bookmarks');
    const folders = grid.querySelectorAll('.bookmark-folder');
    assert.equal(folders.length, BOOKMARK_GRID.length);
    assert.equal(folders[0].querySelectorAll('.bookmark-folder__preview > *').length, 4);
    assert.equal(folders[2].querySelector('.bookmark-folder__name').textContent, 'PM');
  } finally {
    await view.cleanup();
  }
});

test('独立 Grid View 使用文件夹自动换行布局', async () => {
  const app = await readFile(new URL('../../entrypoints/newtab/App.tsx', import.meta.url), 'utf8');

  assert.match(app, /className="bookmarks flex flex-wrap items-start gap-6"/);
  assert.doesNotMatch(app, /grid-template-columns|grid-auto-rows|grid-auto-flow/);
});
