import { test } from 'vitest';
import assert from 'node:assert/strict';
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

// 验证通用书签卡片名称使用语义字重类以提高辨识度。
test('通用书签卡片名称使用加粗字重', async () => {
  const view = await renderReact(createElement(BookmarkCard, { bookmark: github }));

  try {
    assert.match(view.container.querySelector('.bookmark-card__name').className, /font-semibold/);
  } finally {
    await view.cleanup();
  }
});

// 验证通用书签卡片图标固定为 64 像素方形，SVG 保持居中的 32 像素尺寸。
test('通用书签卡片图标使用固定尺寸与独立圆角', async () => {
  const view = await renderReact(createElement(BookmarkCard, { bookmark: github }));

  try {
    const container = view.container.querySelector('.bookmark-card__icon');
    const icon = container.querySelector('img');
    assert.match(container.className, /h-16/);
    assert.match(container.className, /w-16/);
    assert.match(container.className, /border-border/);
    assert.match(icon.className, /h-8/);
    assert.match(icon.className, /w-8/);
  } finally {
    await view.cleanup();
  }
});

test('书签卡片声明 grid、dock 和 preview 三种视觉变体', async () => {
  const variants = ['grid', 'dock', 'preview'];

  for (const variant of variants) {
    const view = await renderReact(createElement(BookmarkCard, { bookmark: github, variant }));

    try {
      assert.equal(view.container.querySelector('a.bookmark-card').dataset.variant, variant);
    } finally {
      await view.cleanup();
    }
  }
});
