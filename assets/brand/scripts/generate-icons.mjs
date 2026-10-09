import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const moduleIndex = process.argv.indexOf('--sharp-module');
const sharpModule = moduleIndex >= 0 ? resolve(process.argv[moduleIndex + 1]) : 'sharp';
const sharp = require(sharpModule);
const version = require(`${sharpModule}/package.json`).version;
if (version !== '0.35.5') throw new Error(`需要 Sharp 0.35.5，当前为 ${version}`);

const brand = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(brand, '../..');
const source = await readFile(resolve(brand, 'exts.svg'), 'utf8');
if (!source.includes('viewBox="0 0 1254 1254"')) throw new Error('源稿画布不符合已确认规格');

async function save(relativePath, data) {
  const path = resolve(root, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}

// Composer 使用无预裁遮罩的透明主体图层，最终圆角由 Apple 管线生成。
const foreground = source
  .replace('  <rect width="1254" height="1254" fill="#000000"/>\n', '')
  .replace('width="1254" height="1254" role=', 'width="1024" height="1024" role=');
await save('assets/brand/macos/composer-layers/foreground.svg', foreground);

const icon = resolve(brand, 'macos/exts.icon');
const document = JSON.parse(await readFile(resolve(icon, 'icon.json'), 'utf8'));
if (document.groups.length !== 1 || document.groups[0].layers.length !== 1) {
  throw new Error('请先通过 Icon Composer 创建单主体的正式工程');
}
await save('assets/brand/macos/exts.icon/Assets/foreground.svg', foreground);
await cp(icon, resolve(root, 'apps/desktop/src/resources/exts.icon'), { recursive: true });

if (process.argv.includes('--prepare-composer')) {
  console.log('已同步最新主体；请关闭后重开 Composer 工程，再导出 Default 1024px 图标。');
  process.exit(0);
}

// 全平台使用 Apple 正式渲染，保留唯一矢量源稿作为可编辑输入。
const finalPath = resolve(brand, 'macos/exts-final.png');
const finalImage = await readFile(finalPath);
const provenance = JSON.parse(await readFile(resolve(brand, 'macos/exts-final.json'), 'utf8'));
const digest = (data) => createHash('sha256').update(data).digest('hex');
if (provenance.sourceSha256 !== digest(source) || provenance.imageSha256 !== digest(finalImage)) {
  throw new Error('主体或正式导出已变化，请重新导出并核对版本后更新 exts-final.json，禁止混用新旧资源');
}
const finalMetadata = await sharp(finalImage).metadata();
if (finalMetadata.width !== 1024 || finalMetadata.height !== 1024 || !finalMetadata.hasAlpha) {
  throw new Error('请从最新 Icon Composer 工程导出 1024px 透明背景的 macOS Default 图标');
}
async function png(size, padding = 0) {
  const artwork = size - padding * 2;
  return sharp(finalImage)
    .resize(artwork, artwork, { kernel: 'lanczos3', withoutEnlargement: true })
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background: '#00000000' })
    .toColourspace('srgb').png().toBuffer();
}
for (const size of [16, 32, 48, 128]) {
  const data = await png(size, size >= 48 ? size / 8 : 0);
  await save(`assets/brand/extension/exts-${size}.png`, data);
  await save(`apps/extension/src/assets/logo/exts-${size}.png`, data);
}
// SVG 是正式渲染的自包含封装，不把位图封装宣称为纯矢量图形。
const presentation = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-label="exts"><image width="1024" height="1024" href="data:image/png;base64,${finalImage.toString('base64')}"/></svg>\n`;
await save('assets/brand/website/exts.svg', presentation);
await save('apps/website/public/exts.svg', presentation);
for (const size of [16, 32, 180, 192, 512]) {
  const data = await png(size);
  await save(`assets/brand/website/exts-${size}.png`, data);
  await save(`apps/website/public/exts-${size}.png`, data);
}

console.log('已同步 Apple 正式外形的全部图标与唯一主体的 macOS 工程。');
