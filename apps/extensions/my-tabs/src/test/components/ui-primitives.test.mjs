// @vitest-environment happy-dom

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { act, createElement } from 'react';
import { test } from 'vitest';

import { Button } from '../../components/ui/button.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

test('Button 与 Tooltip 原语不依赖书签或 Chrome 业务', async () => {
  for (const path of ['../../components/ui/button.tsx', '../../components/ui/tooltip.tsx']) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /constants\/bookmarks|types\/bookmarks|chrome\./);
  }
});

test('Button asChild 不增加第二个交互节点', async () => {
  const view = await renderReact(createElement(
    Button,
    { asChild: true },
    createElement('a', { href: 'https://example.com' }, 'Example'),
  ));

  try {
    assert.equal(view.container.querySelectorAll('a').length, 1);
    assert.equal(view.container.querySelectorAll('button').length, 0);
    assert.equal(view.container.querySelector('a').dataset.slot, 'button');
  } finally {
    await view.cleanup();
  }
});

function createTooltipSubject() {
  return createElement(
    TooltipProvider,
    { delayDuration: 0 },
    createElement(
      Tooltip,
      null,
      createElement(
        TooltipTrigger,
        { asChild: true },
        createElement('a', { href: 'https://example.com' }, 'Example'),
      ),
      createElement(TooltipContent, { side: 'top' }, 'Example'),
    ),
  );
}

test('Tooltip 在触发器获得键盘焦点时显示名称', async () => {
  const view = await renderReact(createTooltipSubject());

  try {
    await act(async () => view.container.querySelector('a').focus());
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    const tooltips = view.document.body.querySelectorAll('[role="tooltip"]');
    assert.equal(tooltips.length, 1, view.document.body.innerHTML);
    assert.equal(tooltips[0].textContent, 'Example');
  } finally {
    await view.cleanup();
  }
});

test('Tooltip 在鼠标指针悬停触发器时显示名称', async () => {
  const view = await renderReact(createTooltipSubject());

  try {
    await act(async () => {
      view.container.querySelector('a').dispatchEvent(new view.window.PointerEvent('pointermove', {
        bubbles: true,
        pointerType: 'mouse',
      }));
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    const tooltips = view.document.body.querySelectorAll('[role="tooltip"]');
    assert.equal(tooltips.length, 1, view.document.body.innerHTML);
    assert.equal(tooltips[0].textContent, 'Example');
  } finally {
    await view.cleanup();
  }
});
