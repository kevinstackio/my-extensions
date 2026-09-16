import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// 验证首页以固定的 24 像素内边距作为书签布局起点。
test('首页使用固定内边距', async () => {
  const app = await readFile(new URL('../entrypoints/newtab/App.tsx', import.meta.url), 'utf8');

  assert.match(app, /className="bookmarks-page min-h-screen box-border p-6"/);
  assert.match(app, /className="bookmarks flex flex-wrap items-start gap-6"/);
});
