import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'vitest';

test('DockIconView 分离 UI 图标与资源图标', async () => {
  const source = await readFile(new URL('../../components/dock-icon/index.tsx', import.meta.url), 'utf8');

  assert.match(source, /case 'ui'/);
  assert.match(source, /case 'asset'/);
  assert.match(source, /assertNever/);
});
