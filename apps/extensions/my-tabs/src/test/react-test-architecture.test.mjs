import { test } from 'vitest';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const reactBehaviorTests = [
  'components/bookmark-card.test.mjs',
  'components/bookmark-folder.test.mjs',
  'components/bookmark-list.test.mjs',
  'components/popover.test.mjs',
  'views/bookmark-dock.test.mjs',
  'views/bookmark-grid.test.mjs',
  'views/home.test.mjs',
];

const legacyTestPatterns = [
  /\bcreateBookmarkCard\b/,
  /\bcreateBookmarkFolder\b/,
  /\bcreateBookmarkList\b/,
  /\bcreatePopover\b/,
  /\brenderBookmarkDock\b/,
  /\brenderBookmarkGrid\b/,
  /\binstallBookmarks\b/,
  /\bclass FakeElement\b/,
];

const reactRuntimeSources = [
  '../components/bookmark-card/index.tsx',
  '../components/bookmark-folder/index.tsx',
  '../components/bookmark-list/index.tsx',
  '../components/popover/index.tsx',
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

// React 迁移后的行为测试必须验证真实组件，不能继续锁定待删除的原生 DOM 实现。
test('组件与视图测试只依赖 React 渲染层', async () => {
  for (const relativePath of reactBehaviorTests) {
    const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');

    for (const pattern of legacyTestPatterns) {
      assert.doesNotMatch(source, pattern, `${relativePath} 仍依赖 ${pattern}`);
    }
  }
});

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
  assert.match(app, /import type \{ Bookmark, BookmarkCollection \}/);
  assert.doesNotMatch(app, /\bobject\b|\bas Bookmark(?:Folder)?\b/);
});
