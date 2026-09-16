import { gzipSync } from 'node:zlib';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const defaultBuildDirectory = resolve(projectDirectory, 'dist/chrome-mv3');
const defaultDevelopmentBuildDirectory = resolve(projectDirectory, 'dist/chrome-mv3-dev');
const defaultBudgetPath = resolve(projectDirectory, 'bundle-budget.json');

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function createMetric() {
  return { files: 0, bytes: 0, gzip: 0 };
}

function addFileMetric(metric, buffer) {
  metric.files += 1;
  metric.bytes += buffer.byteLength;
  metric.gzip += gzipSync(buffer, { level: 9, mtime: 0 }).byteLength;
}

/** 递归统计 WXT 生产目录中可影响预算的文件。 */
export async function measureBuild(buildDirectory) {
  const files = await collectFiles(buildDirectory);
  const metrics = {
    js: createMetric(),
    css: createMetric(),
    font: { files: 0, bytes: 0 },
    sourceMaps: { files: 0, bytes: 0 },
    total: { files: 0, bytes: 0 },
    maxFile: { path: '', bytes: 0 },
  };

  for (const filePath of files) {
    const buffer = await readFile(filePath);
    const bytes = buffer.byteLength;
    const extension = extname(filePath).toLowerCase();
    const relativePath = relative(buildDirectory, filePath).replaceAll('\\', '/');

    if (extension === '.map') {
      metrics.sourceMaps.files += 1;
      metrics.sourceMaps.bytes += bytes;
      continue;
    }

    metrics.total.files += 1;
    metrics.total.bytes += bytes;

    if (bytes > metrics.maxFile.bytes) {
      metrics.maxFile = { path: relativePath, bytes };
    }

    if (extension === '.js') addFileMetric(metrics.js, buffer);
    if (extension === '.css') addFileMetric(metrics.css, buffer);
    if (extension === '.woff2') {
      metrics.font.files += 1;
      metrics.font.bytes += bytes;
    }
  }

  return metrics;
}

/** 返回超过预算的项目；开发构建使用这些结果做预警而不是阻断。 */
export function getBudgetWarnings(current, budget) {
  const warnings = [];
  const jsDelta = current.js.gzip - budget.baseline.jsGzip;
  const cssDelta = current.css.gzip - budget.baseline.cssGzip;

  if (jsDelta > budget.limits.jsGzipDelta) {
    warnings.push(`JS gzip 增量 ${jsDelta}B 超过预算 ${budget.limits.jsGzipDelta}B`);
  }

  if (cssDelta > budget.limits.cssGzipDelta) {
    warnings.push(`CSS gzip 增量 ${cssDelta}B 超过预算 ${budget.limits.cssGzipDelta}B`);
  }

  if (current.font.files > 1) {
    warnings.push(`字体文件数量 ${current.font.files} 个超过允许的 1 个`);
  }

  if (current.font.bytes > budget.limits.fontBytes) {
    warnings.push(`字体体积 ${current.font.bytes}B 超过预算 ${budget.limits.fontBytes}B`);
  }

  return warnings;
}

/** 校验主题迁移后的 JS、CSS 和字体增量预算。 */
export function assertBudget(current, budget) {
  const warnings = getBudgetWarnings(current, budget);
  if (warnings.length > 0) {
    throw new Error(warnings.join('；'));
  }
}

/** 开发构建只记录包体积预警，不能因为体积变化阻断 WXT 的持续开发进程。 */
export async function warnBudget(buildDirectory, budgetPath, logger = console) {
  try {
    const [current, budget] = await Promise.all([
      measureBuild(buildDirectory),
      loadBudget(budgetPath),
    ]);
    const warnings = getBudgetWarnings(current, budget);

    if (warnings.length > 0) {
      logger.warn?.(`包体积预警：${warnings.join('；')}`);
    } else {
      logger.info?.(`包体积检查通过：JS gzip ${current.js.gzip}B，CSS gzip ${current.css.gzip}B，字体 ${current.font.bytes}B`);
    }

    return { current, warnings };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn?.(`包体积预警无法完成：${message}`);
    return { current: null, warnings: [message] };
  }
}

/** 创建仅在 WXT 开发构建完成后执行的包体积预警钩子。 */
export function createBundleSizeWarningHook({ budgetPath = defaultBudgetPath } = {}) {
  return async (wxt, _output) => {
    if (wxt.config.command !== 'serve') return;

    const logger = {
      warn: (message) => {
        if (typeof wxt.logger?.warn === 'function') wxt.logger.warn(message);
        else console.warn(message);
      },
      info: (message) => {
        if (typeof wxt.logger?.info === 'function') wxt.logger.info(message);
        else console.info(message);
      },
    };

    return warnBudget(wxt.config.outDir, budgetPath, logger);
  };
}

async function loadBudget(budgetPath) {
  return JSON.parse(await readFile(budgetPath, 'utf8'));
}

async function writeBaseline(buildDirectory, budgetPath) {
  const current = await measureBuild(buildDirectory);
  const budget = {
    baseline: {
      jsGzip: current.js.gzip,
      cssGzip: current.css.gzip,
      fontBytes: current.font.bytes,
      fontFiles: current.font.files,
      totalBytes: current.total.bytes,
    },
    limits: {
      jsGzipDelta: 30 * 1024,
      cssGzipDelta: 10 * 1024,
      fontBytes: 70 * 1024,
    },
    measurement: {
      directory: 'dist/chrome-mv3',
      excludes: ['*.map'],
      gzip: 'node:zlib.gzipSync(level=9, mtime=0)',
    },
  };

  await writeFile(budgetPath, `${JSON.stringify(budget, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ baseline: budget.baseline, current }, null, 2));
}

async function checkBudget(buildDirectory, budgetPath) {
  const [current, budget] = await Promise.all([
    measureBuild(buildDirectory),
    loadBudget(budgetPath),
  ]);

  assertBudget(current, budget);
  console.log(JSON.stringify({ budget: budget.limits, current }, null, 2));
}

const command = process.argv[2];

if (command === '--write-baseline') {
  await writeBaseline(defaultBuildDirectory, defaultBudgetPath);
} else if (command === '--check') {
  await checkBudget(defaultBuildDirectory, defaultBudgetPath);
} else if (command === '--warn') {
  await warnBudget(defaultDevelopmentBuildDirectory, defaultBudgetPath);
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.error('用法：node scripts/bundle-size.mjs --write-baseline|--check|--warn');
  process.exitCode = 1;
}
