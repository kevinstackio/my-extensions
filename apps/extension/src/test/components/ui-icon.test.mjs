import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'vitest';

test('UiIcon 只静态导入批准的 Lucide 图标', async () => {
  const source = await readFile(new URL('../../components/ui/ui-icon.tsx', import.meta.url), 'utf8');

  assert.match(source, /import \{ Blocks, BrushCleaning, Wrench/);
  assert.match(source, /blocks:\s*Blocks/);
  assert.match(source, /'brush-cleaning':\s*BrushCleaning/);
  assert.match(source, /wrench:\s*Wrench/);
  assert.doesNotMatch(source, /import \* as|lucide-react\/dynamic/);
});
