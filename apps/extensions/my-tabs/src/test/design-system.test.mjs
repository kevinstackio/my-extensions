import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile, stat } from 'node:fs/promises';
import { test } from 'vitest';

const projectRoot = new URL('../../', import.meta.url);

async function readProjectFile(relativePath) {
  return readFile(new URL(relativePath, projectRoot), 'utf8');
}

test('Tailwind 与 shadcn 基础依赖使用精确版本', async () => {
  const packageJson = JSON.parse(await readProjectFile('package.json'));

  assert.equal(packageJson.devDependencies.tailwindcss, '4.3.3');
  assert.equal(packageJson.devDependencies['@tailwindcss/vite'], '4.3.3');
  assert.equal(packageJson.dependencies['class-variance-authority'], '0.7.1');
  assert.equal(packageJson.dependencies.clsx, '2.1.1');
  assert.equal(packageJson.dependencies['tailwind-merge'], '3.7.0');
  assert.equal(packageJson.dependencies['radix-ui'], '1.6.7');
});

test('Lucide 与受控 UI 原语使用批准的精确依赖', async () => {
  const packageJson = JSON.parse(await readProjectFile('package.json'));

  assert.equal(packageJson.dependencies['lucide-react'], '1.46.0');
  assert.equal(packageJson.dependencies['radix-ui'], '1.6.7');
  assert.equal(Object.keys(packageJson.dependencies).some((name) => name.startsWith('@radix-ui/react-')), false);
});

test('shadcn 配置和项目路径别名指向 src', async () => {
  const components = JSON.parse(await readProjectFile('components.json'));
  const tsconfig = JSON.parse(await readProjectFile('tsconfig.json'));

  assert.equal(components.style, 'new-york');
  assert.equal(components.rsc, false);
  assert.equal(components.tailwind.css, 'src/styles/index.css');
  assert.equal(components.tailwind.cssVariables, true);
  assert.equal(components.aliases.ui, '@/components/ui');
  assert.deepEqual(tsconfig.compilerOptions.paths['@/*'], ['./src/*']);
});

test('WXT 接入 Tailwind 插件并保留稳定开发配置', async () => {
  const config = await readProjectFile('wxt.config.ts');

  assert.match(config, /import\s+tailwindcss\s+from\s+['"]@tailwindcss\/vite['"]/);
  assert.match(config, /plugins:\s*\[tailwindcss\(\)\]/s);
  assert.match(config, /optimizeDeps:\s*\{[\s\S]*entries:/);
  assert.match(config, /createStableDevelopmentHooks\(\)/);
});

test('WXT 开发构建完成后执行包体积预警', async () => {
  const config = await readProjectFile('wxt.config.ts');

  assert.match(config, /createBundleSizeWarningHook/);
  assert.match(config, /'build:done':\s*async/);
  assert.match(config, /bundleSizeWarningHook\(wxt, output\)/);
});

test('React 入口只加载唯一 Tailwind CSS 入口', async () => {
  const main = await readProjectFile('src/entrypoints/newtab/main.tsx');
  const html = await readProjectFile('src/entrypoints/newtab/index.html');

  assert.match(main, /import\s+['"]\.\.\/\.\.\/styles\/index\.css['"]/);
  assert.doesNotMatch(html, /<link rel="stylesheet"/);
});

test('项目提供 cn 工具和 shadcn Separator 原语', async () => {
  const utils = await readProjectFile('src/lib/utils.ts');
  const separator = await readProjectFile('src/components/ui/separator.tsx');

  assert.match(utils, /function cn\(/);
  assert.match(utils, /twMerge\(clsx\(inputs\)\)/);
  assert.match(separator, /Separator/);
  await access(new URL('src/components/ui/separator.tsx', projectRoot));
});

test('Geist Sans 资源带许可证、来源记录和固定哈希', async () => {
  const fontUrl = new URL('src/assets/fonts/Geist-Variable.woff2', projectRoot);
  const fontBuffer = await readFile(fontUrl);
  const fontMetadata = await stat(fontUrl);
  const source = await readProjectFile('src/assets/fonts/SOURCE.md');
  const license = await readProjectFile('src/assets/fonts/OFL.txt');
  const css = await readProjectFile('src/styles/index.css');
  const hash = createHash('sha256').update(fontBuffer).digest('hex');

  assert.equal(fontMetadata.size <= 70 * 1024, true);
  assert.equal(fontMetadata.size, 69652);
  assert.match(source, /版本：1\.7\.2/);
  assert.match(source, new RegExp(`SHA-256：${hash}`));
  assert.match(source, /https:\/\/github\.com\/vercel\/geist-font/);
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(css, /font-family:\s*["']Geist Sans["']/);
  assert.match(css, /font-display:\s*swap/);
  assert.match(css, /font-weight:\s*400 600/);
  assert.match(css, /Geist-Variable\.woff2/);
});
