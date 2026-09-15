import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { act, createElement } from 'react';
import { BookmarkFolder } from '../../components/bookmark-folder/index.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

const socialMedia = {
  id: 'social-media',
  name: 'Social Media',
  items: [{ id: 'x', name: 'X', url: 'https://x.com', icon: 'brand/x.svg' }],
};

const edu = {
  id: 'edu',
  name: 'EDU',
  blur: true,
  items: [{ id: 'pmi', name: 'PMI', url: 'https://www.pmi.org/', icon: 'brand/text-pmi.svg' }],
};

// 验证 React 文件夹保持四格预览结构，并将书签选择交给外层业务。
test('书签文件夹点击单个图标后上报所属标签组', async () => {
  const openedBookmarks = [];
  const view = await renderReact(createElement(BookmarkFolder, {
    folder: socialMedia,
    onOpenBookmark: (targetFolder, bookmark) => openedBookmarks.push({ targetFolder, bookmark }),
  }));

  try {
    const folder = view.container.querySelector('section.bookmark-folder');
    const preview = folder.querySelector('.bookmark-folder__preview');
    const link = preview.querySelector('a.bookmark-card');

    assert.equal(folder.getAttribute('aria-label'), 'Social Media');
    assert.equal(preview.children.length, 4);
    assert.equal(preview.querySelectorAll('.bookmark-folder__placeholder').length, 3);
    assert.equal(preview.querySelector('.bookmark-folder__placeholder').getAttribute('aria-hidden'), 'true');
    assert.equal(folder.querySelector('.bookmark-folder__name').textContent, 'Social Media');

    await act(async () => link.click());
    assert.deepEqual(openedBookmarks, [{ targetFolder: socialMedia, bookmark: socialMedia.items[0] }]);
  } finally {
    await view.cleanup();
  }
});

// 验证解除遮罩后焦点转移到第一个书签，遮罩自身不再成为 aria-hidden 焦点节点。
test('带 blur 配置的文件夹解除遮罩并聚焦首个书签', async () => {
  const view = await renderReact(createElement(BookmarkFolder, { folder: edu }));

  try {
    const folder = view.container.querySelector('section.bookmark-folder');
    const firstBookmark = folder.querySelector('a.bookmark-card');
    const blurButton = folder.querySelector('button.bookmark-folder__blur');

    assert.match(folder.className, /bookmark-folder--blurred/);
    assert.equal(blurButton.getAttribute('aria-label'), '点击显示 EDU 书签');
    assert.equal(blurButton.querySelector('img').getAttribute('src'), 'src/assets/icons/brush-cleaning.svg');

    blurButton.focus();
    await act(async () => blurButton.click());

    assert.equal(folder.className, 'bookmark-folder');
    assert.match(blurButton.className, /bookmark-folder__blur--hidden/);
    assert.equal(blurButton.hasAttribute('aria-hidden'), false);
    assert.equal(view.document.activeElement, firstBookmark);
  } finally {
    await view.cleanup();
  }
});

// 验证文件夹由固定内边距和内部书签间距自然撑开。
test('书签文件夹不设宽高并使用固定的内部间距', async () => {
  const styles = await readFile(new URL('../../components/bookmark-folder/index.css', import.meta.url), 'utf8');

  assert.match(styles, /\.bookmark-folder\s*\{[^}]*box-sizing:\s*border-box;[^}]*display:\s*grid;[^}]*justify-self:\s*start;/s);
  assert.doesNotMatch(styles, /\.bookmark-folder\s*\{[^}]*grid-(column|row):/s);
  assert.doesNotMatch(styles, /\.bookmark-folder\s*\{[^}]*\b(width|height):/s);
  assert.match(styles, /\.bookmark-folder__preview\s*\{[^}]*box-sizing:\s*border-box;[^}]*grid-template-columns:\s*repeat\(2,\s*64px\);[^}]*gap:\s*16px;[^}]*padding:\s*16px;[^}]*border-radius:\s*16px;/s);
  assert.doesNotMatch(styles, /\.bookmark-folder__blur:hover,\s*\.bookmark-folder__blur:focus-visible\s*\{/s);
  assert.match(styles, /\.bookmark-folder__blur:hover img,\s*\.bookmark-folder__blur:focus-visible img\s*\{[^}]*transform:\s*translateY\(-2px\) scale\(1\.08\);/s);
  assert.match(styles, /\.bookmark-folder \.bookmark-card\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*64px;[^}]*height:\s*64px;/s);
  assert.match(styles, /\.bookmark-folder__placeholder\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*64px;[^}]*height:\s*64px;/s);
  assert.match(styles, /\.bookmark-folder \.bookmark-card__name\s*\{[^}]*display:\s*none;/s);
});
