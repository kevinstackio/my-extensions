import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { BookmarkCard } from '../../components/bookmark-card/index.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

const github = {
  id: 'github',
  name: 'GitHub',
  url: 'https://github.com',
  icon: 'brand/github.svg',
};

// 验证 React 书签卡片使用扩展资源地址并安全地在新标签页打开链接。
test('通用书签卡片展示品牌图标与名称', async () => {
  const previousChrome = globalThis.chrome;
  globalThis.chrome = { runtime: { getURL: (path) => `chrome-extension://mytabs/${path}` } };
  const view = await renderReact(createElement(BookmarkCard, { bookmark: github }));

  try {
    const item = view.container.querySelector('a.bookmark-card');
    const icon = item.querySelector('img');

    assert.equal(item.getAttribute('href'), github.url);
    assert.equal(item.getAttribute('target'), '_blank');
    assert.equal(item.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(item.getAttribute('aria-label'), '在新标签页打开 GitHub');
    assert.equal(icon.getAttribute('src'), 'chrome-extension://mytabs/src/assets/brand/github.svg');
    assert.equal(icon.getAttribute('alt'), '');
    assert.equal(icon.getAttribute('aria-hidden'), 'true');
    assert.equal(item.querySelector('.bookmark-card__name').textContent, 'GitHub');
  } finally {
    await view.cleanup();
    if (previousChrome === undefined) delete globalThis.chrome;
    else globalThis.chrome = previousChrome;
  }
});

// 验证通用书签卡片名称使用较高字重以提高辨识度。
test('通用书签卡片名称使用加粗字重', async () => {
  const styles = await readFile(new URL('../../components/bookmark-card/index.css', import.meta.url), 'utf8');

  assert.match(styles, /\.bookmark-card__name\s*\{[^}]*font-weight:\s*600/s);
});

// 验证通用书签卡片图标固定为 64 像素方形，SVG 保持居中的 32 像素尺寸。
test('通用书签卡片图标使用固定尺寸与独立圆角', async () => {
  const styles = await readFile(new URL('../../components/bookmark-card/index.css', import.meta.url), 'utf8');

  assert.match(styles, /\.bookmark-card__icon\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*64px;[^}]*height:\s*64px;[^}]*border-radius:\s*16px;/s);
  assert.match(styles, /\.bookmark-card__icon img\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*32px;[^}]*height:\s*32px;/s);
});
