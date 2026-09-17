import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { act, createElement, Fragment } from 'react';
import { BOOKMARK_GRID, DOCK_COMPONENTS, DOCK_DEVTOOLS, DOCK_FAVORITES } from '../../constants/bookmarks.ts';
import { installActionIconTheme } from '../../utils/action-icon-theme.js';
import { openBookmarkInGroup } from '../../utils/tab.js';
import { BookmarkDock } from '../../views/bookmarks/bookmark-dock.tsx';
import { BookmarkGrid } from '../../views/bookmarks/bookmark-grid.tsx';
import { TooltipProvider } from '../../components/ui/tooltip.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

function createHome(onOpenBookmark) {
  return createElement(
    TooltipProvider,
    null,
    createElement(
      Fragment,
      null,
      createElement('main', { className: 'bookmarks-page' },
        createElement('section', { className: 'bookmarks', 'data-bookmarks': true, 'aria-label': '常用书签' },
          createElement(BookmarkGrid, { bookmarks: BOOKMARK_GRID, onOpenBookmark }))),
      createElement('aside', { 'data-bookmark-dock': true, 'aria-label': '固定书签' },
        createElement(BookmarkDock, {
          favorites: DOCK_FAVORITES,
          components: DOCK_COMPONENTS,
          devtools: DOCK_DEVTOOLS,
          onOpenBookmark,
        })),
    ),
  );
}

test('React 首页组合主书签 Grid 与固定 Dock', async () => {
  const appSource = await readFile(new URL('../../entrypoints/newtab/App.tsx', import.meta.url), 'utf8');
  const view = await renderReact(createHome());

  try {
    assert.match(appSource, /<BookmarkGrid bookmarks=\{BOOKMARK_GRID\} onOpenBookmark=\{onOpenBookmark\}/);
    assert.match(appSource, /<BookmarkDock[\s\S]*favorites=\{DOCK_FAVORITES\}[\s\S]*onOpenBookmark=\{onOpenBookmark\}/);
    assert.equal((appSource.match(/<TooltipProvider>/g) ?? []).length, 1);
    assert.equal(view.container.querySelectorAll('[data-bookmarks] .bookmark-folder').length, BOOKMARK_GRID.length);
    assert.equal(view.container.querySelectorAll('[data-bookmark-dock] .bookmark-dock__favorites > .bookmark-card').length, DOCK_FAVORITES.length);
    assert.equal(view.container.querySelectorAll('.bookmark-dock__group').length, 2);
  } finally {
    await view.cleanup();
  }
});

test('React 首页将 Dock 工具书签交给 Chrome 标签组业务', async () => {
  const previousChrome = globalThis.chrome;
  const calls = { created: null, grouped: null, updated: null };
  globalThis.chrome = {
    runtime: { getURL: (path) => `chrome-extension://mytabs/${path}` },
    action: { setIcon() {} },
    tabs: {
      create: async (options) => { calls.created = options; return { id: 1, windowId: 2 }; },
      group: async (options) => { calls.grouped = options; return 3; },
    },
    tabGroups: {
      query: async () => [],
      update: async (groupId, options) => { calls.updated = { groupId, options }; },
    },
  };
  const view = await renderReact(createHome((group, bookmark) => {
    void openBookmarkInGroup(globalThis.chrome, group, bookmark);
  }));

  try {
    const devtools = view.container.querySelectorAll('.bookmark-dock__group')[1];
    await act(async () => devtools.querySelector('button').click());
    await act(async () => {
      devtools.querySelector('.bookmark-list__item').click();
      await Promise.resolve();
      await Promise.resolve();
    });
    assert.deepEqual(calls.created, { url: 'https://translate.google.com/?hl=zh-cn&sl=en&tl=zh-CN&op=translate', active: true });
    assert.deepEqual(calls.grouped, { tabIds: [1] });
    assert.equal(calls.updated.groupId, 3);
    assert.equal(calls.updated.options.title, 'DevTools');
  } finally {
    await view.cleanup();
    if (previousChrome === undefined) delete globalThis.chrome;
    else globalThis.chrome = previousChrome;
  }
});

test('首页根据系统配色切换工具栏图标', () => {
  const listeners = new Set();
  const media = {
    matches: true,
    addEventListener: (type, listener) => { if (type === 'change') listeners.add(listener); },
  };
  const actionCalls = [];
  const favicon = { setAttribute(name, value) { this[name] = value; } };
  const previousChrome = globalThis.chrome;
  globalThis.chrome = {
    runtime: { getURL: (path) => `chrome-extension://test/${path}` },
    action: { setIcon: (details) => actionCalls.push(details) },
  };

  try {
    installActionIconTheme({ matchMedia: () => media }, {
      querySelector: (selector) => selector === 'link[rel="icon"]' ? favicon : null,
    });
    assert.equal(actionCalls[0].path[16], '/src/assets/logo/my-tabs-light-16.png');
    assert.equal(favicon.href, 'chrome-extension://test/src/assets/logo/my-tabs-light-16.png');

    media.matches = false;
    for (const listener of listeners) listener(media);
    assert.equal(actionCalls.at(-1).path[128], '/src/assets/logo/my-tabs-dark-128.png');
    assert.equal(favicon.href, 'chrome-extension://test/src/assets/logo/my-tabs-dark-16.png');
  } finally {
    if (previousChrome === undefined) delete globalThis.chrome;
    else globalThis.chrome = previousChrome;
  }
});

test('首页使用独立页面容器样式', async () => {
  const app = await readFile(new URL('../../entrypoints/newtab/App.tsx', import.meta.url), 'utf8');

  assert.match(app, /className="bookmarks-page min-h-screen box-border p-6"/);
});
