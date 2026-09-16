import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { act, createElement } from 'react';
import { Popover } from '../../components/popover/index.tsx';
import { renderReact } from '../helpers/react-dom.mjs';

const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

function renderPopover(props = {}) {
  return renderReact(createElement(Popover, {
    trigger: createElement('button', { type: 'button', className: 'trigger' }, 'Tools'),
    children: createElement('ul', { className: 'content' }, createElement('li', null, 'Item')),
    ...props,
  }));
}

test('通用 Popover 支持打开、Esc 关闭并恢复触发器焦点', async () => {
  const view = await renderPopover();

  try {
    const trigger = view.container.querySelector('.trigger');
    const popover = view.container.querySelector('.popover');
    await act(async () => trigger.click());
    assert.equal(popover.hidden, false);
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');

    await act(async () => popover.dispatchEvent(new view.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert.equal(popover.hidden, true);
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(view.document.activeElement, trigger);
  } finally {
    await view.cleanup();
  }
});

test('通用 Popover 会由触发器的鼠标、焦点和点击行为打开', async () => {
  const view = await renderPopover();

  try {
    const trigger = view.container.querySelector('.trigger');
    const popover = view.container.querySelector('.popover');
    const openBy = async (event) => {
      await act(async () => trigger.dispatchEvent(event));
      assert.equal(popover.hidden, false);
      await act(async () => popover.dispatchEvent(new view.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    };

    await openBy(new view.window.MouseEvent('mouseover', { bubbles: true }));
    await openBy(new view.window.FocusEvent('focusin', { bubbles: true }));
    await openBy(new view.window.MouseEvent('click', { bubbles: true }));
  } finally {
    await view.cleanup();
  }
});

test('通用 Popover 鼠标离开后延迟关闭，回到触发器或浮层会取消关闭', async () => {
  const view = await renderPopover();

  try {
    const trigger = view.container.querySelector('.trigger');
    const popover = view.container.querySelector('.popover');
    const mouse = (target, type) => target.dispatchEvent(new view.window.MouseEvent(type, { bubbles: true }));

    await act(async () => mouse(trigger, 'mouseover'));
    await act(async () => {
      mouse(trigger, 'mouseout');
      mouse(popover, 'mouseover');
      await sleep(180);
    });
    assert.equal(popover.hidden, false);

    await act(async () => {
      mouse(popover, 'mouseout');
      mouse(trigger, 'mouseover');
      await sleep(180);
    });
    assert.equal(popover.hidden, false);

    await act(async () => {
      mouse(trigger, 'mouseout');
      await sleep(180);
    });
    assert.equal(popover.hidden, true);
  } finally {
    await view.cleanup();
  }
});

test('通用 Popover 点击浮层外部会关闭并恢复触发器焦点', async () => {
  const view = await renderPopover();

  try {
    const trigger = view.container.querySelector('.trigger');
    const popover = view.container.querySelector('.popover');
    await act(async () => trigger.click());
    assert.equal(popover.hidden, false);

    await act(async () => view.document.body.dispatchEvent(new view.window.MouseEvent('mousedown', { bubbles: true })));
    assert.equal(popover.hidden, true);
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(view.document.activeElement, trigger);
  } finally {
    await view.cleanup();
  }
});

test('通用 Popover 使用双层伪元素绘制可配置方位的箭头', async () => {
  const view = await renderPopover({ placement: 'bottom', showArrow: false });
  const styles = await readFile(new URL('../../components/popover/index.css', import.meta.url), 'utf8');

  try {
    const popover = view.container.querySelector('.popover');
    assert.equal(popover.dataset.placement, 'bottom');
    assert.equal(popover.dataset.arrow, 'false');
    assert.match(styles, /\.popover::before,\s*\.popover::after\s*\{/s);
    assert.match(styles, /\.popover\[data-placement='bottom'\]::before\s*\{/s);
    assert.match(styles, /background:\s*var\(--popover\)/);
    assert.match(styles, /color:\s*var\(--popover-foreground\)/);
    assert.match(styles, /border:\s*1px solid var\(--border\)/);
    assert.match(styles, /box-shadow:\s*var\(--shadow-floating\)/);
  } finally {
    await view.cleanup();
  }
});
