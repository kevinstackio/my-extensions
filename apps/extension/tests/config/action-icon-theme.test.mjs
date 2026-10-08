import { test } from 'vitest';
import assert from 'node:assert/strict';
import { installActionIconTheme } from '../../src/app/action-icon-theme.js';

// 只验证配色偏好到浏览器图标路径的分派，不模拟 DOM 或指针交互。
test('系统明暗偏好选择同构的黑白工具栏图标', () => {
  const previous = globalThis.chrome;
  const calls = [];
  let changed;
  const preference = { matches: false, addEventListener(_event, callback) { changed = callback; } };
  globalThis.chrome = { action: { setIcon({ path }) { calls.push(path); } } };
  try {
    installActionIconTheme({ matchMedia() { return preference; } }, undefined);
    preference.matches = true;
    changed();
    assert.equal(calls[0][16], '/src/assets/logo/exts-16.png');
    assert.equal(calls[1][16], '/src/assets/logo/exts-light-16.png');
    for (const size of [16, 32, 48, 128]) assert.equal(calls[1][size], `/src/assets/logo/exts-light-${size}.png`);
  } finally {
    if (previous === undefined) delete globalThis.chrome;
    else globalThis.chrome = previous;
  }
});
