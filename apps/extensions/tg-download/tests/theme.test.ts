import { describe, expect, it, vi } from 'vitest';

import {
  actionIconPaths,
  createThemeMessage,
  handleThemeMessage,
  isThemeMessage,
  watchSystemTheme,
} from '../src/features/theme';

describe('系统主题同步', () => {
  it('系统深色主题通知扩展使用白线图标', () => {
    expect(createThemeMessage(true)).toEqual({
      type: 'tg-download-theme',
      theme: 'light',
    });
  });

  it('系统浅色主题通知扩展使用黑线图标', () => {
    expect(createThemeMessage(false)).toEqual({
      type: 'tg-download-theme',
      theme: 'dark',
    });
  });

  it('工具栏图标使用 public 中的固定路径', () => {
    expect(actionIconPaths.light).toEqual({
      16: '/icon/tg-download-light-16.png',
      32: '/icon/tg-download-light-32.png',
      48: '/icon/tg-download-light-48.png',
      128: '/icon/tg-download-light-128.png',
    });
  });

  it('只接受合法的主题同步消息', () => {
    expect(isThemeMessage(createThemeMessage(true))).toBe(true);
    expect(isThemeMessage({ type: 'other', theme: 'light' })).toBe(false);
    expect(isThemeMessage(null)).toBe(false);
  });

  it('初始化并监听系统主题变化', () => {
    const listeners: Array<() => void> = [];
    const colorScheme = {
      matches: true,
      addEventListener: (_type: 'change', listener: () => void) => listeners.push(listener),
    };
    const messages: unknown[] = [];

    watchSystemTheme(colorScheme, message => messages.push(message));
    colorScheme.matches = false;
    listeners[0]?.();

    expect(messages).toEqual([
      { type: 'tg-download-theme', theme: 'light' },
      { type: 'tg-download-theme', theme: 'dark' },
    ]);
  });

  it('后台只为合法消息更新工具栏图标', () => {
    const setIcon = vi.fn();

    handleThemeMessage({ type: 'tg-download-theme', theme: 'light' }, setIcon);
    handleThemeMessage({ type: 'other' }, setIcon);

    expect(setIcon).toHaveBeenCalledOnce();
    expect(setIcon).toHaveBeenCalledWith({ path: actionIconPaths.light });
  });
});
