import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { act, createElement } from 'react';
import { DOCK_COMPONENTS, DOCK_DEVTOOLS, DOCK_FAVORITES } from '../../constants/bookmarks.ts';
import { BookmarkDock } from '../../views/bookmarks/bookmark-dock.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

test('Dock 将收藏、Components 和 DevTools 按固定顺序渲染', async () => {
  const view = await renderReact(createElement(BookmarkDock, {
    favorites: DOCK_FAVORITES,
    components: DOCK_COMPONENTS,
    devtools: DOCK_DEVTOOLS,
  }));

  try {
    const dock = view.container.querySelector('.bookmark-dock');
    const groups = dock.querySelectorAll('.bookmark-dock__group');
    assert.equal(dock.querySelectorAll('.bookmark-dock__favorites > .bookmark-card').length, DOCK_FAVORITES.length);
    assert.equal(dock.querySelector('.bookmark-dock__divider').getAttribute('aria-hidden'), 'true');
    assert.equal(groups.length, 2);
    assert.equal(groups[0].querySelector('button').getAttribute('aria-label'), '打开 Components 工具列表');
    assert.equal(groups[1].querySelector('button').getAttribute('aria-label'), '打开 DevTools 工具列表');
  } finally {
    await view.cleanup();
  }
});

test('Dock 中选择工具后将书签与所属分组交给外层业务', async () => {
  const opened = [];
  const view = await renderReact(createElement(BookmarkDock, {
    favorites: DOCK_FAVORITES,
    components: DOCK_COMPONENTS,
    devtools: DOCK_DEVTOOLS,
    onOpenBookmark: (group, bookmark) => opened.push({ group, bookmark }),
  }));

  try {
    const devtoolsGroup = view.container.querySelectorAll('.bookmark-dock__group')[1];
    await act(async () => devtoolsGroup.querySelector('button').click());
    const toolLink = devtoolsGroup.querySelector('.bookmark-list__item');
    assert.equal(toolLink.textContent, 'Google Translate');
    await act(async () => toolLink.click());
    assert.deepEqual(opened, [{ group: DOCK_DEVTOOLS, bookmark: DOCK_DEVTOOLS.bookmarks[0] }]);
  } finally {
    await view.cleanup();
  }
});

test('Dock View 使用收藏分隔线，并让工具分组无分割线并列', async () => {
  const styles = await readFile(new URL('../../views/bookmarks/bookmark-dock.css', import.meta.url), 'utf8');

  assert.match(styles, /\.bookmark-dock__divider\s*\{[^}]*width:\s*1px;[^}]*height:\s*64px;[^}]*background:\s*#e4e4e7;/s);
  assert.match(styles, /\.bookmark-dock__favorites\s*\{[^}]*display:\s*flex;[^}]*gap:\s*8px;/s);
  assert.match(styles, /\.bookmark-dock__tools\s*\{[^}]*display:\s*flex;[^}]*gap:\s*8px;/s);
  assert.match(styles, /\.bookmark-dock__group\s*\{[^}]*position:\s*relative;/s);
  assert.match(styles, /\.bookmark-dock__group \.popover\s*\{[^}]*left:\s*50%;[^}]*transform:\s*translateX\(-50%\);/s);
  assert.match(styles, /\.bookmark-dock__group \.popover\s*\{[^}]*min-width:\s*160px;/s);
  assert.doesNotMatch(styles, /\.bookmark-dock__tools\s*\{[^}]*border(?:-left|-right)?:/s);
  assert.match(styles, /\.bookmark-dock__tool\[aria-expanded='true'\] \.bookmark-card__icon\s*\{[^}]*transform:\s*none;/s);
});
