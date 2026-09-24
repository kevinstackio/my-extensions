import { readFile } from 'node:fs/promises';

import { describe, expect, it, vi } from 'vitest';

import {
  createDownloadMenu,
  menuPosition,
} from '../src/components/download-menu';

interface FakeNode {
  children: FakeNode[];
  classList: { add(...names: string[]): void; names: string[] };
  className: string;
  dataset: Record<string, string>;
  disabled: boolean;
  listeners: Record<string, () => void>;
  removed: boolean;
  style: Record<string, string>;
  textContent: string;
  append(...items: FakeNode[]): void;
  addEventListener(type: string, listener: () => void): void;
  contains(target: unknown): boolean;
  remove(): void;
  setAttribute(): void;
}

function node(): FakeNode {
  const value: FakeNode = {
    children: [],
    classList: {
      names: [],
      add(...names) { this.names.push(...names); },
    },
    className: '',
    dataset: {},
    disabled: false,
    listeners: {},
    removed: false,
    style: {},
    textContent: '',
    append(...items) { this.children.push(...items); },
    addEventListener(type, listener) { this.listeners[type] = listener; },
    contains(target) { return target === this || this.children.includes(target as FakeNode); },
    remove() { this.removed = true; },
    setAttribute() {},
  };

  return value;
}

function fakeDocument() {
  const body = node();
  return {
    body,
    document: {
      body,
      createElement: () => node(),
    } as unknown as Document,
  };
}

describe('下载菜单', () => {
  it('菜单坐标限制在视口内', () => {
    expect(menuPosition(
      { x: 980, y: 780 },
      { width: 200, height: 120 },
      { width: 1000, height: 800 },
    )).toEqual({ left: 800, top: 680 });
  });

  it('加载状态禁用菜单并可以恢复', () => {
    const { body, document } = fakeDocument();
    const menu = createDownloadMenu(document, vi.fn());

    menu.open({ x: 10, y: 10 });
    expect(body.children).toHaveLength(1);
    const button = body.children[0]!.children[0]!;
    expect(button.children[1]!.textContent).toBe('下载资源');

    menu.loading();
    expect(button.disabled).toBe(true);
    expect(button.dataset.state).toBe('loading');

    menu.result('下载失败');
    menu.ready();
    expect(button.disabled).toBe(false);
    expect(button.children[1]!.textContent).toBe('下载资源');
  });

  it('提示状态保留按钮浮层并追加页面 Toast', () => {
    const { body, document } = fakeDocument();
    const callbacks: Array<() => void> = [];
    const delays: number[] = [];
    const menu = createDownloadMenu(document, vi.fn(), {
      setTimeout(callback, delay) {
        callbacks.push(callback);
        delays.push(delay);
      },
      viewport: () => ({ width: 1000, height: 800 }),
    });

    menu.open({ x: 10, y: 10 });
    const card = body.children[0]!;
    const button = card.children[0]!;
    menu.notice('已开始下载，可在扩展中查看进度', 1200);

    expect(button.removed).toBe(true);
    expect(card.children[1]!.className).toBe('tg-download-menu__notice');
    expect(card.children[1]!.textContent).toBe('已开始下载，可在扩展中查看进度');
    const toast = body.children[1]!;
    expect(toast.className).toBe('tg-download-toast');
    expect(toast.textContent).toBe('已开始下载，可在扩展中查看进度');
    expect(delays).toEqual([1200]);

    callbacks[0]!();
    expect(card.classList.names).toEqual(['tg-download-menu--leaving']);
    expect(toast.classList.names).toEqual(['tg-download-toast--leaving']);
    expect(delays).toEqual([1200, 300, 300]);

    callbacks[1]!();
    expect(card.removed).toBe(true);
    callbacks[2]!();
    expect(toast.removed).toBe(true);
  });

  it('淡出指定时长后关闭菜单', () => {
    const { body, document } = fakeDocument();
    const delays: number[] = [];
    const menu = createDownloadMenu(document, vi.fn(), {
      setTimeout(callback, delay) {
        delays.push(delay);
        callback();
      },
      viewport: () => ({ width: 1000, height: 800 }),
    });

    menu.open({ x: 10, y: 10 });
    expect(body.children).toHaveLength(1);
    const card = body.children[0]!;
    menu.dismiss(300);

    expect(card.classList.names).toEqual(['tg-download-menu--leaving']);
    expect(delays).toEqual([300]);
    expect(card.removed).toBe(true);
  });

  it('菜单样式不内联 SVG，由运行时注入资源 URL', async () => {
    const css = await readFile(
      new URL('../src/components/download-menu/style.css', import.meta.url),
      'utf8',
    );

    expect(css).not.toMatch(/url\(/);
    expect(css).not.toContain('data:image/svg+xml');
  });
});
