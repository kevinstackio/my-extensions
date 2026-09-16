import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'vitest';

import {
  assertBudget,
  createBundleSizeWarningHook,
  measureBuild,
  warnBudget,
} from '../../scripts/bundle-size.mjs';

test('生产体积按全部 JS、CSS 与 WOFF2 统一统计', async () => {
  const root = await mkdtemp(join(tmpdir(), 'my-tabs-size-'));

  try {
    await mkdir(join(root, 'assets'));
    await writeFile(join(root, 'app.js'), 'export const value = 1;');
    await writeFile(join(root, 'app.css'), ':root{color:black}');
    await writeFile(join(root, 'assets', 'Geist-Variable.woff2'), Buffer.alloc(16));

    const metrics = await measureBuild(root);

    assert.equal(metrics.js.files, 1);
    assert.equal(metrics.css.files, 1);
    assert.equal(metrics.font.files, 1);
    assert.equal(metrics.font.bytes, 16);
    assert.equal(metrics.sourceMaps.files, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('超过 JS gzip 增量预算时给出可诊断错误', () => {
  assert.throws(
    () => assertBudget(
      { js: { gzip: 41 }, css: { gzip: 10 }, font: { files: 1, bytes: 16 } },
      {
        baseline: { jsGzip: 10, cssGzip: 10 },
        limits: { jsGzipDelta: 30, cssGzipDelta: 10, fontBytes: 70 },
      },
    ),
    /JS gzip 增量 31B 超过预算 30B/,
  );
});

test('开发构建超过预算时只输出预警，不阻断构建', async () => {
  const root = await mkdtemp(join(tmpdir(), 'my-tabs-warning-'));
  const budgetPath = join(root, 'bundle-budget.json');
  const warnings = [];

  try {
    await writeFile(join(root, 'app.js'), 'export const value = 1;');
    await writeFile(budgetPath, JSON.stringify({
      baseline: { jsGzip: 0, cssGzip: 0 },
      limits: { jsGzipDelta: 0, cssGzipDelta: 0, fontBytes: 70 * 1024 },
    }));

    const result = await warnBudget(root, budgetPath, {
      warn: (message) => warnings.push(message),
    });

    assert.equal(result.warnings.length, 1);
    assert.match(warnings[0], /包体积预警/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('包体积预警钩子只在 WXT serve 构建中执行', async () => {
  const root = await mkdtemp(join(tmpdir(), 'my-tabs-hook-'));
  const budgetPath = join(root, 'bundle-budget.json');
  const hookWarnings = [];
  const hook = createBundleSizeWarningHook({ budgetPath });

  try {
    await writeFile(join(root, 'app.js'), 'export const value = 1;');
    await writeFile(budgetPath, JSON.stringify({
      baseline: { jsGzip: 0, cssGzip: 0 },
      limits: { jsGzipDelta: 0, cssGzipDelta: 0, fontBytes: 70 * 1024 },
    }));

    await hook({
      config: { command: 'serve', outDir: root },
      logger: { warn: (message) => hookWarnings.push(message) },
    });
    assert.equal(hookWarnings.length, 1);

    await hook({
      config: { command: 'build', outDir: root },
      logger: { warn: () => hookWarnings.push('unexpected') },
    });
    assert.equal(hookWarnings.length, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
