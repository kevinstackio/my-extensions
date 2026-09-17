// @vitest-environment happy-dom

import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { act, createElement } from 'react';
import { DOCK_COMPONENTS, DOCK_DEVTOOLS, DOCK_FAVORITES } from '../../constants/bookmarks.ts';
import { BookmarkDock } from '../../views/bookmarks/bookmark-dock.tsx';
import { TooltipProvider } from '../../components/ui/tooltip.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

function createDock(props = {}) {
  return createElement(
    TooltipProvider,
    { delayDuration: 0 },
    createElement(BookmarkDock, {
      favorites: [DOCK_FAVORITES[0]],
      components: DOCK_COMPONENTS,
      devtools: DOCK_DEVTOOLS,
      ...props,
    }),
  );
}

test('Dock 将直接收藏、Components 和 DevTools 按固定顺序渲染', async () => {
  const view = await renderReact(createDock({ favorites: [DOCK_FAVORITES[0]] }));

  try {
    const dock = view.container.querySelector('.bookmark-dock');
    const groups = dock.querySelectorAll('.bookmark-dock__group');
    assert.equal(dock.querySelectorAll('.bookmark-dock__favorites > .bookmark-card').length, 1);
    assert.equal(dock.querySelector('[data-slot="separator"]').getAttribute('aria-hidden'), 'true');
    assert.equal(groups.length, 2);
    assert.equal(groups[0].querySelector('button').getAttribute('aria-label'), '打开 Components 工具列表');
    assert.equal(groups[1].querySelector('button').getAttribute('aria-label'), '打开 DevTools 工具列表');
    assert.match(groups[0].querySelector('svg').getAttribute('class'), /lucide-blocks/);
    assert.match(groups[1].querySelector('svg').getAttribute('class'), /lucide-wrench/);
    for (const group of groups) {
      assert.match(group.querySelector('.bookmark-card__icon').className, /(?:^| )border-border(?: |$)/);
      assert.equal(group.querySelector('.bookmark-card__icon img'), null);
    }
  } finally {
    await view.cleanup();
  }
});

test('Dock 中选择工具后将书签与所属分组交给外层业务', async () => {
  const opened = [];
  const view = await renderReact(createDock({
    favorites: [],
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
  const source = await readFile('src/views/bookmarks/bookmark-dock.tsx', 'utf8');
  const styles = await readFile('src/components/popover/index.css', 'utf8');

  assert.match(source, /<Separator orientation="vertical" className="mx-2 h-16" aria-hidden="true" \/>/);
  assert.match(source, /bookmark-dock__favorites flex flex-nowrap gap-2/);
  assert.match(source, /bookmark-dock__tools flex flex-nowrap gap-2/);
  assert.match(source, /bookmark-dock__group relative flex/);
  assert.doesNotMatch(source, /\[&>\.popover\]/);
  assert.match(styles, /\.bookmark-dock__group\s*>\s*\.popover\s*\{/s);
  assert.match(styles, /\.bookmark-dock__group\s*>\s*\.popover\s*\{[\s\S]*position:\s*absolute/s);
  assert.match(styles, /\.bookmark-dock__group\s*>\s*\.popover\s*\{[\s\S]*bottom:\s*calc\(100%\s*\+\s*12px\)/s);
  assert.doesNotMatch(source, /bookmark-dock__divider/);
  assert.match(source, /group-hover:bg-accent/);
  assert.match(source, /group-aria-expanded:bg-accent/);
  assert.doesNotMatch(source, /(?:hover|focus-visible|aria-expanded):border-border-strong/);
  assert.doesNotMatch(source, /group-(?:hover|focus-visible|aria-expanded):border-border-strong/);
});

test('Dock 直接书签获得键盘焦点时显示名称 Tooltip', async () => {
  const view = await renderReact(createDock());

  try {
    await act(async () => view.container.querySelector('.bookmark-dock__favorites .bookmark-card').focus());
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    const tooltips = view.document.body.querySelectorAll('[role="tooltip"]');
    assert.equal(tooltips.length, 1);
    assert.equal(tooltips[0].textContent, 'ChatGPT');
  } finally {
    await view.cleanup();
  }
});

test('Dock 直接书签鼠标悬停时显示名称 Tooltip', async () => {
  const view = await renderReact(createDock());

  try {
    await act(async () => {
      view.container.querySelector('.bookmark-dock__favorites .bookmark-card').dispatchEvent(
        new view.window.PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse' }),
      );
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    const tooltips = view.document.body.querySelectorAll('[role="tooltip"]');
    assert.equal(tooltips.length, 1);
    assert.equal(tooltips[0].textContent, 'ChatGPT');
  } finally {
    await view.cleanup();
  }
});

test('Dock 工具分组继续使用旧 Popover 且不显示 Tooltip', async () => {
  const view = await renderReact(createDock({ favorites: [] }));

  try {
    const groupButton = view.container.querySelector('.bookmark-dock__group button');
    await act(async () => groupButton.focus());
    assert.equal(view.container.querySelector('.bookmark-dock__group .popover').hidden, false);
    assert.equal(view.document.body.querySelectorAll('[role="tooltip"]').length, 0);
  } finally {
    await view.cleanup();
  }
});
