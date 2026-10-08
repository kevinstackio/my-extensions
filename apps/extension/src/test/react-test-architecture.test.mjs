import { test } from 'vitest';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const reactRuntimeSources = [
  '../components/bookmark-card/index.tsx',
  '../components/ui/dropdown-menu.tsx',
  '../components/bookmark-folder/index.tsx',
  '../views/bookmarks/dock-tool-menu.tsx',
  '../views/bookmarks/bookmark-dock.tsx',
  '../views/bookmarks/bookmark-grid.tsx',
  '../constants/bookmarks.ts',
];

const legacyRuntimePatterns = [
  /\bcreateBookmarkCard\b/,
  /\bcreateBookmarkFolder\b/,
  /\bcreateBookmarkList\b/,
  /\bcreatePopover\b/,
  /\brenderBookmarkDock\b/,
  /\brenderBookmarkGrid\b/,
];

// 页面运行时只保留 React 组件，并通过共享类型连接入口、书签数据与业务回调。
test('React 运行时不存在原生 DOM 双轨实现和弱类型入口', async () => {
  for (const relativePath of reactRuntimeSources) {
    const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');

    for (const pattern of legacyRuntimePatterns) {
      assert.doesNotMatch(source, pattern, `${relativePath} 仍包含 ${pattern}`);
    }
  }

  const app = await readFile(new URL('../entrypoints/newtab/App.tsx', import.meta.url), 'utf8');
  await access(new URL('../types/bookmarks.ts', import.meta.url));
  await assert.rejects(access(new URL('../constants/bookmarks.js', import.meta.url)));
  await assert.rejects(access(new URL('../views/home/index.js', import.meta.url)));
  assert.doesNotMatch(app, /\bobject\b|\bas Bookmark(?:Folder)?\b/);
});

test('组件迁移后删除旧 Popover 与 BookmarkList 运行时及样式入口', async () => {
  const styles = await readFile(new URL('../styles/index.css', import.meta.url), 'utf8');
  const dock = await readFile(new URL('../views/bookmarks/bookmark-dock.tsx', import.meta.url), 'utf8');
  const legacyImports = [
    'bookmark-card/index.css',
    'bookmark-folder/index.css',
    'bookmark-list/index.css',
    'bookmark-dock.css',
    'bookmark-grid.css',
    'views/home/index.css',
  ];

  for (const legacyImport of legacyImports) {
    assert.doesNotMatch(styles, new RegExp(legacyImport.replaceAll('.', '\\.'), 'u'), legacyImport);
  }
  assert.doesNotMatch(styles, /components\/popover\/index\.css/);
  assert.match(dock, /components\/ui\/separator/);
  await assert.rejects(access(new URL('../components/popover/index.tsx', import.meta.url)));
  await assert.rejects(access(new URL('../components/popover/index.css', import.meta.url)));
  await assert.rejects(access(new URL('../components/bookmark-list/index.tsx', import.meta.url)));
  await assert.rejects(access(new URL('../components/ui/popover.tsx', import.meta.url)));
});

test('通用 DropdownMenu 不依赖书签、Dock 图标或浏览器业务', async () => {
  const source = await readFile(new URL('../components/ui/dropdown-menu.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /types\/bookmarks|constants\/bookmarks|DockIconView|chrome\.|openBookmark/);
});
